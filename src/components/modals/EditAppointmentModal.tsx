//Modal para edição de agendamento

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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface EditAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    title: string;
    date: string;
    time: string;
  } | null;
  onSave: (appointment: any) => void;
}

const EditAppointmentModal = ({ open, onClose, appointment, onSave }: EditAppointmentModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title);
      setDate(appointment.date);
      setTime(appointment.time);
    }
  }, [appointment]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !time) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      setTimeout(() => {
        onSave({ title, date, time });
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Erro ao editar agendamento');
      console.error(err);
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setTitle('');
    setDate('');
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
          Editar Agendamento
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
            Agendamento atualizado com sucesso!
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
                id="title"
                label="Título do agendamento"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="date"
                label="Data"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="time"
                label="Horário"
                name="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
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

export default EditAppointmentModal;
