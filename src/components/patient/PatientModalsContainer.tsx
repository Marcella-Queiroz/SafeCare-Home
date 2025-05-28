import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddWeightModal from '../modals/AddWeightModal';
import AddMedicationModal from '../modals/AddMedicationModal';
import EditMedicationModal from '../modals/EditMedicationModal';
import EditAppointmentModal from '../modals/EditAppointmentModal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import AddAppointmentModal from '../modals/AddAppointmentModal';
import EditPatientModal from '../modals/EditPatientModal';
import HealthMetricModal from './HealthMetricModal';
import { getDatabase, ref, get, update } from "firebase/database";

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
};

interface PatientModalsContainerProps {
  patientId?: string;
  weightModalOpen: boolean;
  setWeightModalOpen: (open: boolean) => void;
  medicationModalOpen: boolean;
  setMedicationModalOpen: (open: boolean) => void;
  editMedicationModalOpen: boolean;
  setEditMedicationModalOpen: (open: boolean) => void;
  editAppointmentModalOpen: boolean;
  setEditAppointmentModalOpen: (open: boolean) => void;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  appointmentModalOpen: boolean;
  setAppointmentModalOpen: (open: boolean) => void;
  editPatientModalOpen: boolean;
  setEditPatientModalOpen: (open: boolean) => void;
  healthMetricModal: {
    open: boolean;
    type: HealthMetricType | null;
  };
  selectedMedication: any;
  setSelectedMedication: (medication: any) => void;
  selectedAppointment: any;
  setSelectedAppointment: (appointment: any) => void;
  medicationToDelete: number | null;
  setMedicationToDelete: (index: number | null) => void;
  appointmentToDelete: number | null;
  setAppointmentToDelete: (index: number | null) => void;
  currentPatient: any;
  onCloseHealthMetricModal: () => void;
  onSaveMedication: (medication: any) => void;
  onSaveAppointment: (appointment: any) => void;
  onConfirmDelete: () => void;
  onSavePatient: (patient: any) => void;
}

//Função para salvar o novo peso
const handleAddWeight = async (patientId: string, newWeight: number) => {
  const db = getDatabase();
  const patientRef = ref(db, `patients/${patientId}`);
  const snapshot = await get(patientRef);
  const patientData = snapshot.val() || {};
  const weightArray = patientData.weight || [];
  weightArray.push({ value: newWeight, date: new Date().toISOString() });
  await update(patientRef, { weight: weightArray });
};

const PatientModalsContainer = ({
  patientId,
  weightModalOpen,
  setWeightModalOpen,
  medicationModalOpen,
  setMedicationModalOpen,
  editMedicationModalOpen,
  setEditMedicationModalOpen,
  editAppointmentModalOpen,
  setEditAppointmentModalOpen,
  deleteModalOpen,
  setDeleteModalOpen,
  appointmentModalOpen,
  setAppointmentModalOpen,
  editPatientModalOpen,
  setEditPatientModalOpen,
  healthMetricModal,
  selectedMedication,
  setSelectedMedication,
  selectedAppointment,
  setSelectedAppointment,
  medicationToDelete,
  setMedicationToDelete,
  appointmentToDelete,
  setAppointmentToDelete,
  currentPatient,
  onCloseHealthMetricModal,
  onSaveMedication,
  onSaveAppointment,
  onConfirmDelete,
  onSavePatient
}: PatientModalsContainerProps) => {
  return (
    <>
      <AddWeightModal 
        open={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        patientId={patientId}
      />
      
      <AddMedicationModal
        open={medicationModalOpen}
        onClose={() => setMedicationModalOpen(false)}
        patientId={patientId}
      />
      
      <EditMedicationModal
        open={editMedicationModalOpen}
        onClose={() => setEditMedicationModalOpen(false)}
        medication={selectedMedication}
        onSave={onSaveMedication}
      />
      
      <EditAppointmentModal
        open={editAppointmentModalOpen}
        onClose={() => setEditAppointmentModalOpen(false)}
        appointment={selectedAppointment}
        onSave={onSaveAppointment}
      />
      
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMedicationToDelete(null);
          setAppointmentToDelete(null);
        }}
        onConfirm={onConfirmDelete}
        title={medicationToDelete !== null ? "Excluir Medicamento" : "Excluir Agendamento"}
        message={medicationToDelete !== null 
          ? "Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita."
          : "Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        }
      />
      
      <AddAppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        patientId={patientId}
      />
      
      <EditPatientModal
        open={editPatientModalOpen}
        onClose={() => setEditPatientModalOpen(false)}
        patient={currentPatient}
        onSave={onSavePatient}
      />
      
      <Modal
        open={healthMetricModal.open}
        onClose={onCloseHealthMetricModal}
        aria-labelledby="health-metric-modal"
      >
        <Box sx={{
          ...modalStyle,
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={onCloseHealthMetricModal}
          >
            <CloseIcon />
          </IconButton>
          {healthMetricModal.type && (
            <HealthMetricModal
              type={healthMetricModal.type}
              onAddRecord={() => setWeightModalOpen(true)}
              onClose={onCloseHealthMetricModal}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PatientModalsContainer;
