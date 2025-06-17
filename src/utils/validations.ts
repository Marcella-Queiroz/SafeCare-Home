//Validações de formulários

//Validação de senha
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

