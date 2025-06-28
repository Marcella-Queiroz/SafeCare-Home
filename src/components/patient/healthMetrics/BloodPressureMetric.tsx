// Componente para exibição do histórico de pressão arterial do paciente

import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

function formatRecords(records: any[]) {
  return (records || []).map((item) => ({
    ...item,
    value:
      item.value ||
      (item.systolic && item.diastolic
        ? `${item.systolic}/${item.diastolic}`
        : '-'),
  }));
}

const BloodPressureMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Pressão Arterial"
    icon={<FavoriteIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
    tooltipText="Pressão baixa: sistólica < 90 mmHg ou diastólica < 60 mmHg. Normal: sistólica 90-130 mmHg e diastólica 60-85 mmHg. Alta: sistólica > 130 mmHg ou diastólica > 85 mmHg."
  >
    <BasicMetricRecord
      records={formatRecords(Array.isArray(records) ? records : [])}
      onEdit={onEdit}
      onDelete={onDelete}
      mainField="value"
      unit="mmHg"
    />
  </HealthMetricDisplay>
);

export default BloodPressureMetric;
