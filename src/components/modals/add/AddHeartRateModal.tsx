import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface AddHeartRateModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddHeartRateModal = ({ open, onClose, userId, patientId, onSave }: AddHeartRateModalProps) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    if (!value || !date) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }
    try {
      await onSave({ value, date, time });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
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
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Frequência Cardíaca</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Registro adicionado!</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Frequência (bpm)"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
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