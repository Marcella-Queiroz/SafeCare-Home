//Exibe o histórico de pressão arterial

import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

// Garante que cada registro tenha o campo value no formato "120/80"
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
    tooltipText="Valores de glicose registrados para o paciente."
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
