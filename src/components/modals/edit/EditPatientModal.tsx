//Modal para edição dos dados de pacientes

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
import { getDatabase, ref, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';
import { calcularIdade } from '@/utils/dateUtils';
import { validatePatientData } from '@/utils/validations';
import { useAuth } from "@/contexts/AuthContext";
import { updatePatientEverywhere } from "@/utils/patientSync";
import type { Patient } from '@/components/patient/PatientDetailContent';

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  userId: string | undefined;
  onSave: (updatedPatient: any) => void;
}

const EditPatientModal = ({ open, onClose, patient, userId, onSave }: EditPatientModalProps) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [conditions, setConditions] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (patient) {
      setCpf(patient.cpf || '');
      setName(patient.name);
      setConditions(patient.conditions.join(', '));
      setBirthDate(patient.birthDate || '');
      setGender(patient.gender || '');
      setPhone(patient.phone || '');
      setAddress(patient.address || '');
      setAge(patient.birthDate ? calcularIdade(patient.birthDate).toString() : '');
    }
  }, [patient]);
  
  useEffect(() => {
    setAge(birthDate ? calcularIdade(birthDate).toString() : '');
  }, [birthDate]);

  // Limpa todos os campos quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setName('');
      setCpf('');
      setConditions('');
      setBirthDate('');
      setGender('');
      setPhone('');
      setAddress('');
      setAge('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validação usando função padronizada
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

      // Atualize em todos os usuários
      await updatePatientEverywhere(patient.id, {
        name,
        cpf,
        age: parseInt(age),
        conditions: conditions.split(',').map(c => c.trim()).filter(c => c),
        birthDate,
        gender,
        phone,
        address,
        editedBy: user?.name || user?.email || user?.uid,
        editedAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 1200);
    } catch (err) {
      setError('Erro ao atualizar paciente');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setCpf('');
    setConditions('');
    setBirthDate('');
    setGender('');
    setPhone('');
    setAddress('');
    setAge('');
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
          Editar Dados do Paciente
        </Typography>
        {patient.editedBy && patient.editedAt && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            <strong>Editado por:</strong> {patient.editedBy} em{" "}
            {new Date(patient.editedAt).toLocaleDateString("pt-BR")} às{" "}
            {new Date(patient.editedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        )}
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
        {success && <Alert severity="success" sx={{ mb: 2 }}>Dados atualizados com sucesso!</Alert>}
        {!success && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                required
                fullWidth
                id="name"
                label="Nome do paciente"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                inputProps={{ maxLength: INPUT_LIMITS.NAME }}
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
                label="Idade"
                value={age}
                fullWidth
                InputProps={{ readOnly: true }}
                disabled
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                fullWidth
                id="conditions"
                label="Condições"
                name="conditions"
                placeholder="Ex: Hipertensão, Diabetes"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                disabled={loading}
                helperText="Separe as condições por vírgula"
                inputProps={{ maxLength: INPUT_LIMITS.CONDITIONS }}
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="Sexo"
                value={gender}
                onChange={e => setGender(e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
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

export default EditPatientModal;
