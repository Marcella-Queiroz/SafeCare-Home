// Utilitários de segurança para controle de acesso e gerenciamento de dados de pacientes no Firebase

import { getDatabase, ref, get, set, update, push, remove } from "firebase/database";
import { formatDateTimeToBR } from './dateUtils';

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
      // Verifica se o paciente é compartilhado (recebido de outro usuário)
      // Para pacientes antigos: createdBy pode ser email
      // Para pacientes novos: createdBy deve ser UID
      const hasCreatedBy = patientData.createdBy && typeof patientData.createdBy === 'string';
      
      // Verifica se é um UID válido (mais de 20 caracteres) ou se é um email antigo
      const isValidUID = hasCreatedBy && patientData.createdBy.length > 20;
      const isOldEmailFormat = hasCreatedBy && patientData.createdBy.includes('@');
      
      let isShared = false;
      let isOwner = false;
      
      if (isValidUID) {
        // Lógica para pacientes novos com UID
        isShared = patientData.createdBy !== userId;
        isOwner = patientData.createdBy === userId;
      } else if (isOldEmailFormat) {
        // Para pacientes antigos com email, verifica quem tem acesso
        // Se o usuário atual tem acesso mas o createdBy é diferente, é compartilhado
        isShared = true; // Assume que é compartilhado se não é o formato novo
        isOwner = false; // Para pacientes antigos, não podemos determinar ownership facilmente
      }
      
      // Verifica se o paciente está sendo compartilhado (enviado para outros usuários)
      let beingSharedInfo = { isBeingShared: false, sharedWithCount: 0 };
      let sharedWithUsers: string[] = [];
      let originalOwnerId = null;
      
      // Detecta o proprietário original
      if (isValidUID) {
        originalOwnerId = patientData.createdBy;
      } else if (isOldEmailFormat) {
        originalOwnerId = await detectPatientOriginalOwner(patientId, patientData.createdBy);
      }
      
      // Se for proprietário original ou paciente antigo, verifica compartilhamento
      // IMPORTANTE: Só deve verificar compartilhamento se for REALMENTE o proprietário
      if ((isOwner && originalOwnerId === userId) || (isOldEmailFormat && originalOwnerId === userId)) {
        const ownerIdForCheck = originalOwnerId || userId;
        beingSharedInfo = await isPatientBeingShared(patientId, ownerIdForCheck);
        if (beingSharedInfo.isBeingShared) {
          sharedWithUsers = await getPatientSharedWithUsers(patientId, ownerIdForCheck);
        }
      }
      
      // Para pacientes antigos, refina a lógica de compartilhamento
      if (isOldEmailFormat && originalOwnerId) {
        isShared = originalOwnerId !== userId;
        isOwner = originalOwnerId === userId;
      }
      
      patients.push({ 
        ...patientData, 
        id: patientId,
        originalOwner: isShared ? (originalOwnerId || patientData.createdBy) : undefined
      });
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
    
    // Verificar se foi salvo corretamente
    const verifyRef = ref(db, `userPatients/${userId}/${patientId}`);
    const verifySnapshot = await get(verifyRef);
    
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
    const globalRef = ref(db, `patientsGlobal/${patientId}`);
    const localRef = ref(db, `patients/${userId}/${patientId}`);
    
    await update(globalRef, updates);
    await update(localRef, updates);
    
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
 * Busca paciente por CPF em toda a base global (para compartilhamento)
 * @param cpf - CPF a ser buscado
 * @returns Promise<any | null> - Dados do paciente se encontrado
 */
export async function findPatientByCPFGlobal(cpf: string): Promise<any | null> {
  if (!cpf) return null;
  
  try {
    const db = getDatabase();
    const patientsGlobalRef = ref(db, 'patientsGlobal');
    const snapshot = await get(patientsGlobalRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const allPatients = snapshot.val();
    
    // Normaliza o CPF de busca (remove formatação)
    const normalizedSearchCPF = cpf.replace(/[^\d]/g, '');
    
    // Busca por CPF em todos os pacientes
    for (const [patientId, patientData] of Object.entries(allPatients)) {
      if (patientData && typeof patientData === 'object') {
        const patientCPF = (patientData as any).cpf;
        if (patientCPF) {
          // Normaliza o CPF do paciente para comparação
          const normalizedPatientCPF = patientCPF.replace(/[^\d]/g, '');
          if (normalizedPatientCPF === normalizedSearchCPF) {
            return { 
              ...(patientData as any), 
              id: patientId,
              ownerUserId: (patientData as any).createdBy || patientId // Informação para compatibilidade
            };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar paciente por CPF na base global:', error);
    return null;
  }
}

/**
 * Busca os nomes dos usuários que têm acesso a um paciente específico
 * @param patientId - ID do paciente
 * @param ownerId - ID do proprietário do paciente
 * @returns Promise<string[]> - array com os nomes dos usuários que têm acesso
 */
export async function getPatientSharedWithUsers(patientId: string, ownerId: string): Promise<string[]> {
  if (!patientId || !ownerId) return [];
  
  try {
    const db = getDatabase();
    const userPatientsRef = ref(db, 'userPatients');
    const usersRef = ref(db, 'users');
    
    const [userPatientsSnapshot, usersSnapshot] = await Promise.all([
      get(userPatientsRef),
      get(usersRef)
    ]);
    
    if (!userPatientsSnapshot.exists() || !usersSnapshot.exists()) {
      return [];
    }
    
    const allUserPatients = userPatientsSnapshot.val();
    const allUsers = usersSnapshot.val();
    const sharedWithNames: string[] = [];
    
    // Encontrar usuários que têm acesso ao paciente (exceto o proprietário)
    for (const userId in allUserPatients) {
      if (userId !== ownerId && 
          allUserPatients[userId] && 
          allUserPatients[userId][patientId] === true) {
        // Buscar o nome do usuário
        if (allUsers[userId] && allUsers[userId].name) {
          sharedWithNames.push(allUsers[userId].name);
        } else {
          // Fallback: adiciona o ID se não encontrar o nome
          sharedWithNames.push(`Usuário ${userId.substring(0, 8)}...`);
        }
      }
    }
    
    return sharedWithNames;
  } catch (error) {
    console.error('Erro ao buscar usuários compartilhados:', error);
    return [];
  }
}

/**
 * Busca o nome de um usuário pelo seu ID
 * @param userId - ID do usuário
 * @returns Promise<string | null> - nome do usuário ou null se não encontrado
 */
export async function getUserNameById(userId: string): Promise<string | null> {
  if (!userId) {
    return null;
  }
  
  // Se for um email, retorna o próprio email (pacientes antigos)
  if (userId.includes('@')) {
    return userId;
  }
  
  try {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const name = userData.name || userData.email || null;
      return name;
    }
    
    return null;
  } catch (error) {
    console.error('getUserNameById: Erro ao buscar nome do usuário:', error);
    return null;
  }
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
    const lastCheck = formatDateTimeToBR(now);
    
    await updatePatientSecure(userId, patientId, { lastCheck });
  } catch (error) {
    console.error('Erro ao atualizar lastCheck:', error);
  }
}

/**
 * Migra pacientes antigos que têm createdBy como nome para usar UID
 * Esta função deve ser executada uma vez para corrigir dados antigos
 * @param userId - ID do usuário atual
 */
export async function migrateOldPatientsToUID(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const db = getDatabase();
    const patientIds = await getUserPatientIds(userId);
    
    for (const patientId of patientIds) {
      const patientRef = ref(db, `patientsGlobal/${patientId}`);
      const snapshot = await get(patientRef);
      
      if (snapshot.exists()) {
        const patientData = snapshot.val();
        
        // Se createdBy existe mas é muito curto (provavelmente um nome), atualiza para UID
        if (patientData.createdBy && 
            typeof patientData.createdBy === 'string' && 
            patientData.createdBy.length < 20) {
          

          
          await update(patientRef, {
            createdBy: userId,
            migratedAt: new Date().toISOString()
          });
        }
      }
    }
    

  } catch (error) {
    console.error('Erro na migração de pacientes:', error);
  }
}

/**
 * Verifica se um paciente está sendo compartilhado com outros usuários
 * @param patientId - ID do paciente
 * @param ownerId - ID do proprietário do paciente
 * @returns Promise<{isBeingShared: boolean, sharedWithCount: number}> - informações sobre o compartilhamento
 */
export async function isPatientBeingShared(patientId: string, ownerId: string): Promise<{isBeingShared: boolean, sharedWithCount: number}> {
  if (!patientId || !ownerId) return { isBeingShared: false, sharedWithCount: 0 };
  
  try {
    const db = getDatabase();
    const userPatientsRef = ref(db, 'userPatients');
    const snapshot = await get(userPatientsRef);
    
    if (!snapshot.exists()) {

      return { isBeingShared: false, sharedWithCount: 0 };
    }
    
    const allUserPatients = snapshot.val();
    let sharedWithCount = 0;
    

    
    // Contar quantos usuários (além do proprietário) têm acesso a este paciente
    for (const userId in allUserPatients) {
      if (userId !== ownerId && 
          allUserPatients[userId] && 
          allUserPatients[userId][patientId] === true) {
        sharedWithCount++;

      }
    }
    
    const result = {
      isBeingShared: sharedWithCount > 0,
      sharedWithCount
    };
    

    
    return result;
  } catch (error) {
    console.error('Erro ao verificar compartilhamento do paciente:', error);
    return { isBeingShared: false, sharedWithCount: 0 };
  }
}

/**
 * Detecta quem é o proprietário original de um paciente
 * Para pacientes antigos (createdBy com email), tenta detectar pelo primeiro usuário que tem acesso
 * @param patientId - ID do paciente
 * @param createdBy - Campo createdBy do paciente
 * @returns Promise<string | null> - ID do proprietário original
 */
export async function detectPatientOriginalOwner(patientId: string, createdBy: string): Promise<string | null> {
  if (!patientId || !createdBy) return null;
  
  // Se já é um UID válido, usa ele mesmo
  if (createdBy.length > 20 && !createdBy.includes('@')) {
    return createdBy;
  }
  
  // Para pacientes antigos (formato email), busca o primeiro usuário com acesso
  try {
    const db = getDatabase();
    const userPatientsRef = ref(db, 'userPatients');
    const snapshot = await get(userPatientsRef);
    
    if (!snapshot.exists()) return null;
    
    const allUserPatients = snapshot.val();
    
    // Busca todos os usuários que têm acesso a este paciente
    const usersWithAccess = [];
    for (const userId in allUserPatients) {
      if (allUserPatients[userId] && allUserPatients[userId][patientId] === true) {
        usersWithAccess.push(userId);
      }
    }
    
    // Se houver usuários, assume que o primeiro é o proprietário original
    // (isso pode não ser 100% preciso, mas é a melhor aproximação para dados antigos)
    return usersWithAccess.length > 0 ? usersWithAccess[0] : null;
  } catch (error) {
    console.error('Erro ao detectar proprietário original:', error);
    return null;
  }
}

/**
 * Obtém informações de compartilhamento para exibição na ficha detalhada do paciente
 * @param userId - ID do usuário atual
 * @param patientData - Dados do paciente
 * @param patientId - ID do paciente
 * @returns Informações de compartilhamento do paciente
 */
export async function getPatientSharingInfo(userId: string, patientData: any, patientId: string) {
  const hasCreatedBy = patientData.createdBy && typeof patientData.createdBy === 'string';
  
  // Verifica se é um UID válido (mais de 20 caracteres) ou se é um email antigo
  const isValidUID = hasCreatedBy && patientData.createdBy.length > 20;
  const isOldEmailFormat = hasCreatedBy && patientData.createdBy.includes('@');
  
  let isShared = false;
  let isOwner = false;
  let originalOwnerId = null;
  
  if (isValidUID) {
    // Lógica para pacientes novos com UID
    isShared = patientData.createdBy !== userId;
    isOwner = patientData.createdBy === userId;
    originalOwnerId = patientData.createdBy;
  } else if (isOldEmailFormat) {
    // Para pacientes antigos com email, verifica quem tem acesso
    originalOwnerId = await detectPatientOriginalOwner(patientId, patientData.createdBy);
    isShared = originalOwnerId !== userId;
    isOwner = originalOwnerId === userId;
  }
  
  // Verifica se o paciente está sendo compartilhado (enviado para outros usuários)
  let beingSharedInfo = { isBeingShared: false, sharedWithCount: 0 };
  let sharedWithUsers: string[] = [];
  
  // Se for proprietário original, verifica compartilhamento
  if (isOwner && originalOwnerId === userId) {
    const ownerIdForCheck = originalOwnerId || userId;
    beingSharedInfo = await isPatientBeingShared(patientId, ownerIdForCheck);
    if (beingSharedInfo.isBeingShared) {
      sharedWithUsers = await getPatientSharedWithUsers(patientId, ownerIdForCheck);
    }
  }
  
  return {
    shared: isShared,
    originalOwner: isShared ? originalOwnerId : undefined,
    beingShared: beingSharedInfo.isBeingShared,
    sharedWithCount: beingSharedInfo.sharedWithCount,
    sharedWithUsers: sharedWithUsers
  };
}

