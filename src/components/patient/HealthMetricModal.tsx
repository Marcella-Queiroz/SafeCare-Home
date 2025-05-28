import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BloodPressureMetric from './healthMetrics/BloodPressureMetric';
import WeightMetric from './healthMetrics/WeightMetric';
import OxygenMetric from './healthMetrics/OxygenMetric';
import TemperatureMetric from './healthMetrics/TemperatureMetric';
import GlucoseMetric from './healthMetrics/GlucoseMetric';
import HeartRateMetric from './healthMetrics/HeartRateMetric';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

interface HealthMetricModalProps {
  type: HealthMetricType;
  onAddRecord?: () => void;
  onClose: () => void;
}

const HealthMetricModal = ({ type, onAddRecord, onClose }: HealthMetricModalProps) => {
  const getModalContent = () => {
    switch (type) {
      case 'bloodPressure':
        return <BloodPressureMetric />;
      case 'weight':
        return <WeightMetric />;
      case 'oxygen':
        return <OxygenMetric />;
      case 'temperature':
        return <TemperatureMetric />;
      case 'glucose':
        return <GlucoseMetric />;
      case 'heartRate':
        return <HeartRateMetric />;
      default:
        return null;
    }
  };

  const handleAddRecord = () => {
    if (type === 'weight' && onAddRecord) {
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
        onClick={type === 'weight' ? handleAddRecord : undefined}
      >
        Adicionar registro
      </Button>
    </>
  );
};

export default HealthMetricModal;
