//Exibe o histórico de peso e IMC do paciente

import { Weight } from 'lucide-react';
import HealthMetricDisplay from './HealthMetricDisplay';
import WeightRecord from './WeightRecord';

type WeightMetricProps = {
  records: any[];
  onEdit: (record: any, index: number) => void;
  onDelete: (id: string) => void;
};

const WeightMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay title="Histórico de Peso e IMC" icon={''}>
    <WeightRecord records={records} onEdit={onEdit} onDelete={onDelete} />
  </HealthMetricDisplay>
);

export default WeightMetric;