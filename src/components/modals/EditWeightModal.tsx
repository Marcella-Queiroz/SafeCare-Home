//Editar modal de peso

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { getDatabase, ref, update } from 'firebase/database';

interface EditWeightModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  onSave: () => void;
  userId: string;
  patientId: string;
}

const EditWeightModal = ({ open, onClose, record, onSave, userId, patientId }: EditWeightModalProps) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState('');
  const [bmi, setBmi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sempre que o registro mudar, atualize os campos
  useEffect(() => {
    if (record) {
      setWeight(record.weight || '');
      setHeight(record.height || '');
      setDate(record.date || '');
      setBmi(record.imc || '');
    }
  }, [record, open]);

  // Recalcula o IMC ao alterar peso ou altura
  useEffect(() => {
    if (weight && height) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height) / 100;
      if (weightNum > 0 && heightNum > 0) {
        setBmi((weightNum / (heightNum * heightNum)).toFixed(1));
      }
    }
  }, [weight, height]);

  const handleClose = () => {
    onClose();
    setWeight('');
    setHeight('');
    setDate('');
    setBmi('');
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height || !record?.id) {
      setError('Preencha peso, altura e selecione um registro válido');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const db = getDatabase();
      const weightRef = ref(db, `patients/${userId}/${patientId}/weight/${record.id}`);
      await update(weightRef, {
        date,
        weight,
        height,
        imc: bmi,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
      setLoading(false);
    } catch (err) {
      setError('Erro ao atualizar dados');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Peso</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Peso (kg)"
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                fullWidth
                error={!!error}
                helperText={error}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Altura (cm)"
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                fullWidth
                error={!!error}
                helperText={error}
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
                error={!!error}
                helperText={error}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="IMC"
                value={bmi}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWeightModal;