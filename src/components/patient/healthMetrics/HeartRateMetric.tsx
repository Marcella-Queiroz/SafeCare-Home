import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';
import { healthMetricMockData } from './HealthMetricData';

const HeartRateMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Frequência Cardíaca"
      icon={<MonitorHeartIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
    >
      <BasicMetricRecord records={healthMetricMockData.heartRate} />
    </HealthMetricDisplay>
  );
};

export default HeartRateMetric;