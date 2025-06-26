//Modal que exibe informações sobre as métricas de saúde

import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WeightMetric from '../patient/healthMetrics/WeightMetric';
import GlucoseMetric from '../patient/healthMetrics/GlucoseMetric';
import BloodPressureMetric from '../patient/healthMetrics/BloodPressureMetric';
import TemperatureMetric from '../patient/healthMetrics/TemperatureMetric';
import OxygenMetric from '../patient/healthMetrics/OxygenMetric';
import HeartRateMetric from '../patient/healthMetrics/HeartRateMetric';
import { toArray } from '@/utils/dataUtils';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

interface HealthMetricModalProps {
  open: boolean;
  type: HealthMetricType;
  patient: any;
  onAddRecord?: () => void;
  onClose: () => void;
  setEditingWeight: (record: any) => void;
  setEditWeightModalOpen: (open: boolean) => void;
  setEditingGlucose?: (record: any) => void;
  setEditGlucoseModalOpen?: (open: boolean) => void;
  setEditingBloodPressure?: (record: any) => void;
  setEditBloodPressureModalOpen?: (open: boolean) => void;
  setEditingTemperature?: (record: any) => void;
  setEditTemperatureModalOpen?: (open: boolean) => void;
  setEditingOxygen?: (record: any) => void;
  setEditOxygenModalOpen?: (open: boolean) => void;
  setEditingHeartRate?: (record: any) => void;
  setEditHeartRateModalOpen?: (open: boolean) => void;
  onDeleteRecord?: (id: string) => void;
}

const HealthMetricModal = ({
  type,
  patient,
  onAddRecord,
  onClose,
  setEditingWeight,
  setEditWeightModalOpen,
  setEditingGlucose,
  setEditGlucoseModalOpen,
  setEditingBloodPressure,
  setEditBloodPressureModalOpen,
  setEditingTemperature,
  setEditTemperatureModalOpen,
  setEditingOxygen,
  setEditOxygenModalOpen,
  setEditingHeartRate,
  setEditHeartRateModalOpen,
  onDeleteRecord,
}: HealthMetricModalProps) => {
  const getModalContent = () => {
    switch (type) {
      case 'weight':
        return (
          <WeightMetric
            records={toArray(patient.weight)}
            onEdit={(record, index) => {
              setEditingWeight(record);
              setEditWeightModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      case 'glucose':
        return (
          <GlucoseMetric
            records={toArray(patient.glucose)}
            onEdit={(record, index) => {
              setEditingGlucose && setEditingGlucose({ ...record, index });
              setEditGlucoseModalOpen && setEditGlucoseModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      case 'bloodPressure':
        return (
          <BloodPressureMetric
            records={toArray(patient.bloodPressure)}
            onEdit={(record, index) => {
              setEditingBloodPressure && setEditingBloodPressure({ ...record, index });
              setEditBloodPressureModalOpen && setEditBloodPressureModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      case 'temperature':
        return (
          <TemperatureMetric
            records={toArray(patient.temperature)}
            onEdit={(record, index) => {
              setEditingTemperature && setEditingTemperature({ ...record, index });
              setEditTemperatureModalOpen && setEditTemperatureModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      case 'oxygen':
        return (
          <OxygenMetric
            records={toArray(patient.oxygen)}
            onEdit={(record, index) => {
              setEditingOxygen && setEditingOxygen({ ...record, index });
              setEditOxygenModalOpen && setEditOxygenModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      case 'heartRate':
        return (
          <HeartRateMetric
            records={toArray(patient.heartRate)}
            onEdit={(record, index) => {
              setEditingHeartRate && setEditingHeartRate({ ...record, index });
              setEditHeartRateModalOpen && setEditHeartRateModalOpen(true);
            }}
            onDelete={onDeleteRecord}
          />
        );
      default:
        return null;
    }
  };

  const handleAddRecord = () => {
    if (onAddRecord) {
      onClose();
      onAddRecord();
    }
  };

  return (
    <>
      {getModalContent()}
      <Button
        variant="contained"
        fullWidth
        startIcon={<AddIcon />}
        sx={{ mt: 2, borderRadius: 2 }}
        onClick={handleAddRecord}
      >
        Adicionar registro
      </Button>
    </>
  );
};

export default HealthMetricModal;
