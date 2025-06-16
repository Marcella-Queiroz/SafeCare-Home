//Exibe e organiza informações detalhadas sobre um paciente.

import PatientHeader from './PatientHeader';
import HealthMetricsGrid from './HealthMetricsGrid';
import MedicationsSection from './MedicationsSection';
import AppointmentsSection from './AppointmentsSection';
import ObservationsSection, { Observation } from './ObservationsSection';
import { Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

export interface Patient {
  phone: ReactNode;
  name: string;
  status: string;
  age: number;
  birthDate: string;
  gender?: string;
  address?: string;
  conditions: string[];
  weight?: any[];
  glucose?: any[];
  temperature?: any[];
  bloodPressure?: any[];
  heartRate?: any[];
  oxygen?: any[];
  lastCheck?: string;
  medications?: any[];
  appointments?: any[];
  observations?: Observation[];
}

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
  // Adicione as props abaixo:
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

      {/* Adicione a seção de observações */}
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