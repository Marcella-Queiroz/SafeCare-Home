//Exibe o histórico de Saturação

import OpacityIcon from '@mui/icons-material/Opacity';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const OxygenMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Saturação"
    icon={<OpacityIcon sx={{ color: '#00bcd4', mr: 1, verticalAlign: 'text-bottom' }} />}
    tooltipText="Saturação baixa: < 95%. Normal: 95% a 100%. Valores persistentemente abaixo de 92% indicam alerta."
  >
    <BasicMetricRecord
      records={Array.isArray(records) ? records : []}
      onEdit={onEdit}
      onDelete={onDelete}
      mainField="value"
      unit="%"
    />
  </HealthMetricDisplay>
);

export default OxygenMetric;
