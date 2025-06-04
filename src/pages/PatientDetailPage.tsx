//Pagina de detalhes do paciente

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import PageContainer from '../components/PageContainer';
import { getDatabase, ref, onValue, get, update, push } from "firebase/database";
import { app } from '@/services/firebaseConfig';
import PatientDetailContent from '../components/patient/PatientDetailContent';
import PatientModalsContainer from '../components/patient/PatientModalsContainer';
import { useAuth } from '../contexts/AuthContext';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

const metricKeys: HealthMetricType[] = [
  'glucose',
  'temperature',
  'bloodPressure',
  'oxygen',
  'heartRate'
];

// Função para converter objeto de métricas em array
function convertMetricsToArray(metricsObj: any) {
  if (!metricsObj || typeof metricsObj !== 'object') return [];
  return Object.entries(metricsObj).map(([id, data]) =>
    typeof data === 'object' && data !== null
      ? { id, ...data }
      : { id, value: data }
  );
}

function convertPatientMetrics(patient: any) {
  if (!patient) return patient;
  const converted = { ...patient };
  metricKeys.forEach((key) => {
    if (patient[key] && typeof patient[key] === 'object' && !Array.isArray(patient[key])) {
      converted[key] = convertMetricsToArray(patient[key]);
    }
  });
  return converted;
}

const PatientDetailPage = () => {
  const { userId, patientId } = useParams<{ userId: string; patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [editMedicationModalOpen, setEditMedicationModalOpen] = useState(false);
  const [editAppointmentModalOpen, setEditAppointmentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [editWeightModalOpen, setEditWeightModalOpen] = useState(false);
  const [editGlucoseModalOpen, setEditGlucoseModalOpen] = useState(false);
  const [editingGlucose, setEditingGlucose] = useState(null);
  const [editBloodPressureModalOpen, setEditBloodPressureModalOpen] = useState(false);
  const [editingBloodPressure, setEditingBloodPressure] = useState(null);
  const [editTemperatureModalOpen, setEditTemperatureModalOpen] = useState(false);
  const [editingTemperature, setEditingTemperature] = useState(null);
  const [editOxygenModalOpen, setEditOxygenModalOpen] = useState(false);
  const [editingOxygen, setEditingOxygen] = useState(null);
  const [editHeartRateModalOpen, setEditHeartRateModalOpen] = useState(false);
  const [editingHeartRate, setEditingHeartRate] = useState(null);

  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<number | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingWeight, setEditingWeight] = useState<any>(null);

  const [healthMetricModal, setHealthMetricModal] = useState<{
    open: boolean;
    type: HealthMetricType | null;
  }>({
    open: false,
    type: null
  });

  // Busca paciente no Firebase pelo id da URL
  useEffect(() => {
    if (!userId || !patientId) return;
    const db = getDatabase(app);
    const patientRef = ref(db, `patients/${userId}/${patientId}`);
    const unsubscribe = onValue(patientRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentPatient({ id: patientId, ...snapshot.val() });
      } else {
        setCurrentPatient(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId, patientId]);

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Carregando paciente...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (!currentPatient) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Paciente não encontrado</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/patients')}
          >
            Voltar
          </Button>
        </Box>
      </PageContainer>
    );
  }

  // Converte as métricas do paciente para arrays antes de passar para o PatientDetailContent
  const patientWithMetricsArray = convertPatientMetrics(currentPatient);

  const handleCloseHealthMetricModal = () => {
    setHealthMetricModal({ open: false, type: null });
  };

  const handleOpenHealthMetricModal = (type: HealthMetricType) => {
    setHealthMetricModal({ open: true, type });
  };

  const handleEditMedication = (medication: any, index: number) => {
    setSelectedMedication({ ...medication, index });
    setEditMedicationModalOpen(true);
  };

  const handleDeleteMedication = (index: number) => {
    setMedicationToDelete(index);
    setDeleteModalOpen(true);
  };

  // Salva edição de medicamento no Firebase
  const handleSaveMedication = async (updatedMedication: any) => {
    if (!userId || !patientId || selectedMedication?.index === undefined) return;
    const db = getDatabase();
    const patientRef = ref(db, `patients/${userId}/${patientId}`);
    const snapshot = await get(patientRef);
    const patientData = snapshot.val() || {};
    const medications = patientData.medications || [];
    medications[selectedMedication.index] = updatedMedication;
    await update(patientRef, { medications });
    setEditMedicationModalOpen(false);
    setSelectedMedication(null);
  };

  const handleEditAppointment = (appointment: any, index: number) => {
    setSelectedAppointment({ ...appointment, index });
    setEditAppointmentModalOpen(true);
  };

  const handleDeleteAppointment = (index: number) => {
    setAppointmentToDelete(index);
    setDeleteModalOpen(true);
  };

  // Salva edição de agendamento no Firebase
  const handleSaveAppointment = async (updatedAppointment: any) => {
    if (!userId || !patientId || selectedAppointment?.index === undefined) return;
    const db = getDatabase();
    const patientRef = ref(db, `patients/${userId}/${patientId}`);
    const snapshot = await get(patientRef);
    const patientData = snapshot.val() || {};
    const appointments = patientData.appointments || [];
    appointments[selectedAppointment.index] = updatedAppointment;
    await update(patientRef, { appointments });
    setEditAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  const confirmDelete = async () => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const patientRef = ref(db, `patients/${userId}/${patientId}`);
    const snapshot = await get(patientRef);
    const patientData = snapshot.val() || {};

    if (medicationToDelete !== null) {
      const medications = patientData.medications || [];
      medications.splice(medicationToDelete, 1);
      await update(patientRef, { medications });
      setMedicationToDelete(null);
    } else if (appointmentToDelete !== null) {
      const appointments = patientData.appointments || [];
      appointments.splice(appointmentToDelete, 1);
      await update(patientRef, { appointments });
      setAppointmentToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleEditPatient = () => {
    setEditPatientModalOpen(true);
  };

  const handleSavePatient = (updatedPatient: any) => {
    // Implemente a lógica de salvar no Firebase se desejar
    setCurrentPatient(updatedPatient);
    setEditPatientModalOpen(false);
  };

  // --- NOVO: Funções para salvar métricas de saúde no caminho correto ---
  // Funções de cadastro (push)
  const handleSaveGlucose = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refGlucose = ref(db, `patients/${userId}/${patientId}/glucose`);
    await push(refGlucose, data);
  };
  const handleSaveBloodPressure = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refBP = ref(db, `patients/${userId}/${patientId}/bloodPressure`);
    await push(refBP, data);
  };
  const handleSaveTemperature = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refTemp = ref(db, `patients/${userId}/${patientId}/temperature`);
    await push(refTemp, data);
  };
  const handleSaveOxygen = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refOxy = ref(db, `patients/${userId}/${patientId}/oxygen`);
    await push(refOxy, data);
  };
  const handleSaveHeartRate = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refHR = ref(db, `patients/${userId}/${patientId}/heartRate`);
    await push(refHR, data);
  };
  const handleSaveWeight = async (data: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const refWeight = ref(db, `patients/${userId}/${patientId}/weight`);
    await push(refWeight, data);
  };

  // Funções de edição (update por id)
  const handleEditGlucose = async (updated: any) => {
    if (!userId || !patientId || !updated.id) return;
    const db = getDatabase();
    const refGlucose = ref(db, `patients/${userId}/${patientId}/glucose/${updated.id}`);
    const { id, ...dataToSave } = updated;
    await update(refGlucose, dataToSave);
  };
  const handleEditBloodPressure = async (updated: any) => {
    if (!userId || !patientId || !updated.id) return;
    const db = getDatabase();
    const refBP = ref(db, `patients/${userId}/${patientId}/bloodPressure/${updated.id}`);
    const { id, ...dataToSave } = updated;
    await update(refBP, dataToSave);
  };
  const handleEditTemperature = async (updated: any) => {
    if (!userId || !patientId || !updated.id) return;
    const db = getDatabase();
    const refTemp = ref(db, `patients/${userId}/${patientId}/temperature/${updated.id}`);
    const { id, ...dataToSave } = updated;
    await update(refTemp, dataToSave);
  };
  const handleEditOxygen = async (updated: any) => {
    if (!userId || !patientId || !updated.id) return;
    const db = getDatabase();
    const refOxy = ref(db, `patients/${userId}/${patientId}/oxygen/${updated.id}`);
    const { id, ...dataToSave } = updated;
    await update(refOxy, dataToSave);
  };
  const handleEditHeartRate = async (updated: any) => {
    if (!userId || !patientId || !updated.id) return;
    const db = getDatabase();
    const refHR = ref(db, `patients/${userId}/${patientId}/heartRate/${updated.id}`);
    const { id, ...dataToSave } = updated;
    await update(refHR, dataToSave);
  };
  const handleEditWeight = async (updated: any) => {
    if (!userId || !patientId || !updated || !updated.id) return;
    const db = getDatabase();
    const refWeight = ref(db, `patients/${userId}/${patientId}/weight/${updated.id}`);
    const { id, ...dataToSave } = updated || {};
    await update(refWeight, dataToSave);
  };

  return (
    <PageContainer>
      <PatientDetailContent
        patient={patientWithMetricsArray}
        onClose={() => navigate('/patients')}
        onEditPatient={handleEditPatient}
        onMetricClick={handleOpenHealthMetricModal}
        onAddMedication={() => setMedicationModalOpen(true)}
        onEditMedication={handleEditMedication}
        onDeleteMedication={handleDeleteMedication}
        onAddAppointment={() => setAppointmentModalOpen(true)}
        onEditAppointment={handleEditAppointment}
        onDeleteAppointment={handleDeleteAppointment}
      />

      <PatientModalsContainer
        userId={user?.uid}
        patientId={patientId}
        weightModalOpen={weightModalOpen}
        setWeightModalOpen={setWeightModalOpen}
        medicationModalOpen={medicationModalOpen}
        setMedicationModalOpen={setMedicationModalOpen}
        editMedicationModalOpen={editMedicationModalOpen}
        setEditMedicationModalOpen={setEditMedicationModalOpen}
        editAppointmentModalOpen={editAppointmentModalOpen}
        setEditAppointmentModalOpen={setEditAppointmentModalOpen}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        appointmentModalOpen={appointmentModalOpen}
        setAppointmentModalOpen={setAppointmentModalOpen}
        editPatientModalOpen={editPatientModalOpen}
        setEditPatientModalOpen={setEditPatientModalOpen}
        editWeightModalOpen={editWeightModalOpen}
        setEditWeightModalOpen={setEditWeightModalOpen}
        healthMetricModal={healthMetricModal}
        selectedMedication={selectedMedication}
        setSelectedMedication={setSelectedMedication}
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        medicationToDelete={medicationToDelete}
        setMedicationToDelete={setMedicationToDelete}
        appointmentToDelete={appointmentToDelete}
        setAppointmentToDelete={setAppointmentToDelete}
        currentPatient={currentPatient}
        editingWeight={editingWeight}
        setEditingWeight={setEditingWeight}
        editGlucoseModalOpen={editGlucoseModalOpen}
        setEditGlucoseModalOpen={setEditGlucoseModalOpen}
        editingGlucose={editingGlucose}
        setEditingGlucose={setEditingGlucose}
        editBloodPressureModalOpen={editBloodPressureModalOpen}
        setEditBloodPressureModalOpen={setEditBloodPressureModalOpen}
        editingBloodPressure={editingBloodPressure}
        setEditingBloodPressure={setEditingBloodPressure}
        editTemperatureModalOpen={editTemperatureModalOpen}
        setEditTemperatureModalOpen={setEditTemperatureModalOpen}
        editingTemperature={editingTemperature}
        setEditingTemperature={setEditingTemperature}
        editOxygenModalOpen={editOxygenModalOpen}
        setEditOxygenModalOpen={setEditOxygenModalOpen}
        editingOxygen={editingOxygen}
        setEditingOxygen={setEditingOxygen}
        editHeartRateModalOpen={editHeartRateModalOpen}
        setEditHeartRateModalOpen={setEditHeartRateModalOpen}
        editingHeartRate={editingHeartRate}
        setEditingHeartRate={setEditingHeartRate}
        onCloseHealthMetricModal={handleCloseHealthMetricModal}
        onSaveMedication={handleSaveMedication}
        onSaveAppointment={handleSaveAppointment}
        onConfirmDelete={confirmDelete}
        onSavePatient={handleSavePatient}
        // Passe as funções de salvar métricas AQUI:
        onSaveGlucose={handleSaveGlucose}
        onEditGlucose={handleEditGlucose}
        onSaveBloodPressure={handleSaveBloodPressure}
        onEditBloodPressure={handleEditBloodPressure}
        onSaveTemperature={handleSaveTemperature}
        onEditTemperature={handleEditTemperature}
        onSaveOxygen={handleSaveOxygen}
        onEditOxygen={handleEditOxygen}
        onSaveHeartRate={handleSaveHeartRate}
        onEditHeartRate={handleEditHeartRate}
        onSaveWeight={handleSaveWeight}
        onEditWeight={handleEditWeight}
        // NÃO passe onEditGlucose, onEditBloodPressure, etc!
      />
    </PageContainer>
  );
};

export default PatientDetailPage;

function setSuccess(arg0: boolean) {
  throw new Error('Function not implemented.');
}
