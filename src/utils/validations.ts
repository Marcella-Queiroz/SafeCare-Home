// Funções de validação para formulários e dados de entrada do sistema SafeCare-Home

export const validatePassword = (password: string, confirmPassword: string): { valid: boolean; error: string } => {
    if (password.length < 6) {
      return { valid: false, error: "A senha deve ter pelo menos 6 caracteres" };
    }
    if (password !== confirmPassword) {
      return { valid: false, error: "As senhas não coincidem" };
    }
    return { valid: true, error: "" };
};  

//Validação de email
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

//Validação de email com verificação de domínio
export const isValidEmailWithDomain = async (email: string): Promise<{ valid: boolean; error?: string }> => {
  // Primeiro, validação básica de formato
  if (!isValidEmail(email)) {
    return { valid: false, error: "Formato de e-mail inválido" };
  }

  // Extrair o domínio do e-mail
  const domain = email.split('@')[1].toLowerCase();
  
  // Lista de domínios comuns que sabemos que existem
  const commonDomains = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
    'live.com', 'msn.com', 'uol.com.br', 'bol.com.br', 'ig.com.br',
    'terra.com.br', 'globo.com', 'r7.com', 'oi.com.br', 'vivo.com.br',
    'tim.com.br', 'claro.com.br', 'protonmail.com', 'tutanota.com',
    'zoho.com', 'yandex.com', 'mail.com', 'gmx.com', 'fastmail.com'
  ];

  // Domínios que definitivamente são inválidos
  const invalidDomains = [
    'example.com', 'test.com', 'localhost', 'invalid.com', 
    'fake.com', 'dummy.com', 'sample.com', 'tempmail.org',
    '10minutemail.com', 'guerrillamail.com'
  ];

  // Se é um domínio inválido conhecido, rejeitar
  if (invalidDomains.includes(domain)) {
    return { valid: false, error: "Domínio de e-mail não permitido" };
  }

  // Se é um domínio comum, aceitar imediatamente
  if (commonDomains.includes(domain)) {
    return { valid: true };
  }

  // Para domínios corporativos ou menos comuns, fazer verificações adicionais
  try {
    // Verificar se o domínio tem pelo menos a estrutura correta
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return { valid: false, error: "Domínio deve conter pelo menos um ponto" };
    }

    // Verificar se a extensão do domínio é válida
    const tld = domainParts[domainParts.length - 1];
    const validTlds = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'me',
      'br', 'uk', 'de', 'fr', 'it', 'es', 'ru', 'cn', 'jp', 'au', 'ca',
      'info', 'biz', 'name', 'pro', 'travel', 'museum', 'coop', 'aero'
    ];

    if (tld.length < 2 || (tld.length === 2 && !validTlds.includes(tld)) || 
        (tld.length > 2 && !validTlds.includes(tld))) {
      // Para TLDs não reconhecidos, ainda aceitar (pode ser novo)
      console.warn(`TLD não reconhecido: ${tld}, mas aceitando e-mail`);
    }

    // Tentar uma verificação simples via fetch para ver se o domínio responde
    // Isso é um fallback e pode falhar devido a CORS, mas vamos tentar
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      // Se chegou até aqui, o domínio provavelmente existe
      return { valid: true };
    } catch (fetchError) {
      // Erro no fetch não significa necessariamente que o domínio é inválido
      // Pode ser devido a CORS ou outras restrições
      console.info(`Não foi possível verificar ${domain} diretamente, mas aceitando`);
      return { valid: true };
    }
  } catch (error) {
    // Em caso de erro na verificação, aceitar o e-mail (fallback)
    console.warn('Erro ao verificar domínio:', error);
    return { valid: true };
  }
};

//Validação de email síncrona (para uso imediato)
export const validateEmailFormat = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: "E-mail é obrigatório" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: "Formato de e-mail inválido" };
  }

  // Verificações adicionais
  const domain = email.split('@')[1];
  
  // Verificar se não é um domínio obviamente inválido
  const invalidDomains = ['example.com', 'test.com', 'localhost'];
  if (invalidDomains.includes(domain.toLowerCase())) {
    return { valid: false, error: "Domínio de e-mail inválido" };
  }

  // Verificar se o domínio tem pelo menos um ponto
  if (!domain.includes('.')) {
    return { valid: false, error: "Domínio deve conter pelo menos um ponto" };
  }

  // Verificar se não termina com ponto
  if (domain.endsWith('.')) {
    return { valid: false, error: "Domínio não pode terminar com ponto" };
  }

  return { valid: true };
};

//Validação de telefone
export const isValidPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/[^\d]/g, '');
  // Aceita telefones com 10 ou 11 dígitos (com ou sem DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

//Validação de CPF
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, '');

  // CPF precisa ter 11 dígitos
  if (cpf.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function normalizeCPF(cpf: string): string {
  return cpf.replace(/[^\d]+/g, '');
}

// Validação de campos obrigatórios para paciente
export interface PatientValidationData {
  name: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
}

export const validatePatientData = (data: PatientValidationData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!data.cpf?.trim()) {
    errors.push('CPF é obrigatório');
  } else if (!validateCPF(data.cpf)) {
    errors.push('CPF inválido');
  }

  if (!data.birthDate?.trim()) {
    errors.push('Data de nascimento é obrigatória');
  } else {
    // Validar se a data não é futura
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    if (birthDate > today) {
      errors.push('Data de nascimento não pode ser futura');
    }
  }

  if (!data.gender?.trim()) {
    errors.push('Sexo é obrigatório');
  }

  if (!data.phone?.trim()) {
    errors.push('Telefone é obrigatório');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Telefone inválido');
  }

  if (!data.address?.trim()) {
    errors.push('Endereço é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validação de campos base para métricas
export const validateMetricBase = (date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!date?.trim()) {
    return { valid: false, error: 'Data é obrigatória' };
  }

  const metricDate = new Date(date);
  const today = new Date();
  
  if (metricDate > today) {
    return { valid: false, error: 'Data não pode ser futura' };
  }

  if (patientCreatedAt && metricDate < new Date(patientCreatedAt)) {
    return { valid: false, error: 'Data não pode ser anterior ao cadastro do paciente' };
  }

  return { valid: true, error: '' };
};

// Validação de temperatura
export const validateTemperature = (value: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!value?.trim()) {
    return { valid: false, error: 'Temperatura é obrigatória' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Temperatura deve ser um número válido' };
  }

  if (numValue < 25 || numValue > 50) {
    return { valid: false, error: 'Temperatura deve estar entre 25°C e 50°C' };
  }

  return { valid: true, error: '' };
};

// Validação de frequência cardíaca
export const validateHeartRate = (value: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!value?.trim()) {
    return { valid: false, error: 'Frequência cardíaca é obrigatória' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Frequência cardíaca deve ser um número válido' };
  }

  if (numValue < 30 || numValue > 250) {
    return { valid: false, error: 'Frequência cardíaca deve estar entre 30 e 250 bpm' };
  }

  return { valid: true, error: '' };
};

// Validação de glicemia
export const validateGlucose = (value: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!value?.trim()) {
    return { valid: false, error: 'Glicemia é obrigatória' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Glicemia deve ser um número válido' };
  }

  if (numValue < 10 || numValue > 800) {
    return { valid: false, error: 'Glicemia deve estar entre 10 e 800 mg/dL' };
  }

  return { valid: true, error: '' };
};

// Validação de saturação de oxigênio
export const validateOxygen = (value: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!value?.trim()) {
    return { valid: false, error: 'Saturação de oxigênio é obrigatória' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Saturação de oxigênio deve ser um número válido' };
  }

  if (numValue < 50 || numValue > 100) {
    return { valid: false, error: 'Saturação de oxigênio deve estar entre 50% e 100%' };
  }

  return { valid: true, error: '' };
};

// Validação de peso
export const validateWeight = (value: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!value?.trim()) {
    return { valid: false, error: 'Peso é obrigatório' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Peso deve ser um número válido' };
  }

  if (numValue < 0.5 || numValue > 500) {
    return { valid: false, error: 'Peso deve estar entre 0,5 kg e 500 kg' };
  }

  return { valid: true, error: '' };
};

// Validação de pressão arterial
export const validateBloodPressure = (systolic: string, diastolic: string, date: string, patientCreatedAt?: string): { valid: boolean; error: string } => {
  if (!systolic?.trim()) {
    return { valid: false, error: 'Pressão sistólica é obrigatória' };
  }

  if (!diastolic?.trim()) {
    return { valid: false, error: 'Pressão diastólica é obrigatória' };
  }

  const baseValidation = validateMetricBase(date, patientCreatedAt);
  if (!baseValidation.valid) return baseValidation;

  const systolicValue = parseFloat(systolic);
  const diastolicValue = parseFloat(diastolic);

  if (isNaN(systolicValue)) {
    return { valid: false, error: 'Pressão sistólica deve ser um número válido' };
  }

  if (isNaN(diastolicValue)) {
    return { valid: false, error: 'Pressão diastólica deve ser um número válido' };
  }

  if (systolicValue < 50 || systolicValue > 300) {
    return { valid: false, error: 'Pressão sistólica deve estar entre 50 e 300 mmHg' };
  }

  if (diastolicValue < 30 || diastolicValue > 200) {
    return { valid: false, error: 'Pressão diastólica deve estar entre 30 e 200 mmHg' };
  }

  if (systolicValue <= diastolicValue) {
    return { valid: false, error: 'Pressão sistólica deve ser maior que a diastólica' };
  }

  return { valid: true, error: '' };
};

// Validação de medicamento
export const validateMedication = (name: string, dosage: string, frequency: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!name?.trim()) {
    errors.push('Nome do medicamento é obrigatório');
  }

  if (!dosage?.trim()) {
    errors.push('Dosagem é obrigatória');
  }

  if (!frequency?.trim()) {
    errors.push('Frequência é obrigatória');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validação de agendamento
export const validateAppointment = (title: string, date: string, time: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!title?.trim()) {
    errors.push('Título do agendamento é obrigatório');
  }

  if (!date?.trim()) {
    errors.push('Data é obrigatória');
  } else {
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day); // cria data no fuso local sem deslocamento
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remover horas para comparar apenas datas
    
    if (appointmentDate < today) {
      errors.push('Data não pode ser anterior a hoje');
    }
  }

  if (!time?.trim()) {
    errors.push('Horário é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};



