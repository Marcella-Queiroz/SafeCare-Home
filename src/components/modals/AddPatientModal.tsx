//Modal novo paciente
//Permite o cadastro de um novo paciente, e armazenamento dos dados no Firebase

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
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';

// Importações do Firebase
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "@/services/firebaseConfig";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | undefined;
}

const AddPatientModal = ({ open, onClose, userId }: AddPatientModalProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const db = getDatabase(app);
      if (!userId) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      console.log('userId para salvar paciente:', userId); // <-- Adicione isso
      const patientsRef = ref(db, `patients/${userId}`);
      const newPatientRef = push(patientsRef);
      await set(newPatientRef, {
        name,
        age: Number(age),
        conditions: conditions
          ? conditions.split(",").map((c) => c.trim())
          : [],
        createdAt: new Date().toISOString(),
        weight: [],
        glucose: [],
        temperature: [],
        bloodPressure: [],
        heartRate: [],
        oxygen: [],
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
      setLoading(false);
    } catch (err) {
      setError('Erro ao adicionar paciente');
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setAge('');
    setConditions('');
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
          Adicionar Novo Paciente
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
            Paciente adicionado com sucesso!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                required
                fullWidth
                id="name"
                label="Nome do paciente"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid>
              <TextField
                required
                fullWidth
                id="age"
                label="Idade"
                name="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                id="conditions"
                label="Condição"
                name="conditions"
                placeholder="Ex: Hipertensão, Diabetes"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                disabled={loading}
                helperText="Separe as condições por vírgula"
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
          {loading ? <CircularProgress size={24} /> : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPatientModal;