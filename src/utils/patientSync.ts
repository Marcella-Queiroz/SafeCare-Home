import { getDatabase, ref, update } from "firebase/database";

export async function updatePatientEverywhere(patientId: string, updatedData: any) {
  const db = getDatabase();
  // Atualiza o paciente na estrutura global
  await update(ref(db, `patientsGlobal/${patientId}`), updatedData);
}