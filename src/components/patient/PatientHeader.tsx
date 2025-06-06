//Card da ficha do paciente da tela de detalhes do paciente

import { Box, Typography, Card, CardContent, Button, Divider, Chip, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { getDatabase, ref, update } from "firebase/database";

interface PatientHeaderProps {
  patient: {
    name: string;
    status: string;
    age: number;
    conditions: string[];
    weight?: any[];
    glucose?: any[];
    temperature?: any[];
    bloodPressure?: any[];
    heartRate?: any[];
    lastCheck?: string;
  };
  onClose: () => void;
  onEditPatient: () => void;
}

const getLastMetric = (
  metricArr: any[] | undefined,
  field: string,
  unit?: string
) => {
  if (Array.isArray(metricArr) && metricArr.length > 0) {
    const last = metricArr[metricArr.length - 1];
    const value = last[field];
    return value !== undefined && value !== null
      ? `${value}${unit ? ` ${unit}` : ''}`
      : 'Não cadastrado';
  }
  return 'Não cadastrado';
};

const PatientHeader = ({ patient, onClose, onEditPatient }: PatientHeaderProps) => {
  const db = getDatabase();
  const patientId = "ID_DO_PACIENTE"; // Substitua pelo id real do paciente
  const now = new Date();
  const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleSaveLastCheck = async () => {
    await update(ref(db, `patients/${patientId}`), { lastCheck });
  };

  return (
    <Card sx={{ mb: 3, position: 'relative', borderRadius: 3 }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Ficha do Paciente
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              {patient.name}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {patient.age} anos - {patient.conditions.join(', ')}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            sx={{ borderRadius: 2 }}
            onClick={onEditPatient}
          >
            Editar
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container columnSpacing={7} rowSpacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Peso:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.weight, 'weight', 'kg')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Glicose:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.glucose, 'value', 'mg/dL')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Temperatura:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.temperature, 'value', '°C')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Saturação:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.oxygen, 'value', '%')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Frequência Cardíaca:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.heartRate, 'value', 'bpm')}
            </Typography>
          </Grid>
          {patient.lastCheck && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Última verificação: {patient.lastCheck}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientHeader;