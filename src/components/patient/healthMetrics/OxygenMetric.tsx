//Exibe o histórico de Saturação

import OpacityIcon from '@mui/icons-material/Opacity';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const OxygenMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Saturação"
    icon={<OpacityIcon sx={{ color: '#00bcd4', mr: 1, verticalAlign: 'text-bottom' }} />}
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
