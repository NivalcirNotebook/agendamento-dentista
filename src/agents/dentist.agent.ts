import { openaiService } from '../services/openai.service';
import { calendarService } from '../services/calendar.service';
import { ContextService } from '../services/context.service';
import { SYSTEM_PROMPT, FUNCTIONS } from './prompts';
import { logger } from '../utils/logger';
import { formatDate, formatTime, formatDateTime, addMinutes } from '../utils/formatters';
import { getWorkingDaysNames } from '../utils/validators';

export class DentistAgent {
  async processMessage(phone: string, userMessage: string, userName?: string): Promise<string> {
    try {
      await ContextService.saveMessage(phone, 'user', userMessage);

      if (userName) {
        await ContextService.updateUserName(phone, userName);
      }

      const context = await ContextService.getContext(phone);

      const response = await openaiService.chat(context.messages, SYSTEM_PROMPT, FUNCTIONS);

      if (response.functionCall) {
        logger.info(`🔧 Função chamada: ${response.functionCall.name}`, {
          arguments: response.functionCall.arguments,
          phone: phone.substring(0, 8) + '...',
        });

        const functionResult = await this.handleFunctionCall(
          response.functionCall.name,
          response.functionCall.arguments,
          phone,
          context.name || userName || 'Paciente'
        );

        logger.info(`✅ Resultado da função ${response.functionCall.name}:`, {
          resultPreview: functionResult.substring(0, 100) + '...',
        });

        await ContextService.saveMessage(phone, 'assistant', functionResult);
        return functionResult;
      }

      logger.info('💬 Resposta sem função:', {
        messagePreview: response.message.substring(0, 100) + '...',
        phone: phone.substring(0, 8) + '...',
      });

      await ContextService.saveMessage(phone, 'assistant', response.message);
      return response.message;
    } catch (error) {
      logger.error('Erro ao processar mensagem do agente:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.';
    }
  }

  private async handleFunctionCall(
    functionName: string,
    args: any,
    phone: string,
    patientName: string
  ): Promise<string> {
    try {
      switch (functionName) {
        case 'check_availability':
          return await this.checkAvailability(args.date, args.time);

        case 'get_available_slots':
          return await this.getAvailableSlots(args.date);

        case 'create_appointment':
          return await this.createAppointment(
            patientName,
            phone,
            args.date,
            args.time,
            args.type
          );

        case 'list_appointments':
          return await this.listAppointments(phone);

        case 'cancel_appointment':
          return await this.cancelAppointment(phone, args.appointment_id);

        case 'reschedule_appointment':
          return await this.rescheduleAppointment(
            phone,
            args.appointment_id,
            args.new_date,
            args.new_time
          );

        default:
          return 'Desculpe, não consegui processar essa operação.';
      }
    } catch (error: any) {
      logger.error(`Erro ao executar função ${functionName}:`, error);
      if (error.message?.includes('Google Calendar')) {
        return '❌ Tivemos uma instabilidade temporária com o sistema de agendamentos. Por favor, tente novamente em alguns instantes.';
      }
      return '❌ Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  }

  private async checkAvailability(date: string, time: string): Promise<string> {
    const result = await calendarService.checkAvailability(date, time);
    
    if (result.available) {
      return `✅ Ótima notícia! O horário ${formatDateTime(date, time)} está disponível!`;
    }
    
    switch (result.reason) {
      case 'past_date':
        return `❌ Não é possível agendar para ${formatDateTime(date, time)} pois essa data já passou.`;
      
      case 'holiday':
        return `❌ Infelizmente não atendemos neste dia pois é feriado.\n\n` +
               `🎉 A clínica estará fechada.\n\n` +
               `Por favor, escolha outra data para seu agendamento.`;
      
      case 'non_working_day':
        const workingDays = getWorkingDaysNames();
        return `❌ Infelizmente não atendemos neste dia da semana.\n\n` +
               `📅 Dias de atendimento: ${workingDays}\n\n` +
               `Por favor, escolha um dos dias de funcionamento.`;
      
      case 'outside_hours':
        const { env } = await import('../config/env.config');
        const endTime = addMinutes(time, env.CLINIC_APPOINTMENT_DURATION);
        return `❌ Não é possível agendar para as ${time}, pois a clínica fecha às ${env.CLINIC_BUSINESS_HOURS_END} e a consulta dura ${env.CLINIC_APPOINTMENT_DURATION} minutos (terminaria às ${endTime}).\n\n` +
               `⏰ Horário de funcionamento: ${env.CLINIC_BUSINESS_HOURS_START} às ${env.CLINIC_BUSINESS_HOURS_END}\n\n` +
               `Gostaria de ver os horários disponíveis?`;
      
      case 'occupied':
        return `❌ Infelizmente o horário ${formatDateTime(date, time)} já está ocupado. Gostaria de ver outros horários disponíveis?`;
      
      default:
        return `❌ Infelizmente o horário ${formatDateTime(date, time)} não está disponível. Gostaria de ver outros horários disponíveis?`;
    }
  }

  private async getAvailableSlots(date: string): Promise<string> {
    const slots = await calendarService.getAvailableSlots(date);
    
    if (slots.length === 0) {
      return `😔 Infelizmente não há horários disponíveis para ${formatDate(date)}. Gostaria de tentar outra data?`;
    }

    const formattedSlots = slots.map(slot => `• ${slot}`).join('\n');
    return `📅 Horários disponíveis para ${formatDate(date)}:\n\n${formattedSlots}\n\nQual horário prefere?`;
  }

  private async createAppointment(
    patientName: string,
    phone: string,
    date: string,
    time: string,
    type: string
  ): Promise<string> {
    logger.info('📝 Criando agendamento:', {
      patientName,
      date,
      time,
      type,
    });

    const availabilityResult = await calendarService.checkAvailability(date, time);
    
    if (!availabilityResult.available) {
      logger.warn('Horário não disponível para agendamento:', availabilityResult.reason);
      
      if (availabilityResult.reason === 'outside_hours') {
        return await this.checkAvailability(date, time);
      }
      
      return `❌ Desculpe, mas esse horário não está mais disponível. Gostaria de escolher outro?`;
    }

    logger.info('Horário disponível, criando evento no Google Calendar...');

    const appointmentId = await calendarService.createAppointment(
      patientName,
      phone,
      date,
      time,
      type
    );

    logger.info(`✅ Agendamento criado no Google Calendar: ${appointmentId}`);

    await ContextService.addPendingAppointment(phone, appointmentId);

    return `✅ Agendamento confirmado com sucesso!\n\n` +
           `👤 Paciente: ${patientName}\n` +
           `🦷 Tipo: ${type}\n` +
           `📅 Data: ${formatDate(date)}\n` +
           `⏰ Horário: ${formatTime(time)}\n\n` +
           `Enviaremos um lembrete 1 dia antes da consulta. Até lá! 😊`;
  }

  private async listAppointments(phone: string): Promise<string> {
    const appointments = await calendarService.listAppointmentsByPhone(phone);
    
    if (appointments.length === 0) {
      return `📋 Você não possui agendamentos futuros no momento. Gostaria de agendar uma consulta?`;
    }

    const formatted = appointments.map((apt, index) => {
      return `${index + 1}. ${formatDateTime(apt.date, apt.time)}\n   Tipo: ${apt.type}`;
    }).join('\n\n');

    return `📋 Seus agendamentos:\n\n${formatted}\n\nPrecisa cancelar ou remarcar algum? Informe o número.`;
  }

  private async cancelAppointment(phone: string, appointmentId: string): Promise<string> {
    // Busca agendamentos do paciente
    const appointments = await calendarService.listAppointmentsByPhone(phone);
    
    if (appointments.length === 0) {
      return `❌ Você não possui agendamentos para cancelar.\n\n` +
             `Gostaria de fazer um novo agendamento?`;
    }

    // Verifica se appointmentId é um número (índice) ou ID real
    let actualAppointmentId = appointmentId;
    const appointmentIndex = parseInt(appointmentId);
    
    // Se for um número válido, usa como índice
    if (!isNaN(appointmentIndex) && appointmentIndex >= 1 && appointmentIndex <= appointments.length) {
      actualAppointmentId = appointments[appointmentIndex - 1].id;
      logger.info(`Usando índice ${appointmentIndex} -> ID: ${actualAppointmentId}`);
    }

    // Verifica se o ID existe
    const appointment = appointments.find(apt => apt.id === actualAppointmentId);
    
    if (!appointment) {
      const formatted = appointments.map((apt, index) => {
        return `${index + 1}. ${formatDateTime(apt.date, apt.time)}\n   Tipo: ${apt.type}`;
      }).join('\n\n');
      
      return `❌ Agendamento não encontrado.\n\n` +
             `📋 Seus agendamentos:\n\n${formatted}\n\n` +
             `Por favor, informe o número do agendamento que deseja cancelar.`;
    }

    await calendarService.cancelAppointment(actualAppointmentId);
    await ContextService.removePendingAppointment(phone, actualAppointmentId);
    
    return `✅ Agendamento cancelado com sucesso! Se precisar agendar novamente, estou à disposição. 😊`;
  }

  private async rescheduleAppointment(
    phone: string,
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<string> {
    logger.info('🔄 Remarcando agendamento:', {
      appointmentId,
      newDate,
      newTime,
    });

    // Primeiro, verifica se o paciente tem agendamentos
    const appointments = await calendarService.listAppointmentsByPhone(phone);
    
    if (appointments.length === 0) {
      return `❌ Você não possui agendamentos para remarcar.\n\n` +
             `Gostaria de fazer um novo agendamento?`;
    }

    // Verifica se appointmentId é um número (índice) ou ID real
    let actualAppointmentId = appointmentId;
    const appointmentIndex = parseInt(appointmentId);
    
    // Se for um número válido, usa como índice
    if (!isNaN(appointmentIndex) && appointmentIndex >= 1 && appointmentIndex <= appointments.length) {
      actualAppointmentId = appointments[appointmentIndex - 1].id;
      logger.info(`Usando índice ${appointmentIndex} -> ID: ${actualAppointmentId}`);
    }

    // Verifica se o ID existe
    const appointment = appointments.find(apt => apt.id === actualAppointmentId);
    
    if (!appointment) {
      const formatted = appointments.map((apt, index) => {
        return `${index + 1}. ${formatDateTime(apt.date, apt.time)}\n   Tipo: ${apt.type}`;
      }).join('\n\n');
      
      return `❌ Agendamento não encontrado.\n\n` +
             `📋 Seus agendamentos:\n\n${formatted}\n\n` +
             `Por favor, informe o número do agendamento que deseja remarcar.`;
    }

    const availabilityResult = await calendarService.checkAvailability(newDate, newTime);
    
    if (!availabilityResult.available) {
      logger.warn('Novo horário não disponível para remarcação:', availabilityResult.reason);
      
      if (availabilityResult.reason === 'outside_hours') {
        return await this.checkAvailability(newDate, newTime);
      }
      
      if (availabilityResult.reason === 'holiday') {
        return `❌ Não é possível remarcar para ${formatDateTime(newDate, newTime)} pois é feriado.\n\n` +
               `Por favor, escolha outra data.`;
      }
      
      if (availabilityResult.reason === 'non_working_day') {
        const workingDays = getWorkingDaysNames();
        return `❌ Não é possível remarcar para ${formatDateTime(newDate, newTime)} - não atendemos neste dia.\n\n` +
               `📅 Dias de atendimento: ${workingDays}`;
      }
      
      return `❌ Desculpe, mas o horário ${formatDateTime(newDate, newTime)} não está disponível.\n\n` +
             `Gostaria de ver outros horários disponíveis?`;
    }

    logger.info('Novo horário disponível, remarcando no Google Calendar...');

    const result = await calendarService.rescheduleAppointment(actualAppointmentId, newDate, newTime);

    if (!result.success) {
      return `❌ Desculpe, não foi possível remarcar o agendamento.\n\n` +
             `${result.message}\n\n` +
             `Gostaria de fazer um novo agendamento?`;
    }

    logger.info(`✅ Agendamento remarcado com sucesso: ${actualAppointmentId}`);

    // O ID permanece o mesmo, não precisa atualizar no contexto

    return `✅ Agendamento remarcado com sucesso!\n\n` +
           `📅 Nova data: ${formatDate(newDate)}\n` +
           `⏰ Novo horário: ${formatTime(newTime)}\n\n` +
           `Nos vemos lá! 😊`;
  }
}

export const dentistAgent = new DentistAgent();
