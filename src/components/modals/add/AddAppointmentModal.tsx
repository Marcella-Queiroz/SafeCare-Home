//modal de agendamento de consultas
//permite que o usuário cadastre um compromisso

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
import { getDatabase, ref, get, update } from "firebase/database";

interface AddAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
}

const AddAppointmentModal = ({ open, onClose, userId, patientId }: AddAppointmentModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      setError('Preencha todos os campos');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const db = getDatabase();
      const patientRef = ref(db, `patients/${userId}/${patientId}`);
      const snapshot = await get(patientRef);
      const patientData = snapshot.val() || {};
      const appointments = patientData.appointments || [];
      appointments.push({ title, date, time });
      await update(patientRef, { appointments });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
      setLoading(false);
    } catch (err) {
      setError('Erro ao agendar');
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
          Adicionar Agendamento
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
            Agendamento realizado com sucesso!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                required
                fullWidth
                id="title"
                label="Título"
                name="title"
                placeholder="Ex: Consulta médica, Visita domiciliar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
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
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                required
                fullWidth
                id="time"
                label="Horário"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
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
          {loading ? <CircularProgress size={24} /> : 'Agendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointmentModal;
