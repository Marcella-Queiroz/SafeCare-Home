// Utilitários para conversão, formatação e manipulação de dados do sistema

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



export function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '';
  
  if (birthDate.includes('/')) return birthDate;
  
  // Converte YYYY-MM-DD para DD/MM/AAAA
  const [year, month, day] = birthDate.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  
  return birthDate;
}


