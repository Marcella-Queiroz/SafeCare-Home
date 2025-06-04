//Exibe o histórico de pressão arterial

import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const BloodPressureMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Pressão Arterial"
    icon={<FavoriteIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
  >
    <BasicMetricRecord records={Array.isArray(records) ? records : []} onEdit={onEdit} onDelete={onDelete} />
  </HealthMetricDisplay>
);

export default BloodPressureMetric;
