//Exibe o histórico de Frequência Cardíaca

import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const HeartRateMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Frequência Cardíaca"
    icon={<MonitorHeartIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
  >
    <BasicMetricRecord records={Array.isArray(records) ? records : []} onEdit={onEdit} onDelete={onDelete} />
  </HealthMetricDisplay>
);

export default HeartRateMetric;