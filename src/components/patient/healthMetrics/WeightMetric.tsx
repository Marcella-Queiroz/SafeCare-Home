//Exibe o histórico de peso e IMC do paciente

import { Weight } from 'lucide-react';
import HealthMetricDisplay from './HealthMetricDisplay';
import WeightRecord from './WeightRecord';
import { healthMetricMockData } from './HealthMetricData';

const WeightMetric = () => {
  return (
    <HealthMetricDisplay
      title="Histórico de Peso e IMC"
      icon={<Weight size={20} style={{ color: '#3949ab', marginRight: '8px', verticalAlign: 'text-bottom' }} />}
    >
      <WeightRecord records={healthMetricMockData.weight} />
    </HealthMetricDisplay>
  );
};

export default WeightMetric;