//Modal novo paciente
//Permite o cadastro de um novo paciente, e armazenamento dos dados no Firebase

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
  CircularProgress,
  Box,
  Alert,
  MenuItem 
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';

// Importações do Firebase
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { INPUT_LIMITS } from '@/constants/inputLimits';
import type { Metric, BloodPressure } from '../../../pages/PatientsPage';
import { calcularIdade } from '@/utils/dateUtils';

export interface Patient {
  id: string;
  name: string;
  age: number;
  birthDate?: string;
  gender?: string;
  phone?: string;
  address?: string;
  conditions: string[];
  lastCheck?: string;
  weight: Metric[];
  glucose: Metric[];
  bloodPressure: BloodPressure[];
  temperature: Metric[];
  oxygen: Metric[];
  heartRate: Metric[];
  medications?: any[];
  appointments?: any[];
}

export interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (dadosPaciente: Omit<Patient, "id">) => Promise<void>;
  userId: string;
}

const AddPatientModal = ({ open, onClose, userId }: AddPatientModalProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Sempre que a data de nascimento mudar, atualize a idade
  useEffect(() => {
    setAge(birthDate ? calcularIdade(birthDate).toString() : '');
  }, [birthDate]);

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
        birthDate,
        gender,
        phone,
        address,
        conditions: conditions
          ? conditions.split(",").map((c) => c.trim())
          : [],
        createdAt: new Date().toISOString(),
        weight: [],
        glucose: [],
        temperature: [],
        bloodPressure: [],
        oxygen: [],
        heartRate: [],
        medications: [],
        appointments: [],
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
            <Grid item xs={12}>
              <TextField
                label="Nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: INPUT_LIMITS.NAME }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Idade"
                value={age}
                fullWidth
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Data de Nascimento"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Sexo"
                value={gender}
                onChange={e => setGender(e.target.value)}
                fullWidth
                disabled={loading}
                required
                sx={{}
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contato"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endereço"
                value={address}
                onChange={e => setAddress(e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Condições"
                value={conditions}
                onChange={e => setConditions(e.target.value)}
                fullWidth
                inputProps={{ maxLength: INPUT_LIMITS.CONDITIONS }}
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