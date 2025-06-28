//Modal para cadastro de novos pacientes

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
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { INPUT_LIMITS } from '@/constants/inputLimits';
import { calcularIdade } from '@/utils/dateUtils';
import { validatePatientData } from '@/utils/validations';
import { Patient, Metric, BloodPressure } from '../../../types/patient';

export interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (dadosPaciente: Omit<Patient, "id">) => Promise<void>;
  userId: string;
  initialCPF?: string;
}

const AddPatientModal = ({ open, onClose, userId, onAdd, initialCPF }: AddPatientModalProps) => {
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
  const [cpf, setCpf] = useState(initialCPF || '');
  const { user } = useAuth();

  useEffect(() => {
    if (birthDate) {
      const calculatedAge = calcularIdade(birthDate);
      setAge(calculatedAge ? calculatedAge.toString() : '');
    } else {
      setAge('');
    }
  }, [birthDate]);

  useEffect(() => {
    if (initialCPF) setCpf(initialCPF);
  }, [initialCPF]);

  useEffect(() => {
    if (!open) {
      setName('');
      setAge('');
      setConditions('');
      setCpf(initialCPF || '');
      setBirthDate('');
      setGender('');
      setPhone('');
      setAddress('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [open, initialCPF]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const validation = validatePatientData({
      name,
      cpf,
      birthDate,
      gender,
      phone,
      address
    });

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const db = getDatabase();
      const patientsGlobalRef = ref(db, `patientsGlobal`);
      const newPatientRef = push(patientsGlobalRef);
      const patientId = newPatientRef.key;

      await set(newPatientRef, {
        id: patientId,
        name,
        cpf,
        age: Number(age),
        birthDate,
        gender,
        phone,
        address,
        conditions: conditions
          ? conditions.split(",").map((c) => c.trim())
          : [],
        createdAt: new Date().toISOString(),
        createdBy: user?.name || user?.email || user?.uid,
        weight: [],
        glucose: [],
        temperature: [],
        bloodPressure: [],
        oxygen: [],
        heartRate: [],
        medications: [],
        appointments: [],
      });
      const userPatientsRef = ref(db, `userPatients/${userId}/${patientId}`);
      await set(userPatientsRef, true);

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
    setCpf('');
    setBirthDate('');
    setGender('');
    setPhone('');
    setAddress('');
    setError('');
    setSuccess(false);
    setLoading(false);
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
            <Grid size={{ xs:12, md:6 }}>
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
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="CPF"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: 14 }}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="Idade"
                value={age}
                fullWidth
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
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
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                select
                label="Sexo"
                value={gender}
                onChange={e => setGender(e.target.value)}
                fullWidth
                disabled={loading}
                required
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="Contato"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="Endereço"
                value={address}
                onChange={e => setAddress(e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
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