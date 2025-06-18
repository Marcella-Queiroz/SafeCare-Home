import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { getDatabase, ref, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';

interface AddBloodPressureModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  patientCreatedAt: string;
  userName: string; // <-- NOVO
  onSave: (data: any) => void | Promise<void>;
}

const AddBloodPressureModal = ({ open, onClose, userId, patientId, patientCreatedAt, userName, onSave }: AddBloodPressureModalProps) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD

  const handleSave = async () => {
    setLoading(true);
    setError('');
    if (!systolic || !diastolic || !date) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }
    try {
      await onSave({ systolic, diastolic, date, time, createdBy: userName }); // <-- Adicione createdBy

      // Atualize o campo lastCheck do paciente
      const db = getDatabase();
      const patientRef = ref(db, `patients/${userId}/${patientId}`);
      const now = new Date();
      const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await update(patientRef, { lastCheck });

      setSystolic('');
      setDiastolic('');
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
    setSystolic('');
    setDiastolic('');
    setDate('');
    setTime('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Pressão Arterial</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Sistólica (mmHg)"
              type="number"
              value={systolic}
              onChange={e => setSystolic(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.SYSTOLIC }}
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Diastólica (mmHg)"
              type="number"
              value={diastolic}
              onChange={e => setDiastolic(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.DIASTOLIC }}
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

export default AddBloodPressureModal;