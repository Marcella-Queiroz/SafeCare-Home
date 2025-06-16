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
  //Implementar
  return false;//modificar
};

