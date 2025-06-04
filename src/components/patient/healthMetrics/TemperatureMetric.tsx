// Exibe o histórico de Temperatura

import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const TemperatureMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Temperatura"
    icon={<DeviceThermostatIcon sx={{ color: '#1976d2', mr: 1, verticalAlign: 'text-bottom' }} />}
  >
    <BasicMetricRecord records={Array.isArray(records) ? records : []} onEdit={onEdit} onDelete={onDelete} />
  </HealthMetricDisplay>
);

export default TemperatureMetric;

