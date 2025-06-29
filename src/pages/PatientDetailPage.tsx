
// Página de visualização detalhada dos dados do paciente com métricas de saúde, medicamentos e observações

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import { getDatabase, ref, get, set, push, update, remove, onValue } from "firebase/database";
import { app } from '@/services/firebaseConfig';
import PatientDetailContent from '@/components/patient/PatientDetailContent';
import { Patient, Observation } from '../types/patient';
import PatientModalsContainer from '@/components/patient/PatientModalsContainer';
import { useAuth } from '@/contexts/AuthContext';
import ObservationsSection from '@/components/patient/ObservationsSection';
import { convertMetricsToArray } from '@/utils/dataUtils';
import { 
  getPatientWithAccess, 
  hasPatientAccess,
  updatePatientSecure,
  addHealthMetricSecure,
  updateHealthMetricSecure,
  removeHealthMetricSecure,
  isPatientBeingShared,
  getPatientSharedWithUsers,
  getUserNameById
} from '@/utils/securityUtils';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

const metricKeys = [
  'weight',
  'glucose',
  'bloodPressure',
  'temperature',
  'oxygen',
  'heartRate'
];

function convertPatientMetrics(patient: any): Patient {
  if (!patient) return patient;
  const converted = { ...patient };
  metricKeys.forEach((key) => {
    if (patient[key] && (typeof patient[key] === 'object' || Array.isArray(patient[key]))) {
      converted[key] = convertMetricsToArray(patient[key]);
    }
  });
  if (patient.createdBy) converted.createdBy = patient.createdBy;
  if (patient.editedBy) converted.editedBy = patient.editedBy;
  return converted;
}

const PatientDetailPage = () => {
  const { userId, patientId } = useParams<{ userId: string; patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const urlUserId = userId;

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
  const [observations, setObservations] = useState<Observation[]>([]);

  const [healthMetricModal, setHealthMetricModal] = useState<{
    open: boolean;
    type: HealthMetricType | null;
  }>({
    open: false,
    type: null
  });

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const patientData = await getPatientWithAccess(user.uid, patientId);
        
        if (patientData) {
          setCurrentPatient(normalizePatient(patientData, patientId));
          if (patientData.observations) {
            setObservations(convertMetricsToArray(patientData.observations));
          } else {
            setObservations([]);
          }
        } else {
          setCurrentPatient(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do paciente:', error);
        setCurrentPatient(null);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
    
    if (patientId && user?.uid) {
      hasPatientAccess(user.uid, patientId).then(hasAccess => {
        if (hasAccess) {
          const db = getDatabase();
          const patientRef = ref(db, `patientsGlobal/${patientId}`);
          const unsubscribe = onValue(patientRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setCurrentPatient(normalizePatient(data, patientId));
              
              if (data.observations) {
                setObservations(convertMetricsToArray(data.observations));
              } else {
                setObservations([]);
              }
            }
          });
          
          return () => unsubscribe();
        }
      });
    }
  }, [patientId, user?.uid]);

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
  const handleSaveMedication = async (updatedMedication: any) => {
    if (!user?.uid || !patientId || selectedMedication?.index === undefined) return;
    
    try {
      const patientData = await getPatientWithAccess(user.uid, patientId);
      if (!patientData) return;
      
      const medications = patientData.medications || [];
      medications[selectedMedication.index] = updatedMedication;
      
      await updatePatientSecure(user.uid, patientId, { medications });
      setEditMedicationModalOpen(false);
      setSelectedMedication(null);
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
    }
  };

  const handleEditAppointment = (appointment: any, index: number) => {
    setSelectedAppointment({ ...appointment, index });
    setEditAppointmentModalOpen(true);
  };

  const handleDeleteAppointment = (index: number) => {
    setAppointmentToDelete(index);
    setDeleteModalOpen(true);
  };
  const handleSaveAppointment = async (updatedAppointment: any) => {
    if (!user?.uid || !patientId || selectedAppointment?.index === undefined) return;
    
    try {
      const patientData = await getPatientWithAccess(user.uid, patientId);
      if (!patientData) return;
      
      const appointments = patientData.appointments || [];
      appointments[selectedAppointment.index] = updatedAppointment;
      
      await updatePatientSecure(user.uid, patientId, { appointments });
      setEditAppointmentModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const confirmDelete = async () => {
    if (!user?.uid || !patientId) return;
    
    try {
      const patientData = await getPatientWithAccess(user.uid, patientId);
      if (!patientData) return;

      if (medicationToDelete !== null) {
        const medications = patientData.medications || [];
        medications.splice(medicationToDelete, 1);
        await updatePatientSecure(user.uid, patientId, { medications });
        setMedicationToDelete(null);
      } else if (appointmentToDelete !== null) {
        const appointments = patientData.appointments || [];
        appointments.splice(appointmentToDelete, 1);
        await updatePatientSecure(user.uid, patientId, { appointments });
        setAppointmentToDelete(null);
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const handleEditPatient = () => {
    setEditPatientModalOpen(true);
  };

  const handleSavePatient = (updatedPatient: any) => {
    setEditPatientModalOpen(false);
  };

  const handleSaveGlucose = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'glucose', data);
  };
  
  const handleSaveBloodPressure = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'bloodPressure', data);
  };
  
  const handleSaveTemperature = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'temperature', data);
  };
  
  const handleSaveOxygen = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'oxygen', data);
  };
  
  const handleSaveHeartRate = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'heartRate', data);
  };
  
  const handleSaveWeight = async (data: any) => {
    if (!user?.uid || !patientId) return;
    await addHealthMetricSecure(user.uid, patientId, 'weight', data);
  };
  const handleEditGlucose = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'glucose', id, dataToSave);
  };
  
  const handleEditBloodPressure = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'bloodPressure', id, dataToSave);
  };
  
  const handleEditTemperature = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'temperature', id, dataToSave);
  };
  
  const handleEditOxygen = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'oxygen', id, dataToSave);
  };
  
  const handleEditHeartRate = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'heartRate', id, dataToSave);
  };
  
  const handleEditWeight = async (updated: any) => {
    if (!user?.uid || !patientId || !updated || !updated.id) return;
    const { id, ...dataToSave } = updated;
    await updateHealthMetricSecure(user.uid, patientId, 'weight', id, dataToSave);
  };
  const handleAddObservation = async (text: string) => {
    if (!user?.uid || !patientId) return;
    
    try {
      const newObservation = {
        text,
        createdAt: new Date().toISOString(),
        authorId: user.uid
      };
      
      await addHealthMetricSecure(user.uid, patientId, 'observations', newObservation);
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
    }
  };
  const handleEditObservation = async (id: string, text: string) => {
    if (!user?.uid || !patientId) return;
    
    try {
      await updateHealthMetricSecure(user.uid, patientId, 'observations', id, { text });
    } catch (error) {
      console.error('Erro ao editar observação:', error);
    }
  };
  const handleDeleteObservation = async (id: string) => {
    if (!user?.uid || !patientId) return;
    
    try {
      await removeHealthMetricSecure(user.uid, patientId, 'observations', id);
    } catch (error) {
      console.error('Erro ao excluir observação:', error);
    }
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
        observations={observations}
        onAddObservation={handleAddObservation}
        onEditObservation={handleEditObservation}
        onDeleteObservation={handleDeleteObservation}
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
        currentPatient={patientWithMetricsArray}
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
      />
    </PageContainer>
  );
};

export default PatientDetailPage;

function normalizePatient(data: any, patientId: string) {
  return {
    id: patientId,
    name: data.name ?? '',
    cpf: data.cpf ?? '',
    status: data.status ?? '',
    age: data.age ?? 0,
    birthDate: data.birthDate ?? '',
    gender: data.gender ?? '',
    address: data.address ?? '',
    phone: data.phone ?? '',
    conditions: data.conditions ?? [],
    weight: data.weight ?? [],
    glucose: data.glucose ?? [],
    temperature: data.temperature ?? [],
    bloodPressure: data.bloodPressure ?? [],
    heartRate: data.heartRate ?? [],
    oxygen: data.oxygen ?? [],
    lastCheck: data.lastCheck ?? '',
    medications: data.medications ?? [],
    appointments: data.appointments ? Object.values(data.appointments) : [],
    observations: data.observations ? Object.values(data.observations) : [],
    createdBy: data.createdBy ?? '',
    editedBy: data.editedBy ?? '',
    editedAt: data.editedAt ?? '',
  };
}

