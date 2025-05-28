import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';
import { healthMetricMockData } from './HealthMetricData';  

const BloodPressureMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Pressão Arterial"
      icon={<FavoriteIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
    >
      <BasicMetricRecord records={healthMetricMockData.bloodPressure} />
    </HealthMetricDisplay>
  );
};

export default BloodPressureMetric;
