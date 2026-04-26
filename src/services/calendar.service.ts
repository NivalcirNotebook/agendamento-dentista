import { calendar, isGoogleConfigured } from '../config/google.config';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import { createDateTimeString, addMinutes } from '../utils/formatters';
import { isNonWorkingDay, isPastDate, isHoliday } from '../utils/validators';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'cancelled';
}

export interface AvailabilityResult {
  available: boolean;
  reason?: 'past_date' | 'holiday' | 'non_working_day' | 'outside_hours' | 'occupied';
}

export class CalendarService {
  async checkAvailability(date: string, time: string): Promise<AvailabilityResult> {
    try {
      if (isPastDate(date)) {
        return { available: false, reason: 'past_date' };
      }

      if (isHoliday(date)) {
        return { available: false, reason: 'holiday' };
      }

      if (isNonWorkingDay(date)) {
        return { available: false, reason: 'non_working_day' };
      }

      if (!this.isWithinBusinessHours(time)) {
        return { available: false, reason: 'outside_hours' };
      }

      if (!isGoogleConfigured || !calendar) {
        logger.warn('Google Calendar não configurado - retornando disponibilidade simulada');
        return { available: true };
      }

      const startDateTime = createDateTimeString(date, time);
      const endDateTime = createDateTimeString(
        date,
        addMinutes(time, env.CLINIC_APPOINTMENT_DURATION)
      );

      logger.info('Tentando listar eventos do Google Calendar:', {
        calendarId: env.GOOGLE_CALENDAR_ID,
        date,
        time,
        startDateTime,
        endDateTime,
      });

      const response = await calendar.events.list({
        calendarId: env.GOOGLE_CALENDAR_ID,
        timeMin: startDateTime,
        timeMax: endDateTime,
        singleEvents: true,
      });

      logger.info('Resposta do Google Calendar:', {
        itemsCount: response.data.items?.length || 0,
      });

      const isAvailable = !response.data.items || response.data.items.length === 0;
      return { 
        available: isAvailable,
        reason: isAvailable ? undefined : 'occupied'
      };
    } catch (error: any) {
      logger.error('Erro ao verificar disponibilidade:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error('Não foi possível verificar a disponibilidade no Google Calendar');
    }
  }

  async createAppointment(
    patientName: string,
    patientPhone: string,
    date: string,
    time: string,
    type: string
  ): Promise<string> {
    try {
      if (!isGoogleConfigured || !calendar) {
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.warn(`Google Calendar não configurado - agendamento simulado criado: ${mockId}`);
        return mockId;
      }

      const startDateTime = createDateTimeString(date, time);
      const endDateTime = createDateTimeString(
        date,
        addMinutes(time, env.CLINIC_APPOINTMENT_DURATION)
      );

      logger.info('Dados do evento a ser criado:', {
        patientName,
        date,
        time,
        startDateTime,
        endDateTime,
        calendarId: env.GOOGLE_CALENDAR_ID,
      });

      const event = {
        summary: `Consulta - ${patientName}`,
        description: `Tipo: ${type}\nTelefone: ${patientPhone}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      logger.info('Inserindo evento no Google Calendar...');

      const response = await calendar.events.insert({
        calendarId: env.GOOGLE_CALENDAR_ID,
        requestBody: event,
      });

      logger.info(`✅ Agendamento criado com sucesso no Google Calendar: ${response.data.id}`);
      return response.data.id!;
    } catch (error: any) {
      logger.error('❌ Erro ao criar agendamento:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data,
      });
      throw new Error('Não foi possível criar o agendamento no Google Calendar');
    }
  }

  async cancelAppointment(eventId: string): Promise<void> {
    try {
      if (!isGoogleConfigured || !calendar) {
        logger.warn(`Google Calendar não configurado - cancelamento simulado: ${eventId}`);
        return;
      }

      await calendar.events.delete({
        calendarId: env.GOOGLE_CALENDAR_ID,
        eventId: eventId,
      });

      logger.info(`Agendamento cancelado: ${eventId}`);
    } catch (error) {
      logger.error('Erro ao cancelar agendamento:', error);
      throw new Error('Não foi possível cancelar o agendamento');
    }
  }

  async rescheduleAppointment(
    eventId: string,
    newDate: string,
    newTime: string
  ): Promise<{ success: boolean; newEventId?: string; message: string }> {
    try {
      if (!isGoogleConfigured || !calendar) {
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.warn(`Google Calendar não configurado - remarcação simulada: ${eventId} -> ${mockId}`);
        return {
          success: true,
          newEventId: mockId,
          message: 'Agendamento remarcado (modo simulado)',
        };
      }

      logger.info(`Tentando remarcar evento ${eventId} no calendário ${env.GOOGLE_CALENDAR_ID}`);

      // Calcula nova data/hora
      const startDateTime = createDateTimeString(newDate, newTime);
      const endDateTime = createDateTimeString(
        newDate,
        addMinutes(newTime, env.CLINIC_APPOINTMENT_DURATION)
      );

      // Usa o método PATCH para atualizar apenas data/hora do evento existente
      await calendar.events.patch({
        calendarId: env.GOOGLE_CALENDAR_ID,
        eventId: eventId,
        requestBody: {
          start: {
            dateTime: startDateTime,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'America/Sao_Paulo',
          },
        },
      });

      logger.info(`✅ Agendamento remarcado com sucesso: ${eventId}`);

      return {
        success: true,
        newEventId: eventId, // Mantém o mesmo ID
        message: 'Agendamento remarcado com sucesso',
      };
    } catch (error: any) {
      logger.error('❌ Erro ao remarcar agendamento:', {
        message: error.message,
        code: error.code,
        status: error.status,
        eventId,
        calendarId: env.GOOGLE_CALENDAR_ID,
      });
      
      // Se o erro for 404 (Not Found), pode ser que o evento não existe mais
      if (error.code === 404 || error.status === 404) {
        return {
          success: false,
          message: 'Agendamento não encontrado no calendário. Pode ter sido cancelado anteriormente.',
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível remarcar o agendamento',
      };
    }
  }

  async listAppointmentsByPhone(phone: string): Promise<Appointment[]> {
    try {
      if (!isGoogleConfigured || !calendar) {
        logger.warn('Google Calendar não configurado - retornando lista vazia');
        return [];
      }

      const now = new Date().toISOString();
      const response = await calendar.events.list({
        calendarId: env.GOOGLE_CALENDAR_ID,
        timeMin: now,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
        q: phone,
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map((event: any) => {
        const startDate = new Date(event.start?.dateTime || '');
        return {
          id: event.id!,
          patientName: event.summary?.replace('Consulta - ', '') || '',
          patientPhone: phone,
          date: startDate.toISOString().split('T')[0],
          time: startDate.toTimeString().slice(0, 5),
          type: event.description?.split('\n')[0].replace('Tipo: ', '') || '',
          status: 'confirmed' as const,
        };
      });
    } catch (error) {
      logger.error('Erro ao listar agendamentos:', error);
      return [];
    }
  }

  async getAvailableSlots(date: string): Promise<string[]> {
    try {
      if (isPastDate(date) || isHoliday(date) || isNonWorkingDay(date)) {
        return [];
      }

      const allSlots = this.generateTimeSlots(
        env.CLINIC_BUSINESS_HOURS_START,
        env.CLINIC_BUSINESS_HOURS_END,
        env.CLINIC_APPOINTMENT_DURATION
      );

      if (!isGoogleConfigured || !calendar) {
        logger.warn('Google Calendar não configurado - retornando todos os horários disponíveis');
        return allSlots;
      }

      const startOfDay = createDateTimeString(date, env.CLINIC_BUSINESS_HOURS_START);
      const endOfDay = createDateTimeString(date, env.CLINIC_BUSINESS_HOURS_END);

      const response = await calendar.events.list({
        calendarId: env.GOOGLE_CALENDAR_ID,
        timeMin: startOfDay,
        timeMax: endOfDay,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const bookedSlots = (response.data.items || []).map((event: any) => {
        const start = new Date(event.start?.dateTime || '');
        return start.toTimeString().slice(0, 5);
      });

      return allSlots.filter(slot => !bookedSlots.includes(slot));
    } catch (error) {
      logger.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  }

  private isWithinBusinessHours(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const startTimeInMinutes = hours * 60 + minutes;
    
    // Calcula quando a consulta vai terminar
    const endTimeInMinutes = startTimeInMinutes + env.CLINIC_APPOINTMENT_DURATION;

    const [startHours, startMinutes] = env.CLINIC_BUSINESS_HOURS_START.split(':').map(Number);
    const businessStartInMinutes = startHours * 60 + startMinutes;

    const [endHours, endMinutes] = env.CLINIC_BUSINESS_HOURS_END.split(':').map(Number);
    const businessEndInMinutes = endHours * 60 + endMinutes;

    // Verifica se TANTO o início QUANTO o fim da consulta estão dentro do expediente
    return startTimeInMinutes >= businessStartInMinutes && endTimeInMinutes <= businessEndInMinutes;
  }

  private generateTimeSlots(start: string, end: string, duration: number): string[] {
    const slots: string[] = [];
    let current = start;

    // Calcula o último horário possível onde a consulta ainda cabe
    const [endHours, endMinutes] = end.split(':').map(Number);
    const endInMinutes = endHours * 60 + endMinutes;
    const lastSlotInMinutes = endInMinutes - duration;
    const lastSlotHours = Math.floor(lastSlotInMinutes / 60);
    const lastSlotMins = lastSlotInMinutes % 60;
    const lastSlot = `${String(lastSlotHours).padStart(2, '0')}:${String(lastSlotMins).padStart(2, '0')}`;

    while (current <= lastSlot) {
      slots.push(current);
      current = addMinutes(current, duration);
    }

    return slots;
  }
}

export const calendarService = new CalendarService();
