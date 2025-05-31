//Exibe o histórico de Saturação

import OpacityIcon from '@mui/icons-material/Opacity';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';
import { healthMetricMockData } from './HealthMetricData';

const OxygenMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Saturação O₂"
      icon={<OpacityIcon sx={{ color: '#1e88e5', mr: 1, verticalAlign: 'text-bottom' }} />}
    >
      <BasicMetricRecord records={healthMetricMockData.oxygen} />
    </HealthMetricDisplay>
  );
};

export default OxygenMetric;
