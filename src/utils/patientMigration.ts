// Utilitário para migração de dados de pacientes antigos
import { getDatabase, ref, get, update } from 'firebase/database';
import { getUserNameById } from './securityUtils';

export async function migratePatientCreatedBy() {
  console.log('Iniciando migração de dados de pacientes...');
  
  try {
    const db = getDatabase();
    const patientsRef = ref(db, 'patientsGlobal');
    const snapshot = await get(patientsRef);
    
    if (!snapshot.exists()) {
      console.log('Nenhum paciente encontrado para migrar');
      return;
    }
    
    const patients = snapshot.val();
    let migratedCount = 0;
    let issuesFound = 0;
    
    // Primeiro, buscar todos os usuários
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      console.log('Nenhum usuário encontrado na tabela users');
      return;
    }
    
    const users = usersSnapshot.val();
    console.log('Usuários encontrados:', Object.keys(users).length);
    
    for (const [patientId, patientData] of Object.entries(patients)) {
      const patient = patientData as any;
      
      if (patient.createdBy) {
        // Se createdBy parece ser um nome (muito curto) ou não é um UID válido
        const isValidUID = patient.createdBy.length > 20 && !patient.createdBy.includes('@') && !patient.createdBy.includes(' ');
        
        if (!isValidUID) {
          console.log(`Paciente ${patientId} (${patient.name}): createdBy atual = "${patient.createdBy}"`);
          issuesFound++;
          
          let foundUid = null;
          
          // Procura por correspondência de nome ou email
          for (const [uid, userData] of Object.entries(users)) {
            const user = userData as any;
            if (user.name === patient.createdBy || user.email === patient.createdBy) {
              foundUid = uid;
              console.log(`  -> Encontrou correspondência: ${patient.createdBy} = ${user.name} (${user.email}) -> UID: ${uid}`);
              break;
            }
          }
          
          if (foundUid) {
            // Atualiza o createdBy para o UID correto
            const patientUpdateRef = ref(db, `patientsGlobal/${patientId}`);
            await update(patientUpdateRef, {
              createdBy: foundUid,
              migratedAt: new Date().toISOString(),
              originalCreatedBy: patient.createdBy // Backup do valor original
            });
            migratedCount++;
            console.log(`  -> Paciente ${patientId} migrado com sucesso para UID: ${foundUid}`);
          } else {
            console.log(`  -> ⚠️  Não foi possível encontrar UID para: "${patient.createdBy}"`);
            console.log(`  -> Usuários disponíveis:`, Object.values(users).map((u: any) => `${u.name} (${u.email})`));
          }
        } else {
          console.log(`Paciente ${patientId}: createdBy já é um UID válido`);
        }
      } else {
        console.log(`Paciente ${patientId}: não tem createdBy definido`);
        issuesFound++;
      }
    }
    
    console.log(`\n=== RESUMO DA MIGRAÇÃO ===`);
    console.log(`Total de pacientes: ${Object.keys(patients).length}`);
    console.log(`Problemas encontrados: ${issuesFound}`);
    console.log(`Pacientes migrados: ${migratedCount}`);
    console.log(`========================\n`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

export async function debugPatientData(patientId: string) {
  console.log('=== DEBUG DADOS DO PACIENTE ===');
  console.log('Patient ID:', patientId);
  
  try {
    const db = getDatabase();
    const patientRef = ref(db, `patientsGlobal/${patientId}`);
    const snapshot = await get(patientRef);
    
    if (snapshot.exists()) {
      const patientData = snapshot.val();
      console.log('Dados do paciente:', patientData);
      console.log('createdBy:', patientData.createdBy);
      
      if (patientData.createdBy) {
        const userName = await getUserNameById(patientData.createdBy);
        console.log('Nome do usuário que criou:', userName);
        
        // Verificar se o usuário existe na tabela users
        const userRef = ref(db, `users/${patientData.createdBy}`);
        const userSnapshot = await get(userRef);
        console.log('Usuário existe na tabela users:', userSnapshot.exists());
        if (userSnapshot.exists()) {
          console.log('Dados do usuário:', userSnapshot.val());
        }
      }
    } else {
      console.log('Paciente não encontrado');
    }
  } catch (error) {
    console.error('Erro ao debugar dados do paciente:', error);
  }
  
  console.log('=== FIM DEBUG ===');
}

export async function listAllUsers() {
  console.log('=== LISTANDO TODOS OS USUÁRIOS ===');
  
  try {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('Nenhum usuário encontrado');
      return;
    }
    
    const users = snapshot.val();
    console.log(`Total de usuários: ${Object.keys(users).length}\n`);
    
    Object.entries(users).forEach(([uid, userData]) => {
      const user = userData as any;
      console.log(`UID: ${uid}`);
      console.log(`  Nome: ${user.name || 'Não informado'}`);
      console.log(`  Email: ${user.email || 'Não informado'}`);
      console.log(`  Role: ${user.role || 'Não informado'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  }
  
  console.log('=== FIM DA LISTA ===');
}

export async function fixSpecificPatient(patientId: string, correctUserId: string) {
  console.log(`Corrigindo paciente ${patientId} para usuário ${correctUserId}...`);
  
  try {
    const db = getDatabase();
    
    // Verificar se o usuário existe
    const userRef = ref(db, `users/${correctUserId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      console.log(`ERRO: Usuário ${correctUserId} não existe`);
      return;
    }
    
    const userData = userSnapshot.val();
    console.log(`Usuário encontrado: ${userData.name} (${userData.email})`);
    
    // Verificar se o paciente existe
    const patientRef = ref(db, `patientsGlobal/${patientId}`);
    const patientSnapshot = await get(patientRef);
    
    if (!patientSnapshot.exists()) {
      console.log(`ERRO: Paciente ${patientId} não existe`);
      return;
    }
    
    const patientData = patientSnapshot.val();
    console.log(`Paciente encontrado: ${patientData.name}`);
    console.log(`createdBy atual: ${patientData.createdBy}`);
    
    // Atualizar o paciente
    await update(patientRef, {
      createdBy: correctUserId,
      fixedAt: new Date().toISOString(),
      originalCreatedBy: patientData.createdBy
    });
    
    console.log(`✅ Paciente ${patientId} corrigido com sucesso!`);
    console.log(`Novo createdBy: ${correctUserId}`);
    
  } catch (error) {
    console.error('Erro ao corrigir paciente:', error);
  }
}
