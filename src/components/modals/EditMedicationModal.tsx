import { useState, useEffect } from 'react';
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
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EditMedicationModalProps {
  open: boolean;
  onClose: () => void;
  medication: {
    name: string;
    dosage: string;
    frequency: string;
    time?: string;
  } | null;
  onSave: (medication: any) => void;
}

const frequencies = [
  { value: '1x ao dia', label: '1x ao dia' },
  { value: '2x ao dia', label: '2x ao dia' },
  { value: '3x ao dia', label: '3x ao dia' },
  { value: '4x ao dia', label: '4x ao dia' },
  { value: 'A cada 12h', label: 'A cada 12h' },
  { value: 'A cada 8h', label: 'A cada 8h' },
  { value: 'A cada 6h', label: 'A cada 6h' },
  { value: 'Conforme necessário', label: 'Conforme necessário' },
];

const EditMedicationModal = ({ open, onClose, medication, onSave }: EditMedicationModalProps) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setFrequency(medication.frequency);
      setTime(medication.time || '');
    }
  }, [medication]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dosage || !frequency) {
      setError('Preencha os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Mock success
      setTimeout(() => {
        onSave({ name, dosage, frequency, time });
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Erro ao editar medicamento');
      console.error(err);
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setTime('');
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
          Editar Medicamento
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
            Medicamento atualizado com sucesso!
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
                required
                fullWidth
                id="name"
                label="Nome do medicamento"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="dosage"
                label="Dosagem (ex: 500mg)"
                name="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                id="frequency"
                label="Frequência"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={loading}
              >
                {frequencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="time"
                label="Horário (opcional)"
                name="time"
                placeholder="Ex: 08:00, 20:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
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

export default EditMedicationModal;
