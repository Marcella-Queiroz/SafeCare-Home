import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';
import { healthMetricMockData } from './HealthMetricData';

const GlucoseMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Glicose"
      icon={<BloodtypeIcon sx={{ color: '#ff9800', mr: 1, verticalAlign: 'text-bottom' }} />}
    >
      <BasicMetricRecord records={healthMetricMockData.glucose} />
    </HealthMetricDisplay>
  );
};

export default GlucoseMetric;
