import ThermostatIcon from '@mui/icons-material/Thermostat';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';
import { healthMetricMockData } from './HealthMetricData';

const TemperatureMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Temperatura"
      icon={<ThermostatIcon sx={{ color: '#e53935', mr: 1, verticalAlign: 'text-bottom' }} />}
    >
      <BasicMetricRecord records={healthMetricMockData.temperature} />
    </HealthMetricDisplay>
  );
};

export default TemperatureMetric;
