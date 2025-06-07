// Exibe o histórico de glicose

import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import HealthMetricDisplay from './HealthMetricDisplay';
import BasicMetricRecord from './BasicMetricRecord';

const GlucoseMetric = ({ records, onEdit, onDelete }) => (
  <HealthMetricDisplay
    title="Histórico de Glicose"
    icon={<BloodtypeIcon sx={{ color: '#ff9800', mr: 1, verticalAlign: 'text-bottom' }} />}
    tooltipText="Valores de glicose registrados para o paciente."
  >
    <BasicMetricRecord
      records={records}
      onEdit={onEdit}
      onDelete={onDelete}
      mainField="glucose"
      unit="mg/dL"
    />
  </HealthMetricDisplay>
);

export default GlucoseMetric;
