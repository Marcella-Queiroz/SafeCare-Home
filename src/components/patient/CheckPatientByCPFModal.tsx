import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Typography, Box
} from '@mui/material';

import { validateCPF } from '@/utils/validations';
import { findPatientByCPFSecure } from '@/utils/securityUtils';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onFound: (patient: any) => void;
  onNotFound: (cpf: string) => void;
}

const CheckPatientByCPFModal = ({ open, onClose, onFound, onNotFound }: Props) => {
  const { user } = useAuth();
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState<any | null>(null);

  const handleCheck = async () => {
    setError('');
    setLoading(true);

    if (!user?.uid) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      // Busca paciente por CPF de forma segura
      const patient = await findPatientByCPFSecure(user.uid, cpf);
      
      setLoading(false);

      if (patient) {
        setFoundPatient(patient);
      } else {
        setFoundPatient(null);
        onNotFound(cpf);
      }
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      setError('Erro ao buscar paciente');
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    if (foundPatient) {
      onFound(foundPatient);
      setFoundPatient(null);
      setCpf('');
    }
  };

  const handleCreateNew = () => {
    onNotFound(cpf);
    setFoundPatient(null);
    setCpf('');
  };

  const handleClose = () => {
    setFoundPatient(null);
    setCpf('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Informe o CPF do paciente</DialogTitle>
      <DialogContent>
        {!foundPatient && (
          <>
            <TextField
              label="CPF"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 14 }}
              disabled={loading}
              sx={{ mt: 1 }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </>
        )}
        {foundPatient && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Paciente encontrado!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Nome completo:</strong> {foundPatient.name}
            </Typography>
            <DialogActions sx={{ px: 0 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddPatient}
              >
                Adicionar paciente
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCreateNew}
              >
                Criar novo paciente
              </Button>
            </DialogActions>
          </Box>
        )}
      </DialogContent>
      {!foundPatient && (
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleCheck} variant="contained" disabled={loading}>Continuar</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CheckPatientByCPFModal;