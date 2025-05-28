import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AddWeightModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string | undefined;
}

const AddWeightModal = ({ open, onClose, patientId }: AddWeightModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Calculate BMI when weight and height change
  const calculateBMI = () => {
    if (weight && height) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height) / 100; // convert cm to m
      if (weightNum > 0 && heightNum > 0) {
        const bmiValue = (weightNum / (heightNum * heightNum)).toFixed(1);
        setBmi(bmiValue);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!weight || !height) {
      setError('Preencha peso e altura');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Calculate BMI before saving
      calculateBMI();
      
      // Mock success
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Erro ao salvar dados');
      console.error(err);
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component="div">
          Adicionar novo registro
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registro adicionado com sucesso!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="weight"
                label="Peso (kg)"
                name="weight"
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  // Recalculate BMI when weight changes
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
                id="height"
                label="Altura (cm)"
                name="height"
                type="number"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  // Recalculate BMI when height changes
                  setTimeout(calculateBMI, 0);
                }}
                disabled={loading}
                inputProps={{ step: "1" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="bmi"
                label="IMC (kg/m²)"
                name="bmi"
                value={bmi}
                disabled={true}
                helperText="Calculado automaticamente"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWeightModal;
