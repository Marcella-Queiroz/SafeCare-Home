//Exibe e organiza informações detalhadas sobre um paciente.

import PatientHeader from './PatientHeader';
import HealthMetricsGrid from './HealthMetricsGrid';
import MedicationsSection from './MedicationsSection';
import AppointmentsSection from './AppointmentsSection';
import { Typography, Box } from '@mui/material';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

interface PatientDetailContentProps {
  patient: any;
  onClose: () => void;
  onEditPatient: () => void;
  onMetricClick: (type: HealthMetricType) => void;
  onAddMedication: () => void;
  onEditMedication: (medication: any, index: number) => void;
  onDeleteMedication: (index: number) => void;
  onAddAppointment: () => void;
  onEditAppointment: (appointment: any, index: number) => void;
  onDeleteAppointment: (index: number) => void;
}

const PatientDetailContent = ({
  patient,
  onClose,
  onEditPatient,
  onMetricClick,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}: PatientDetailContentProps) => {
  const getLastMetric = (metricArr: any[] | undefined, unit?: string) => {
    if (Array.isArray(metricArr) && metricArr.length > 0) {
      const last = metricArr[metricArr.length - 1];
      return `${last.value}${unit ? ` ${unit}` : ''}`;
    }
    return 'Não cadastrado';
  };

  return (
    <>
      <PatientHeader 
        patient={patient} 
        onClose={onClose} 
        onEditPatient={onEditPatient}
      />

      <HealthMetricsGrid 
        onMetricClick={onMetricClick} 
      />
      
      <MedicationsSection
        medications={patient.medications}
        onAddMedication={onAddMedication}
        onEditMedication={onEditMedication}
        onDeleteMedication={onDeleteMedication}
      />
      
      <AppointmentsSection
        appointments={patient.appointments}
        onAddAppointment={onAddAppointment}
        onEditAppointment={onEditAppointment}
        onDeleteAppointment={onDeleteAppointment}
      />
    </>
  );
};

export default PatientDetailContent;