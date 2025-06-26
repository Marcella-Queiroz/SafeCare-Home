export function toArray(records: any): any[] {
  if (!records) return [];
  if (Array.isArray(records)) return records;
  
  return Object.entries(records).map(([id, value]) => ({
    id,
    ...(typeof value === 'object' && value !== null ? value : { value }),
  }));
}

export function convertMetricsToArray<T extends { id?: string }>(metricsObj: any): T[] {
  if (!metricsObj) return [];
  if (Array.isArray(metricsObj)) return metricsObj;
  
  return Object.entries(metricsObj).map(([id, value]) => ({
    id,
    ...(typeof value === 'object' && value !== null ? value : { value }),
  } as T));
}

/**
 * Calcula idade baseada na data de nascimento
 * @param birthDate - Data de nascimento (YYYY-MM-DD)
 * @returns Idade em anos
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formata data para exibição em português
 * @param date - Data a ser formatada (YYYY-MM-DD ou Date)
 * @returns Data formatada (DD/MM/AAAA)
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata data de nascimento especificamente (YYYY-MM-DD -> DD/MM/AAAA)
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD
 * @returns Data formatada DD/MM/AAAA
 */
export function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '';
  
  // Se já está no formato DD/MM/AAAA, retorna como está
  if (birthDate.includes('/')) return birthDate;
  
  // Converte YYYY-MM-DD para DD/MM/AAAA
  const [year, month, day] = birthDate.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  
  return birthDate;
}

/**
 * Formata horário para exibição
 * @param time - Horário a ser formatado
 * @returns Horário formatado (HH:MM)
 */
export function formatTime(time: string): string {
  if (!time) return '';
  return time.slice(0, 5); // Pega apenas HH:MM
}
