import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../components/PageContainer';
import AddPatientModal from '../components/modals/AddPatientModal';

// Importações do Firebase
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "@/services/firebaseConfig";

// Função auxiliar para gerar as iniciais do nome
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toLowerCase();
}

// Função para automatizar o status baseado na pressão arterial
function getStatusByBloodPressure(bloodPressure: string) {
  if (!bloodPressure) return "Atenção";
  const [systolic, diastolic] = bloodPressure.split('/').map(Number);
  if (!systolic || !diastolic) return "Atenção";
  if (systolic >= 90 && systolic <= 130 && diastolic >= 60 && diastolic <= 85) {
    return "Estável";
  }
  return "Atenção";
}

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);

  // Estado para pacientes e carregamento
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar pacientes do Firebase
  useEffect(() => {
    const db = getDatabase(app);
    const patientsRef = ref(db, "patients");
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setPatients(array);
      } else {
        setPatients([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtrar pacientes pelo termo de busca (nome, condição, iniciais ou primeira letra)
  const filteredPatients = patients.filter(patient => {
    const name = (patient.name || '').toLowerCase();
    const initials = getInitials(patient.name || '');
    const search = searchTerm.trim().toLowerCase();
    const searchInitials = search
      .split(' ')
      .map((n) => n[0])
      .join('');

    // Verifica se o nome começa com a letra digitada
    const nameStartsWith = name.startsWith(search);

    return (
      name.includes(search) ||
      nameStartsWith ||
      initials.includes(search.replace(/\s/g, '')) ||
      initials.includes(searchInitials)
    );
  });

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNewReportClick = () => {
    navigate('/reports/new');
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Gerenciamento de Pacientes
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar pacientes..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { backgroundColor: tabValue === 0 ? '#1976d2' : '#4caf50' }
          }}
        >
          <Tab 
            label="Pacientes" 
            sx={{ 
              fontWeight: 600,
              color: tabValue === 0 ? '#1976d2' : 'inherit',
            }}
          />
          <Tab 
            label="Relatórios" 
            sx={{ 
              fontWeight: 600,
              color: tabValue === 1 ? '#1976d2' : 'inherit',
            }}
          />
        </Tabs>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddPatientModalOpen(true)}
          size="small"
          sx={{
            minWidth: 100,
            fontWeight: 400,
            fontSize: { xs: '0.6rem', sm: '0.95rem' },
            py: 0.5,
            px: 1
          }}
        >
          Novo Paciente
        </Button>
      </Box>
      
      {tabValue === 0 ? (
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                Carregando pacientes...
              </Typography>
            </Box>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => handlePatientClick(patient.id)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {patient.name}
                        </Typography>
                        <Chip 
                          label={getStatusByBloodPressure(patient.bloodPressure)}
                          color={getStatusByBloodPressure(patient.bloodPressure) === 'Estável' ? 'success' : 'warning'}
                          size="small"
                          sx={{ ml: 1, height: 22 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {patient.age} anos - {(patient.conditions || []).join(', ')}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FavoriteIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" sx={{ mr: 0.5 }}>
                        {patient.bloodPressure}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        {patient.heartRate} bpm
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Última verificação: {patient.lastCheck}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                Nenhum paciente encontrado
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Relatórios Salvos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Crie um novo relatório para visualizar aqui.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleNewReportClick}
          >
            Criar Relatório
          </Button>
        </Box>
      )}
      
      <AddPatientModal 
        open={addPatientModalOpen} 
        onClose={() => setAddPatientModalOpen(false)} 
      />
    </PageContainer>
  );
};

export default PatientsPage;