import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido');

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)');

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)');

export const appointmentTypeSchema = z.enum([
  'consulta',
  'limpeza',
  'canal',
  'extracao',
  'clareamento',
  'ortodontia',
  'implante',
  'outro',
]);

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidTime(timeString: string): boolean {
  return timeSchema.safeParse(timeString).success;
}

export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isHoliday(dateString: string): boolean {
  const { env } = require('../config/env.config');
  const { isBrazilianDate, convertBrazilianDateToISO } = require('./formatters');
  
  if (!env.CLINIC_HOLIDAYS || env.CLINIC_HOLIDAYS.trim() === '') {
    return false;
  }
  
  const holidays = env.CLINIC_HOLIDAYS.split(',').map((d: string) => {
    const trimmed = d.trim();
    // Se estiver em formato brasileiro, converte para ISO
    if (isBrazilianDate(trimmed)) {
      return convertBrazilianDateToISO(trimmed);
    }
    return trimmed;
  });
  
  return holidays.includes(dateString);
}

export function isNonWorkingDay(dateString: string): boolean {
  const { env } = require('../config/env.config');
  
  // Verifica se é feriado primeiro
  if (isHoliday(dateString)) {
    return true;
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  
  const workingDays = env.CLINIC_WORKING_DAYS.split(',').map((d: string) => parseInt(d.trim()));
  return !workingDays.includes(dayOfWeek);
}

export function getWorkingDaysNames(): string {
  const { env } = require('../config/env.config');
  const workingDays = env.CLINIC_WORKING_DAYS.split(',').map((d: string) => parseInt(d.trim()));
  
  const dayNames: { [key: number]: string } = {
    0: 'domingo',
    1: 'segunda-feira',
    2: 'terça-feira',
    3: 'quarta-feira',
    4: 'quinta-feira',
    5: 'sexta-feira',
    6: 'sábado',
  };
  
  const names = workingDays.map((day: number) => dayNames[day]);
  
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  
  const last = names.pop();
  return `${names.join(', ')} e ${last}`;
}

// Mantém compatibilidade com código antigo
export function isWeekend(dateString: string): boolean {
  return isNonWorkingDay(dateString);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
