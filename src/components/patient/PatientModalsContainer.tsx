//Gerencia vários modais para manipulação de dados de pacientes

import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddWeightModal from "../modals/add/AddWeightModal";
import AddMedicationModal from "../modals/add/AddMedicationModal";
import EditMedicationModal from "../modals/edit/EditMedicationModal";
import EditAppointmentModal from "../modals/edit/EditAppointmentModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import AddAppointmentModal from "../modals/add/AddAppointmentModal";
import EditPatientModal from "../modals/edit/EditPatientModal";
import EditWeightModal from "../modals/edit/EditWeightModal";
import EditGlucoseModal from "../modals/edit/EditGlucoseModal";
import EditBloodPressureModal from "../modals/edit/EditBloodPressureModal";
import EditTemperatureModal from "../modals/edit/EditTemperatureModal";
import EditOxygenModal from "../modals/edit/EditOxygenModal";
import EditHeartRateModal from "../modals/edit/EditHeartRateModal";
import AddBloodPressureModal from "../modals/add/AddBloodPressureModal";
import AddGlucoseModal from "../modals/add/AddGlucoseModal";
import AddTemperatureModal from "../modals/add/AddTemperatureModal";
import AddOxygenModal from "../modals/add/AddOxygenModal";
import AddHeartRateModal from "../modals/add/AddHeartRateModal";
import { useState } from "react";
import { getDatabase, ref as dbRef, remove, get, update } from "firebase/database";
import HealthMetricModal from "../modals/HealthMetricModal";
import { useAuth } from "@/contexts/AuthContext";

// Função utilitária para garantir array de métricas
function toArray(records: any) {
  if (Array.isArray(records)) return records;
  if (records && typeof records === "object") {
    return Object.entries(records).map(([id, data]) =>
      typeof data === "object" && data !== null
        ? { id, ...data }
        : { id, value: data }
    );
  }
  return [];
}

type HealthMetricType =
  | "bloodPressure"
  | "weight"
  | "oxygen"
  | "temperature"
  | "glucose"
  | "heartRate";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 400 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
};

interface PatientModalsContainerProps {
  userId?: string;
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
  editWeightModalOpen: boolean;
  setEditWeightModalOpen: (open: boolean) => void;
  editingWeight: any;
  setEditingWeight: (weight: any) => void;
  editGlucoseModalOpen: boolean;
  setEditGlucoseModalOpen: (open: boolean) => void;
  editingGlucose: any;
  setEditingGlucose: (glucose: any) => void;
  editBloodPressureModalOpen: boolean;
  setEditBloodPressureModalOpen: (open: boolean) => void;
  editingBloodPressure: any;
  setEditingBloodPressure: (bloodPressure: any) => void;
  editTemperatureModalOpen: boolean;
  setEditTemperatureModalOpen: (open: boolean) => void;
  editingTemperature: any;
  setEditingTemperature: (temperature: any) => void;
  editOxygenModalOpen: boolean;
  setEditOxygenModalOpen: (open: boolean) => void;
  editingOxygen: any;
  setEditingOxygen: (oxygen: any) => void;
  editHeartRateModalOpen: boolean;
  setEditHeartRateModalOpen: (open: boolean) => void;
  editingHeartRate: any;
  setEditingHeartRate: (heartRate: any) => void;
  onSaveWeight: (data: any) => Promise<void> | void;
  onSaveGlucose: (data: any) => Promise<void> | void;
  onSaveBloodPressure: (data: any) => Promise<void> | void;
  onSaveTemperature: (data: any) => Promise<void> | void;
  onSaveOxygen: (data: any) => Promise<void> | void;
  onSaveHeartRate: (data: any) => Promise<void> | void;
  onEditWeight: (data: any) => Promise<void> | void;
  onEditGlucose: (data: any) => Promise<void> | void;
  onEditBloodPressure: (data: any) => Promise<void> | void;
  onEditTemperature: (data: any) => Promise<void> | void;
  onEditOxygen: (data: any) => Promise<void> | void;
  onEditHeartRate: (data: any) => Promise<void> | void;
}

const PatientModalsContainer = ({
  userId,
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
  onSavePatient,
  editWeightModalOpen,
  setEditWeightModalOpen,
  editingWeight,
  setEditingWeight,
  editGlucoseModalOpen,
  setEditGlucoseModalOpen,
  editingGlucose,
  setEditingGlucose,
  editBloodPressureModalOpen,
  setEditBloodPressureModalOpen,
  editingBloodPressure,
  setEditingBloodPressure,
  editTemperatureModalOpen,
  setEditTemperatureModalOpen,
  editingTemperature,
  setEditingTemperature,
  editOxygenModalOpen,
  setEditOxygenModalOpen,
  editingOxygen,
  setEditingOxygen,
  editHeartRateModalOpen,
  setEditHeartRateModalOpen,
  editingHeartRate,
  setEditingHeartRate,
  onSaveWeight,
  onSaveGlucose,
  onSaveBloodPressure,
  onSaveTemperature,
  onSaveOxygen,
  onSaveHeartRate,
  onEditWeight,
  onEditGlucose,
  onEditBloodPressure,
  onEditTemperature,
  onEditOxygen,
  onEditHeartRate,
}: PatientModalsContainerProps) => {
  const [addBloodPressureModalOpen, setAddBloodPressureModalOpen] =
    useState(false);
  const [addGlucoseModalOpen, setAddGlucoseModalOpen] = useState(false);
  const [addTemperatureModalOpen, setAddTemperatureModalOpen] = useState(false);
  const [addOxygenModalOpen, setAddOxygenModalOpen] = useState(false);
  const [addHeartRateModalOpen, setAddHeartRateModalOpen] = useState(false);
  const [deleteMetricModalOpen, setDeleteMetricModalOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<{
    record: any;
    type: string;
  } | null>(null);

  const { user } = useAuth();
  const userName = user?.displayName || user?.name || user?.email || user?.uid || "";

  // Funções para abrir cada modal
  const handleAddBloodPressure = () => setAddBloodPressureModalOpen(true);
  const handleAddGlucose = () => setAddGlucoseModalOpen(true);
  const handleAddTemperature = () => setAddTemperatureModalOpen(true);
  const handleAddOxygen = () => setAddOxygenModalOpen(true);
  const handleAddHeartRate = () => setAddHeartRateModalOpen(true);

  // Funções de exclusão para cada métrica
  const handleDeleteWeight = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/weight/${record.id}`
      )
    );
  };

  const handleDeleteGlucose = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/glucose/${record.id}`
      )
    );
  };

  const handleDeleteBloodPressure = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/bloodPressure/${record.id}`
      )
    );
  };

  const handleDeleteTemperature = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/temperature/${record.id}`
      )
    );
  };

  const handleDeleteOxygen = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/oxygen/${record.id}`
      )
    );
  };

  const handleDeleteHeartRate = async (record, index) => {
    if (!userId || !patientId || !record.id) return;
    await remove(
      dbRef(
        getDatabase(),
        `patients/${userId}/${patientId}/heartRate/${record.id}`
      )
    );
  };

  const [editingMedication, setEditingMedication] = useState<any>(null);

  // Função de edição de medicamento
  const onEditMedication = async (medicationEditado: any) => {
    if (!userId || !patientId) return;
    const db = getDatabase();
    const patientRef = dbRef(db, `patients/${userId}/${patientId}`);
    const snapshot = await get(patientRef); // corrigido
    const patientData = snapshot.val() || {};
    const medications = patientData.medications || [];
    // Busca pelo id único
    const index = medications.findIndex(
      (med: any) => med.id === medicationEditado.id
    );
    if (index !== -1) {
      medications[index] = {
        ...medicationEditado,
        editedBy: userName,
      };
      await update(patientRef, { medications }); // corrigido
    }
    setEditMedicationModalOpen(false);
    setEditingMedication(null);
  };

  return (
    <>
      <AddWeightModal
        open={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveWeight}
        userName={userName}
      />

      <AddMedicationModal
        open={medicationModalOpen}
        onClose={() => setMedicationModalOpen(false)}
        userId={userId}
        patientId={patientId}
        userName={userName}
      />

      <EditMedicationModal
        open={editMedicationModalOpen}
        onClose={() => {
          setEditMedicationModalOpen(false);
          setEditingMedication(null);
        }}
        medication={editingMedication}
        onSave={onEditMedication}
        userName={userName}
      />

      <EditAppointmentModal
        open={editAppointmentModalOpen}
        onClose={() => setEditAppointmentModalOpen(false)}
        appointment={selectedAppointment}
        onSave={onSaveAppointment}
        userName={userName}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMedicationToDelete(null);
          setAppointmentToDelete(null);
        }}
        onConfirm={onConfirmDelete}
        title={
          medicationToDelete !== null
            ? "Excluir Medicamento"
            : "Excluir Agendamento"
        }
        message={
          medicationToDelete !== null
            ? "Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        }
      />

      <AddAppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        userId={userId}
        patientId={patientId}
        userName={userName}
      />

      <EditPatientModal
        open={editPatientModalOpen}
        onClose={() => setEditPatientModalOpen(false)}
        patient={currentPatient}
        userId={userId}
        onSave={onSavePatient}
      />

      <Modal
        open={healthMetricModal.open}
        onClose={onCloseHealthMetricModal}
        aria-labelledby="health-metric-modal"
      >
        <Box
          sx={{
            ...modalStyle,
            maxHeight: "80vh",
            overflow: "auto",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={onCloseHealthMetricModal}
          >
            <CloseIcon />
          </IconButton>
          {healthMetricModal.type && (
            <HealthMetricModal
              open={healthMetricModal.open}
              type={healthMetricModal.type}
              patient={currentPatient}
              onAddRecord={
                healthMetricModal.type === "weight"
                  ? () => setWeightModalOpen(true)
                  : healthMetricModal.type === "bloodPressure"
                  ? () => setAddBloodPressureModalOpen(true)
                  : healthMetricModal.type === "glucose"
                  ? () => setAddGlucoseModalOpen(true)
                  : healthMetricModal.type === "temperature"
                  ? () => setAddTemperatureModalOpen(true)
                  : healthMetricModal.type === "oxygen"
                  ? () => setAddOxygenModalOpen(true)
                  : healthMetricModal.type === "heartRate"
                  ? () => setAddHeartRateModalOpen(true)
                  : undefined
              }
              onDeleteRecord={(id) => {
                const records = toArray(
                  currentPatient?.[healthMetricModal.type]
                );
                const record = records.find((r: any) => r.id === id);
                if (record) {
                  setMetricToDelete({ record, type: healthMetricModal.type });
                  setDeleteMetricModalOpen(true);
                }
              }}
              onClose={onCloseHealthMetricModal}
              setEditingWeight={setEditingWeight}
              setEditWeightModalOpen={setEditWeightModalOpen}
              setEditingGlucose={setEditingGlucose}
              setEditGlucoseModalOpen={setEditGlucoseModalOpen}
              setEditingBloodPressure={setEditingBloodPressure}
              setEditBloodPressureModalOpen={setEditBloodPressureModalOpen}
              setEditingTemperature={setEditingTemperature}
              setEditTemperatureModalOpen={setEditTemperatureModalOpen}
              setEditingOxygen={setEditingOxygen}
              setEditOxygenModalOpen={setEditOxygenModalOpen}
              setEditingHeartRate={setEditingHeartRate}
              setEditHeartRateModalOpen={setEditHeartRateModalOpen}
            />
          )}
        </Box>
      </Modal>

      <EditWeightModal
        open={editWeightModalOpen}
        onClose={() => setEditWeightModalOpen(false)}
        record={editingWeight}
        onSave={onEditWeight}
        userId={userId || ""}
        patientId={patientId || ""}
        patientCreatedAt={""}
        userName={userName}
      />
      <EditGlucoseModal
        open={editGlucoseModalOpen}
        onClose={() => setEditGlucoseModalOpen(false)}
        record={editingGlucose}
        onSave={onEditGlucose}
        patientCreatedAt={""}
        userName={userName}
      />
      <EditBloodPressureModal
        open={editBloodPressureModalOpen}
        onClose={() => setEditBloodPressureModalOpen(false)}
        record={editingBloodPressure}
        onSave={onEditBloodPressure}
        patientCreatedAt={""}
        userName={userName}
      />
      <EditTemperatureModal
        open={editTemperatureModalOpen}
        onClose={() => setEditTemperatureModalOpen(false)}
        record={editingTemperature}
        onSave={onEditTemperature}
        patientCreatedAt={""}
        userName={userName}
      />
      <EditOxygenModal
        open={editOxygenModalOpen}
        onClose={() => setEditOxygenModalOpen(false)}
        record={editingOxygen}
        onSave={onEditOxygen}
        patientCreatedAt={""}
        userName={userName}
      />
      <EditHeartRateModal
        open={editHeartRateModalOpen}
        onClose={() => setEditHeartRateModalOpen(false)}
        record={editingHeartRate}
        onSave={onEditHeartRate}
        patientCreatedAt={""}
        userName={userName}
      />
      {/* Inclua os modais de adicionar registro: */}
      <AddGlucoseModal
        open={addGlucoseModalOpen}
        onClose={() => setAddGlucoseModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveGlucose}
        patientCreatedAt={""}
        userName={userName}
      />
      <AddBloodPressureModal
        open={addBloodPressureModalOpen}
        onClose={() => setAddBloodPressureModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveBloodPressure}
        patientCreatedAt={""}
        userName={userName}
      />
      <AddTemperatureModal
        open={addTemperatureModalOpen}
        onClose={() => setAddTemperatureModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveTemperature}
        patientCreatedAt={""}
        userName={userName}
      />
      <AddOxygenModal
        open={addOxygenModalOpen}
        onClose={() => setAddOxygenModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveOxygen}
        patientCreatedAt={""}
        userName={userName}
      />
      <AddHeartRateModal
        open={addHeartRateModalOpen}
        onClose={() => setAddHeartRateModalOpen(false)}
        userId={userId}
        patientId={patientId}
        onSave={onSaveHeartRate}
        patientCreatedAt={""}
        userName={userName}
      />

      <DeleteConfirmationModal
        open={deleteMetricModalOpen}
        onClose={() => setDeleteMetricModalOpen(false)}
        onConfirm={async () => {
          switch (metricToDelete?.type) {
            case "weight":
              await handleDeleteWeight(metricToDelete.record, 0);
              break;
            case "glucose":
              await handleDeleteGlucose(metricToDelete.record, 0);
              break;
            case "bloodPressure":
              await handleDeleteBloodPressure(metricToDelete.record, 0);
              break;
            case "temperature":
              await handleDeleteTemperature(metricToDelete.record, 0);
              break;
            case "oxygen":
              await handleDeleteOxygen(metricToDelete.record, 0);
              break;
            case "heartRate":
              await handleDeleteHeartRate(metricToDelete.record, 0);
              break;
            default:
              break;
          }
          setDeleteMetricModalOpen(false);
        }}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
      />
    </>
  );
};

export default PatientModalsContainer;