//Exibe o histórico de peso e IMC do paciente

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
  <HealthMetricDisplay title="Histórico de Peso e IMC" icon={''}>
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