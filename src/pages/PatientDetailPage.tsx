//Pagina de detalhes do paciente

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import PageContainer from '../components/PageContainer';
import { getDatabase, ref, get } from "firebase/database";
import { app } from '@/services/firebaseConfig';
import PatientDetailContent from '../components/patient/PatientDetailContent';
import PatientModalsContainer from '../components/patient/PatientModalsContainer';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [editMedicationModalOpen, setEditMedicationModalOpen] = useState(false);
  const [editAppointmentModalOpen, setEditAppointmentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);

  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<number | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [healthMetricModal, setHealthMetricModal] = useState<{
    open: boolean;
    type: HealthMetricType | null;
  }>({
    open: false,
    type: null
  });

  // Busca paciente no Firebase pelo id da URL
  useEffect(() => {
    if (!id) return;
    const db = getDatabase(app);
    const patientRef = ref(db, `patients/${id}`);
    get(patientRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCurrentPatient({ id, ...snapshot.val() });
      }
      setLoading(false);
    });
  }, [id]);

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

  const handleSaveMedication = (updatedMedication: any) => {
    // Implemente a lógica de salvar no Firebase se desejar
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

  const handleSaveAppointment = (updatedAppointment: any) => {
    // Implemente a lógica de salvar no Firebase se desejar
    setEditAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };

  const confirmDelete = () => {
    if (medicationToDelete !== null) {
      // Implemente a lógica de deletar no Firebase se desejar
      setMedicationToDelete(null);
    } else if (appointmentToDelete !== null) {
      // Implemente a lógica de deletar no Firebase se desejar
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

  return (
    <PageContainer>
      <PatientDetailContent
        patient={currentPatient}
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
        patientId={id}
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
        onCloseHealthMetricModal={handleCloseHealthMetricModal}
        onSaveMedication={handleSaveMedication}
        onSaveAppointment={handleSaveAppointment}
        onConfirmDelete={confirmDelete}
        onSavePatient={handleSavePatient}
      />
    </PageContainer>
  );
};

export default PatientDetailPage;