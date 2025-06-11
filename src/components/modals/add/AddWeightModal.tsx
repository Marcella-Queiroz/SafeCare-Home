import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Grid
} from '@mui/material';
import { getDatabase, ref, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';

//Modal para registrar peso e altura de um paciente

interface AddWeightModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddWeightModal = ({ open, onClose, userId, patientId, onSave }: AddWeightModalProps) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    if (!weight || !height || !date) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }
    // Calculo do IMC
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    const bmi = (weightNum > 0 && heightNum > 0)
      ? (weightNum / (heightNum * heightNum)).toFixed(1)
      : '';

    try {
      await onSave({ weight, height, date, bmi }); // Salve o IMC junto!

      // Atualiza o campo lastCheck do paciente
      const db = getDatabase();
      const patientRef = ref(db, `patients/${userId}/${patientId}`);
      const now = new Date();
      const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await update(patientRef, { lastCheck });

      setWeight('');
      setHeight('');
      setDate('');
      setError('');
      onClose();
    } catch {
      setError('Erro ao salvar dados');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setWeight('');
    setHeight('');
    setDate('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar Peso e Altura</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs:6 }}>
            <TextField
              label="Peso (kg)"
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.WEIGHT }}
            />
          </Grid>
          <Grid size={{ xs:6 }}>
            <TextField
              label="Altura (cm)"
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: INPUT_LIMITS.HEIGHT }}
            />
          </Grid>
          <Grid size={{ xs:6 }}>
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWeightModal;
