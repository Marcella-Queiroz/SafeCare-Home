//Modal para registrar peso e altura de um paciente

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, IconButton, CircularProgress, Box, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';

interface AddWeightModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  onSave: (data: any) => void | Promise<void>;
}

const AddWeightModal = ({ open, onClose, userId, patientId, onSave }: AddWeightModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const calculateBMI = () => {
    if (weight && height) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height) / 100;
      if (weightNum > 0 && heightNum > 0) {
        const bmiValue = (weightNum / (heightNum * heightNum)).toFixed(1);
        setBmi(bmiValue);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!weight || !height) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        date,
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: bmi ? parseFloat(bmi) : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        handleClose();
      }, 1200);
    } catch {
      setError('Erro ao salvar registro');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWeight('');
    setHeight('');
    setBmi('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Adicionar Peso
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {success && <Alert severity="success" sx={{ mb: 2 }}>Registro adicionado com sucesso!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Peso (kg)"
                type="number"
                value={weight}
                onChange={e => {
                  setWeight(e.target.value);
                  setTimeout(calculateBMI, 0);
                }}
                disabled={loading}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Altura (cm)"
                type="number"
                value={height}
                onChange={e => {
                  setHeight(e.target.value);
                  setTimeout(calculateBMI, 0);
                }}
                disabled={loading}
                inputProps={{ step: "1" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IMC (kg/m²)"
                value={bmi}
                disabled
                helperText="Calculado automaticamente"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWeightModal;
