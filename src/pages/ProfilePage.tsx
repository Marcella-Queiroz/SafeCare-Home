// Pagina de Perfil do Usuário

import { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
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

  // Busca os dados do usuário do Firebase sempre que abrir a página ou após edição
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
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { name, email, phone, role });
      setSuccess(true);
      setEditing(false);
      setReload(r => !r); // Força recarregar os dados do Firebase
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
      const auth = getAuth();
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
            setShowPasswordField(false); // <-- Esconde o campo após sucesso
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

  const handleLogout = () => {
    logout();
    navigate('/');
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
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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