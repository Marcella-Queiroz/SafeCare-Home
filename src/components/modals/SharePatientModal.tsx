// Modal para compartilhar paciente com outros usuários

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { grantPatientAccess, getUserNameById } from '@/utils/securityUtils';
import { isValidEmail } from '@/utils/validations';

interface SharePatientModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  patientCPF?: string;
  sharedWithUsers?: string[];
  onSuccess?: () => void;
}

const SharePatientModal = ({ 
  open, 
  onClose, 
  patientId, 
  patientName,
  patientCPF,
  sharedWithUsers = [],
  onSuccess 
}: SharePatientModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sharedUserNames, setSharedUserNames] = useState<{[key: string]: string}>({});

  // Carregar nomes dos usuários já compartilhados
  React.useEffect(() => {
    const loadUserNames = async () => {
      const names: {[key: string]: string} = {};
      for (const userId of sharedWithUsers) {
        try {
          const userName = await getUserNameById(userId);
          names[userId] = userName || 'Usuário não encontrado';
        } catch (error) {
          names[userId] = 'Erro ao carregar nome';
        }
      }
      setSharedUserNames(names);
    };

    if (sharedWithUsers.length > 0) {
      loadUserNames();
    }
  }, [sharedWithUsers]);

  const handleShare = async () => {
    setError('');
    setSuccess('');

    // Validar email
    if (!isValidEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);

      // Por enquanto, mostrar mensagem que a função não está implementada
      setError('Funcionalidade de compartilhamento por email ainda não está implementada. Use o sistema de busca por CPF para adicionar pacientes ao dashboard.');
      
    } catch (error) {
      console.error('Erro ao compartilhar paciente:', error);
      setError('Erro ao compartilhar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess('');
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
        <Box display="flex" alignItems="center" gap={1}>
          <ShareIcon color="primary" />
          <Typography variant="h6" component="div">
            Informações de Acesso
          </Typography>
        </Box>
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Para que outros usuários vejam o paciente <strong>{patientName}</strong>, eles devem usar a funcionalidade "Buscar por CPF" no dashboard.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Como compartilhar:</strong><br/>
            1. Informe o CPF do paciente para outro usuário<br/>
            2. O outro usuário deve usar "Adicionar Paciente" → "Buscar por CPF"<br/>
            3. O paciente aparecerá automaticamente no dashboard dele
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            CPF do paciente:
          </Typography>
          <TextField
            fullWidth
            value={patientCPF || 'CPF não disponível'}
            disabled
            size="small"
            helperText="Informe este CPF para outros usuários acessarem o paciente"
          />
        </Box>

        {sharedWithUsers.length > 0 && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Já compartilhado com:
            </Typography>
            <List dense>
              {sharedWithUsers.map((userId) => (
                <ListItem key={userId}>
                  <ListItemText 
                    primary={sharedUserNames[userId] || 'Carregando...'}
                    secondary={userId}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label="Compartilhado" 
                      size="small" 
                      color="success" 
                      variant="outlined" 
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SharePatientModal;
