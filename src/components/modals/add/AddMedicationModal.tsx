//modal para cadastro e edição de medicações

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
import { getDatabase, ref, get, update } from "firebase/database";
import { INPUT_LIMITS } from '@/constants/inputLimits';
import { validateMedication } from '@/utils/validations';

interface AddMedicationModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  patientId: string;
  userName: string;
  medication?: any;
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

const AddMedicationModal = ({ open, onClose, userId, patientId, userName, medication }: AddMedicationModalProps) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (medication) {
      setName(medication.name || '');
      setDosage(medication.dosage || '');
      setFrequency(medication.frequency || '');
      setTime(medication.time || '');
    } else {
      setName('');
      setDosage('');
      setFrequency('');
      setTime('');
    }
    setError('');
    setSuccess(false);
  }, [medication, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMedication(name, dosage, frequency);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const db = getDatabase();
      const patientRef = ref(db, `patientsGlobal/${patientId}`);
      const snapshot = await get(patientRef);
      const patientData = snapshot.val() || {};
      const medications = patientData.medications || [];
      const newMedication = {
        id: crypto.randomUUID(), // <-- ID único
        name,
        dosage,
        frequency,
        time,
        authorId: userId,
      };
      medications.push(newMedication);
      await update(patientRef, { medications });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
      setLoading(false);
    } catch (err) {
      setError('Erro ao salvar medicamento');
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
          {medication ? 'Editar Medicamento' : 'Adicionar Medicamento'}
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
            {medication ? 'Medicamento editado com sucesso!' : 'Medicamento adicionado com sucesso!'}
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
                label="Nome do medicamento"
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
                label="Dosagem"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: INPUT_LIMITS.DOSAGE }}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                select
                label="Frequência"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: INPUT_LIMITS.FREQUENCY }}
                disabled={loading}
              >
                {frequencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs:12, md:6 }}>
              <TextField
                label="Horário"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
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
          {loading ? <CircularProgress size={24} /> : medication ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMedicationModal;
