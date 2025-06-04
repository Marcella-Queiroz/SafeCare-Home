//Exibe o histórico de peso e IMC do paciente

import { Weight } from 'lucide-react';
import HealthMetricDisplay from './HealthMetricDisplay';
import WeightRecord from './WeightRecord';

type WeightRecordProps = {
  records: any[];
  onEdit: (record: any, index: number) => void;
  // Adicione onDelete nas props
  onDelete: (record: any, index: number) => void;
};

const WeightMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay title="Histórico de Peso e IMC" icon={''}>
    <WeightRecord records={records} onEdit={onEdit} onDelete={onDelete} />
  </HealthMetricDisplay>
);

export default WeightMetric;