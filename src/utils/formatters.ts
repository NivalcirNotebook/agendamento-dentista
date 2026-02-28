export function formatDate(dateString: string): string {
  // Evita problema de timezone: força interpretação como data local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} às ${formatTime(timeString)}`;
}

export function createDateTimeString(date: string, time: string): string {
  // Google Calendar API requer formato ISO 8601 com timezone
  // Exemplo: 2026-02-26T10:00:00-03:00
  return `${date}T${time}:00-03:00`;
}

export function parseDateTime(isoString: string): { date: string; time: string } {
  const dateObj = new Date(isoString);
  const date = dateObj.toISOString().split('T')[0];
  const time = dateObj.toTimeString().slice(0, 5);
  return { date, time };
}

export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

export function convertBrazilianDateToISO(brazilianDate: string): string {
  // Aceita DD/MM/YYYY ou DD-MM-YYYY
  const separators = /[\/\-]/;
  const parts = brazilianDate.split(separators);
  
  if (parts.length !== 3) {
    throw new Error('Formato de data inválido. Use DD/MM/YYYY');
  }
  
  const [day, month, year] = parts.map(p => p.trim());
  
  // Valida se são números
  if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
    throw new Error('Formato de data inválido. Use DD/MM/YYYY');
  }
  
  // Formata com zeros à esquerda
  const dayFormatted = day.padStart(2, '0');
  const monthFormatted = month.padStart(2, '0');
  
  return `${year}-${monthFormatted}-${dayFormatted}`;
}

export function isISODate(dateString: string): boolean {
  // Verifica se está no formato YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

export function isBrazilianDate(dateString: string): boolean {
  // Verifica se está no formato DD/MM/YYYY ou DD-MM-YYYY
  return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateString);
}

export function normalizeDateToISO(dateString: string): string {
  // Se já estiver em formato ISO, retorna como está
  if (isISODate(dateString)) {
    return dateString;
  }
  
  // Se estiver em formato brasileiro, converte
  if (isBrazilianDate(dateString)) {
    return convertBrazilianDateToISO(dateString);
  }
  
  throw new Error('Formato de data não reconhecido. Use DD/MM/YYYY ou YYYY-MM-DD');
}
