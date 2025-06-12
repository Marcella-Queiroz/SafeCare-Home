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

/**
 * Valida se o email existe usando a API Mailboxlayer.
 * Retorna true se o email for válido e existir, false caso contrário.
 */
export async function isEmailDeliverable(email: string): Promise<boolean> {
  const accessKey = import.meta.env.VITE_MAILBOXLAYER_KEY;
  const url = `https://apilayer.net/api/check?access_key=${accessKey}&email=${encodeURIComponent(email)}&smtp=1&format=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // data.format_valid: formato válido, data.smtp_check: existe de fato
    return !!(data.format_valid && data.smtp_check);
  } catch (error) {
    console.error("Erro ao validar email via Mailboxlayer:", error);
    return false;
  }
}