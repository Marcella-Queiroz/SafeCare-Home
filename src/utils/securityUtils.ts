// Utilitários de segurança para controle de acesso

import { getDatabase, ref, get, set, update, push, remove } from "firebase/database";

/**
 * Verifica se o usuário atual tem acesso ao paciente especificado
 * @param userId - ID do usuário atual
 * @param patientId - ID do paciente a ser verificado
 * @returns Promise<boolean> - true se o usuário tem acesso, false caso contrário
 */
export async function hasPatientAccess(userId: string, patientId: string): Promise<boolean> {
  if (!userId || !patientId) return false;
  
  try {
    const db = getDatabase();
    const userPatientRef = ref(db, `userPatients/${userId}/${patientId}`);
    const snapshot = await get(userPatientRef);
    
    return snapshot.exists();
  } catch (error) {
    console.error('Erro ao verificar acesso ao paciente:', error);
    return false;
  }
}

/**
 * Verifica acesso e retorna dados do paciente se autorizado
 * @param userId - ID do usuário atual
 * @param patientId - ID do paciente
 * @returns Promise<any | null> - Dados do paciente se autorizado, null caso contrário
 */
export async function getPatientWithAccess(userId: string, patientId: string): Promise<any | null> {
  const hasAccess = await hasPatientAccess(userId, patientId);
  
  if (!hasAccess) {
    console.warn(`Usuário ${userId} tentou acessar paciente ${patientId} sem autorização`);
    return null;
  }
  
  try {
    const db = getDatabase();
    const patientRef = ref(db, `patientsGlobal/${patientId}`);
    const snapshot = await get(patientRef);
    
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Erro ao buscar dados do paciente:', error);
    return null;
  }
}

/**
 * Lista todos os pacientes que o usuário tem acesso
 * @param userId - ID do usuário atual
 * @returns Promise<string[]> - Array com IDs dos pacientes que o usuário pode acessar
 */
export async function getUserPatientIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  
  try {
    const db = getDatabase();
    const userPatientsRef = ref(db, `userPatients/${userId}`);
    const snapshot = await get(userPatientsRef);
    
    if (!snapshot.exists()) return [];
    
    return Object.keys(snapshot.val());
  } catch (error) {
    console.error('Erro ao buscar pacientes do usuário:', error);
    return [];
  }
}

/**
 * Lista todos os pacientes completos que o usuário tem acesso
 * @param userId - ID do usuário atual
 * @returns Promise<any[]> - Array com dados completos dos pacientes
 */
export async function getUserPatientsWithData(userId: string): Promise<any[]> {
  const patientIds = await getUserPatientIds(userId);
  const patients: any[] = [];
  
  for (const patientId of patientIds) {
    const patientData = await getPatientWithAccess(userId, patientId);
    if (patientData) {
      patients.push({ ...patientData, id: patientId });
    }
  }
  
  return patients;
}

/**
 * Adiciona acesso de um paciente para um usuário
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @returns Promise<boolean> - true se o acesso foi adicionado com sucesso
 */
export async function grantPatientAccess(userId: string, patientId: string): Promise<boolean> {
  if (!userId || !patientId) return false;
  
  try {
    const db = getDatabase();
    const userPatientRef = ref(db, `userPatients/${userId}/${patientId}`);
    await set(userPatientRef, true);
    
    return true;
  } catch (error) {
    console.error('Erro ao conceder acesso ao paciente:', error);
    return false;
  }
}

/**
 * Remove acesso de um paciente para um usuário
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @returns Promise<boolean> - true se o acesso foi removido com sucesso
 */
export async function revokePatientAccess(userId: string, patientId: string): Promise<boolean> {
  if (!userId || !patientId) return false;
  
  try {
    const db = getDatabase();
    const userPatientRef = ref(db, `userPatients/${userId}/${patientId}`);
    await remove(userPatientRef);
    
    return true;
  } catch (error) {
    console.error('Erro ao revogar acesso ao paciente:', error);
    return false;
  }
}

/**
 * Cria um novo paciente de forma segura
 * @param userId - ID do usuário criador
 * @param patientData - Dados do paciente
 * @returns Promise<string | null> - ID do paciente criado ou null se falhou
 */
export async function createPatientSecure(userId: string, patientData: any): Promise<string | null> {
  if (!userId || !patientData) return null;
  
  try {
    const db = getDatabase();
    const patientsGlobalRef = ref(db, 'patientsGlobal');
    const newPatientRef = push(patientsGlobalRef);
    const patientId = newPatientRef.key;
    
    if (!patientId) return null;
    
    // Salva dados do paciente
    await set(newPatientRef, patientData);
    
    // Concede acesso ao usuário criador
    await grantPatientAccess(userId, patientId);
    
    return patientId;
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    return null;
  }
}

/**
 * Atualiza dados do paciente de forma segura
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @param updates - Dados a serem atualizados
 * @returns Promise<boolean> - true se atualizado com sucesso
 */
export async function updatePatientSecure(userId: string, patientId: string, updates: any): Promise<boolean> {
  const hasAccess = await hasPatientAccess(userId, patientId);
  
  if (!hasAccess) {
    console.warn(`Usuário ${userId} tentou atualizar paciente ${patientId} sem autorização`);
    return false;
  }
  
  try {
    const db = getDatabase();
    const patientRef = ref(db, `patientsGlobal/${patientId}`);
    await update(patientRef, updates);
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    return false;
  }
}

/**
 * Adiciona métrica de saúde de forma segura
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @param metricType - Tipo da métrica (glucose, bloodPressure, etc.)
 * @param metricData - Dados da métrica
 * @returns Promise<string | null> - ID da métrica criada ou null se falhou
 */
export async function addHealthMetricSecure(
  userId: string, 
  patientId: string, 
  metricType: string, 
  metricData: any
): Promise<string | null> {
  const hasAccess = await hasPatientAccess(userId, patientId);
  
  if (!hasAccess) {
    console.warn(`Usuário ${userId} tentou adicionar métrica para paciente ${patientId} sem autorização`);
    return null;
  }
  
  try {
    const db = getDatabase();
    const metricRef = ref(db, `patientsGlobal/${patientId}/${metricType}`);
    const newMetricRef = push(metricRef);
    const metricId = newMetricRef.key;
    
    if (!metricId) return null;
    
    await set(newMetricRef, metricData);
    
    return metricId;
  } catch (error) {
    console.error('Erro ao adicionar métrica:', error);
    return null;
  }
}

/**
 * Atualiza métrica de saúde de forma segura
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @param metricType - Tipo da métrica
 * @param metricId - ID da métrica
 * @param updates - Dados a serem atualizados
 * @returns Promise<boolean> - true se atualizado com sucesso
 */
export async function updateHealthMetricSecure(
  userId: string,
  patientId: string,
  metricType: string,
  metricId: string,
  updates: any
): Promise<boolean> {
  const hasAccess = await hasPatientAccess(userId, patientId);
  
  if (!hasAccess) {
    console.warn(`Usuário ${userId} tentou atualizar métrica para paciente ${patientId} sem autorização`);
    return false;
  }
  
  try {
    const db = getDatabase();
    const metricRef = ref(db, `patientsGlobal/${patientId}/${metricType}/${metricId}`);
    await update(metricRef, updates);
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar métrica:', error);
    return false;
  }
}

/**
 * Remove métrica de saúde de forma segura
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 * @param metricType - Tipo da métrica
 * @param metricId - ID da métrica
 * @returns Promise<boolean> - true se removido com sucesso
 */
export async function removeHealthMetricSecure(
  userId: string,
  patientId: string,
  metricType: string,
  metricId: string
): Promise<boolean> {
  const hasAccess = await hasPatientAccess(userId, patientId);
  
  if (!hasAccess) {
    console.warn(`Usuário ${userId} tentou remover métrica do paciente ${patientId} sem autorização`);
    return false;
  }
  
  try {
    const db = getDatabase();
    const metricRef = ref(db, `patientsGlobal/${patientId}/${metricType}/${metricId}`);
    await remove(metricRef);
    
    return true;
  } catch (error) {
    console.error('Erro ao remover métrica:', error);
    return false;
  }
}

/**
 * Busca paciente por CPF de forma segura (só retorna se o usuário tem acesso)
 * @param userId - ID do usuário
 * @param cpf - CPF a ser buscado
 * @returns Promise<any | null> - Dados do paciente se encontrado e autorizado
 */
export async function findPatientByCPFSecure(userId: string, cpf: string): Promise<any | null> {
  const patientIds = await getUserPatientIds(userId);
  
  for (const patientId of patientIds) {
    const patientData = await getPatientWithAccess(userId, patientId);
    if (patientData && patientData.cpf === cpf) {
      return { ...patientData, id: patientId };
    }
  }
  
  return null;
}

/**
 * Middleware para proteger operações de paciente
 * Deve ser usado antes de qualquer operação que acesse dados de paciente
 */
export class PatientAccessGuard {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  /**
   * Executa uma função somente se o usuário tiver acesso ao paciente
   */
  async withPatientAccess<T>(
    patientId: string, 
    operation: () => Promise<T> | T
  ): Promise<T | null> {
    const hasAccess = await hasPatientAccess(this.userId, patientId);
    
    if (!hasAccess) {
      throw new Error('Acesso negado: Usuário não tem permissão para acessar este paciente');
    }
    
    return await operation();
  }
}

/**
 * Atualiza o campo lastCheck do paciente de forma segura
 * @param userId - ID do usuário
 * @param patientId - ID do paciente
 */
export async function updateLastCheckSecure(userId: string, patientId: string): Promise<void> {
  if (!userId || !patientId) return;
  
  try {
    const now = new Date();
    const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    await updatePatientSecure(userId, patientId, { lastCheck });
  } catch (error) {
    console.error('Erro ao atualizar lastCheck:', error);
  }
}
