//modal de agendamento de consultas
//permite que o usuário cadastre um compromisso

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import { getDatabase, ref, push } from "firebase/database";
import { validateAppointment } from '@/utils/validations';

interface AddAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  userName: string;
}

const AddAppointmentModal = ({
  open,
  onClose,
  userId,
  patientId,
  userName,
}: AddAppointmentModalProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Validação usando função padronizada
    const validation = validateAppointment(title, date, time);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      const db = getDatabase();
      const appointmentsRef = ref(
        db,
        `patientsGlobal/${patientId}/appointments`
      );
      await push(appointmentsRef, {
        title,
        date,
        time,
        createdBy: userName, // <-- Salva o nome do usuário
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
      setTitle("");
      setDate("");
      setTime("");
    } catch (err: any) {
      setError("Erro ao salvar agendamento.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setTitle("");
    setDate("");
    setTime("");
    setError("");
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
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid size={{ xs:12, md:6 }}>
            <h2>Novo Agendamento</h2>
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <IconButton
              aria-label="Fechar"
              onClick={handleClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={loading}
          />
          <TextField
            label="Hora"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
            disabled={loading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Agendamento salvo!
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointmentModal;
