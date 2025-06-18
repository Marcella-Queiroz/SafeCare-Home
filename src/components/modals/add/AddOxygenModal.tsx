// Cadastrar saturação

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { getDatabase, ref, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';

interface AddOxygenModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  patientCreatedAt: string;
  userName: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddOxygenModal = ({ open, onClose, userId, patientId, patientCreatedAt, userName, onSave }: AddOxygenModalProps) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(patientCreatedAt);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    setLoading(true);
    setError('');
    if (!value || !date) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }
    try {
      await onSave({ value, date, time, createdBy: userName });

      // Atualiza o campo lastCheck do paciente
      const db = getDatabase();
      const patientRef = ref(db, `patients/${userId}/${patientId}`);
      const now = new Date();
      const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await update(patientRef, { lastCheck });


      setValue('');
      setDate(patientCreatedAt);
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
    setDate(patientCreatedAt);
    setTime('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Saturação de Oxigênio</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Saturação (%)"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.OXYGEN || 3 }}
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              required
              fullWidth
              id="date"
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
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

export default AddOxygenModal;