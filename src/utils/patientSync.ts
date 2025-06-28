// Utilitários para sincronização de dados de pacientes entre diferentes estruturas do Firebase

import { getDatabase, ref, update } from "firebase/database";

export async function updatePatientEverywhere(patientId: string, updatedData: any) {
  const db = getDatabase();
  await update(ref(db, `patientsGlobal/${patientId}`), updatedData);
}