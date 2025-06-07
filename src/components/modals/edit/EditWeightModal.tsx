//Editar modal de peso

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Chip
} from '@mui/material';

interface EditWeightModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  onSave: (data: any) => void | Promise<void>;
  userId: string;
  patientId: string;
  patientCreatedAt: string;
}

const EditWeightModal = ({ open, onClose, record, onSave, userId, patientId, patientCreatedAt }: EditWeightModalProps) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState('');
  const [bmi, setBmi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (record) {
      setWeight(record.weight || '');
      setHeight(record.height || '');
      setDate(record.date || '');
      setBmi(record.bmi || record.imc || '');
    }
  }, [record, open]);


  useEffect(() => {
    if (weight && height) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height) / 100;
      if (weightNum > 0 && heightNum > 0) {
        setBmi((weightNum / (heightNum * heightNum)).toFixed(1));
      }
    }
  }, [weight, height]);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height || !date) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (date < patientCreatedAt) {
      setError(`A data não pode ser anterior a ${patientCreatedAt}`);
      return;
    }
    if (date > today) {
      setError('A data não pode ser maior que hoje');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onSave({ ...record, weight, height, date, bmi });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setWeight('');
        setHeight('');
        setDate('');
        setBmi('');
        setError('');
        setSuccess(false);
        setLoading(false);
      }, 1500);
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
                inputProps={{
                  min: patientCreatedAt || '1900-01-01',
                  max: today,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Chip label={`IMC: ${bmi}`} />
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>Salvar</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWeightModal;