import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { getDatabase, ref, update } from "firebase/database";
import { validateHeartRate } from '@/utils/validations';

interface AddHeartRateModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  patientCreatedAt: string;
  userName: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddHeartRateModal = ({ open, onClose, userId, patientId, patientCreatedAt, userName, onSave }: AddHeartRateModalProps) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const validation = validateHeartRate(value, date, patientCreatedAt);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }
    
    try {
      await onSave({ value, date, time, authorId: userId, createdBy: userName });
      const { updateLastCheckSecure } = await import('../../../utils/securityUtils');
      await updateLastCheckSecure(userId, patientId);

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
      <DialogTitle>Adicionar Frequência Cardíaca</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Frequência (bpm)"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              fullWidth
              required
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

export default AddHeartRateModal;