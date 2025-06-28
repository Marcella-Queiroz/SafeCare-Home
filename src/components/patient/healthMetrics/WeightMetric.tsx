// Componente para exibição do histórico de peso e cálculo do IMC do paciente

import { Weight } from 'lucide-react';
import HealthMetricDisplay from './HealthMetricDisplay';
import WeightRecord from './WeightRecord';
import BasicMetricRecord from './BasicMetricRecord';

type WeightMetricProps = {
  records: any[];
  onEdit: (record: any, index: number) => void;
  onDelete: (id: string) => void;
};

const WeightMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Peso e IMC"
    icon={''}
    tooltipText="IMC abaixo de 18,5: baixo peso. Entre 18,5 e 24,9: peso normal. Entre 25 e 29,9: sobrepeso. 30 ou mais: obesidade."
  >
    <BasicMetricRecord
      records={records}
      onEdit={onEdit}
      onDelete={onDelete}
      mainField="weight"
      unit="kg"
    />
  </HealthMetricDisplay>
);

export default WeightMetric;