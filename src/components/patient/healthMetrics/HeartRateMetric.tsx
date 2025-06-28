// Componente para exibição do histórico de frequência cardíaca do paciente

import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const HeartRateMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Frequência Cardíaca"
    icon={<MonitorHeartIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
    tooltipText="Baixa: < 60 bpm (bradicardia). Normal: 60-100 bpm. Alta: > 100 bpm (taquicardia)."
  >
    <BasicMetricRecord
      records={Array.isArray(records) ? records : []}
      onEdit={onEdit}
      onDelete={onDelete}
      mainField="value"
      unit="bpm"
    />
  </HealthMetricDisplay>
);

export default HeartRateMetric;