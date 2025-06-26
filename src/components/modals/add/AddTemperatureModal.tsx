import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { getDatabase, ref, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';
import { validateTemperature } from '@/utils/validations';
import { useAuth } from '@/contexts/AuthContext';

interface AddTemperatureModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  patientCreatedAt: string;
  userName: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddTemperatureModal = ({ open, onClose, userId, patientId, patientCreatedAt, userName, onSave }: AddTemperatureModalProps) => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    // Validação usando função padronizada
    const validation = validateTemperature(value, date, patientCreatedAt);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }
    
    try {
      await onSave({ value, date, time, createdBy: userName });

      // Atualiza o campo lastCheck do paciente usando função segura
      if (user?.uid && patientId) {
        const { updateLastCheckSecure } = await import('@/utils/securityUtils');
        await updateLastCheckSecure(user.uid, patientId);
      }

      setValue('');
      setDate('');
      setTime('');
      setError('');
      
      onClose();
    } catch {
      setError('Erro ao salvar dados');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setValue('');
    setDate('');
    setTime('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Temperatura</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Temperatura (°C)"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.TEMPERATURE }}
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              inputProps={{
                min: patientCreatedAt || '1900-01-01',
                max: today,
              }}
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Hora"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTemperatureModal;