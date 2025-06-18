import { getDatabase, ref, get, update } from "firebase/database";

export async function updatePatientEverywhere(patientId: string, updatedData: any) {
  const db = getDatabase();
  const patientsRootRef = ref(db, "patients");
  const snapshot = await get(patientsRootRef);
  const allUsers = snapshot.val() || {};

  for (const userId in allUsers) {
    if (allUsers[userId][patientId]) {
      await update(ref(db, `patients/${userId}/${patientId}`), updatedData);
    }
  }
}