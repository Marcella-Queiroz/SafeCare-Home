// Componente principal de exibição e organização das informações detalhadas do paciente

import PatientHeader from './PatientHeader';
import HealthMetricsGrid from './HealthMetricsGrid';
import MedicationsSection from './MedicationsSection';
import AppointmentsSection from './AppointmentsSection';
import ObservationsSection from './ObservationsSection';
import { Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

import { Patient, Observation } from '../../types/patient';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

interface PatientDetailContentProps {
  patient: Patient;
  onClose: () => void;
  onEditPatient: () => void;
  onMetricClick: (type: HealthMetricType) => void;
  onAddMedication: () => void;
  onEditMedication: (medication: any, index: number) => void;
  onDeleteMedication: (index: number) => void;
  onAddAppointment: () => void;
  onEditAppointment: (appointment: any, index: number) => void;
  onDeleteAppointment: (index: number) => void;
  observations: Observation[];
  onAddObservation: (text: string) => void;
  onEditObservation: (id: string, text: string) => void;
  onDeleteObservation: (id: string) => void;
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
  onDeleteAppointment,
  observations,
  onAddObservation,
  onEditObservation,
  onDeleteObservation
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
        weight={patient.weight}
        bloodPressure={patient.bloodPressure}
        glucose={patient.glucose}
        temperature={patient.temperature}
        oxygen={patient.oxygen}
        heartRate={patient.heartRate}
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

      <ObservationsSection
        observations={observations}
        onAdd={onAddObservation}
        onEdit={onEditObservation}
        onDelete={onDeleteObservation}
      />
    </>
  );
};

export default PatientDetailContent;