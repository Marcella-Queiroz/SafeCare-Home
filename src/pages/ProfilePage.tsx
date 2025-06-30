
// Página de perfil do usuário com funcionalidades de visualização e edição de dados pessoais

import { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from "firebase/database";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from "firebase/auth";
import { auth } from '@/services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  Divider,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../components/PageContainer';
import { INPUT_LIMITS } from '@/constants/inputLimits';

function getRoleLabel(role: string) {
  switch (role) {
    case "doctor":
      return "Médico";
    case "nurse":
      return "Enfermeiro";
    case "caregiver":
      return "Cuidador";
    case "other":
      return "Outro";
    default:
      return role;
  }
}

const ProfilePage = () => {
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  useEffect(() => {
    if (user?.uid) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setRole(data.role || '');
        }
      });
    }
  }, [user?.uid, reload]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    setError('');
    setSuccess(false);
    if (editing) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setRole(data.role || '');
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email !== email) {
        try {
          await updateEmail(currentUser, email);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            const currentPassword = window.prompt('Por segurança, digite sua senha atual:');
            if (!currentPassword) {
              setError('Senha atual não informada.');
              setLoading(false);
              return;
            }
            const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
            try {
              await reauthenticateWithCredential(currentUser, credential);
              await updateEmail(currentUser, email);
            } catch (reauthErr: any) {
              setError('Falha na reautenticação: ' + (reauthErr.message || ''));
              setLoading(false);
              return;
            }
          } else if (
            err.code === 'auth/operation-not-allowed' ||
            (err.message && err.message.includes('Please verify the new email'))
          ) {
            setError('Para alterar o email, verifique o novo endereço de email. Acesse sua caixa de entrada e clique no link de verificação enviado pelo sistema.');
            setLoading(false);
            return;
          } else {
            setError('Erro ao atualizar email: ' + (err.message || ''));
            setLoading(false);
            return;
          }
        }
      }
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { name, email, phone, role });
      
      updateUserData({ name, email, role });
      
      setSuccess(true);
      setEditing(false);
      setReload(r => !r);
    } catch (err) {
      setError('Erro ao salvar alterações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Usuário não autenticado.');
        setPasswordLoading(false);
        return;
      }
      try {
        await updatePassword(currentUser, newPassword);
        setSuccess(true);
        setNewPassword('');
        setShowPasswordField(false); 
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login') {
          const currentPassword = window.prompt('Por segurança, digite sua senha atual:');
          if (!currentPassword) {
            setError('Senha atual não informada.');
            setPasswordLoading(false);
            return;
          }
          const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
          try {
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            setSuccess(true);
            setNewPassword('');
            setShowPasswordField(false);
          } catch (reauthErr: any) {
            setError('Falha na reautenticação: ' + (reauthErr.message || ''));
          }
        } else {
          setError('Erro ao alterar senha: ' + (err.message || ''));
        }
      } finally {
        setPasswordLoading(false);
      }
    } catch (err) {
      setError('Erro ao alterar senha: ' + (err.message || ''));
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Perfil
          </Typography>
        </Box>
        <Button
          variant={editing ? 'outlined' : 'contained'}
          color={editing ? 'inherit' : 'primary'}
          startIcon={editing ? null : <EditIcon />}
          onClick={handleEditToggle}
          disabled={loading}
        >
          {editing ? 'Cancelar' : 'Editar'}
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'primary.main',
                mr: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {getRoleLabel(role)}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Nome
              </Typography>
              {editing ? (
                <TextField
                  label="Nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: INPUT_LIMITS.NAME }}
                  size="small"
                  disabled={loading}
                />
              ) : (
                <Typography variant="body1">{name}</Typography>
              )}
            </Grid>
            
            <Grid>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Email
              </Typography>
              {editing ? (
                <TextField
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: INPUT_LIMITS.EMAIL }}
                  size="small"
                  disabled={loading}
                />
              ) : (
                <Typography variant="body1">{email}</Typography>
              )}
            </Grid>
            
            <Grid>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Telefone
              </Typography>
              {editing ? (
                <TextField
                  label="Telefone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: INPUT_LIMITS.PHONE }}
                  size="small"
                  disabled={loading}
                />
              ) : (
                <Typography variant="body1">{phone}</Typography>
              )}
            </Grid>
            
            <Grid>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Função
              </Typography>
              {editing ? (
                <Select
                  fullWidth
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  size="small"
                  disabled={loading}
                >
                  <MenuItem value="doctor">Médico</MenuItem>
                  <MenuItem value="nurse">Enfermeiro</MenuItem>
                  <MenuItem value="caregiver">Cuidador</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                </Select>
              ) : (
                <Typography variant="body1">{getRoleLabel(role)}</Typography>
              )}
            </Grid>
          </Grid>
          
          {editing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                Salvar Alterações
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configurações da Conta
          </Typography>
          <Box sx={{ mt: 2 }}>
            {showPasswordField ? (
              <>
                <TextField
                  fullWidth
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                />
                <Button 
                  variant="outlined" 
                  color="primary"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !newPassword}
                >
                  {passwordLoading ? "Alterando..." : "Alterar Senha"}
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => {
                    setShowPasswordField(false);
                    setNewPassword('');
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button 
                variant="outlined" 
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => setShowPasswordField(true)}
              >
                Alterar Senha
              </Button>
            )}
            <Button 
              variant="outlined" 
              color="error"
              fullWidth
              onClick={handleLogout}
            >
              Sair
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar 
        open={success} 
        autoHideDuration={5000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Perfil atualizado com sucesso!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ProfilePage;