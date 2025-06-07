//Pagina de pacientes

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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PageContainer from '../components/PageContainer';
import AddPatientModal from '../components/modals/add/AddPatientModal';
import { INPUT_LIMITS } from '@/constants/inputLimits';

// Importações do Firebase
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { useAuth } from '../contexts/AuthContext';

// Função auxiliar para gerar as iniciais do nome
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toLowerCase();
}

// Função para automatizar o status baseado na pressão arterial
function getStatusByBloodPressure(bloodPressure: any) {
  // Se for array, pega o último registro
  if (Array.isArray(bloodPressure) && bloodPressure.length > 0) {
    const last = bloodPressure[bloodPressure.length - 1];
    // last pode ser { systolic, diastolic } ou { value: "120/80" }
    let systolic, diastolic;
    if (typeof last === 'object') {
      if ('systolic' in last && 'diastolic' in last) {
        systolic = Number(last.systolic);
        diastolic = Number(last.diastolic);
      } else if ('value' in last && typeof last.value === 'string') {
        [systolic, diastolic] = last.value.split('/').map(Number);
      }
    }
    if (!systolic || !diastolic) return "Atenção";
    if (systolic >= 90 && systolic <= 130 && diastolic >= 60 && diastolic <= 85) {
      return "Estável";
    }
    return "Atenção";
  }
  // Se for string, tenta dividir normalmente
  if (typeof bloodPressure === 'string') {
    const [systolic, diastolic] = bloodPressure.split('/').map(Number);
    if (!systolic || !diastolic) return "Atenção";
    if (systolic >= 90 && systolic <= 130 && diastolic >= 60 && diastolic <= 85) {
      return "Estável";
    }
    return "Atenção";
  }
  return "Atenção";
}

function getLastBloodPressureString(bloodPressure: any) {
  if (Array.isArray(bloodPressure) && bloodPressure.length > 0) {
    const last = bloodPressure[bloodPressure.length - 1];
    if (typeof last === 'object') {
      if ('systolic' in last && 'diastolic' in last) {
        return `${last.systolic}/${last.diastolic}`;
      }
      if ('value' in last && typeof last.value === 'string') {
        return last.value;
      }
    }
  }
  if (typeof bloodPressure === 'string') {
    return bloodPressure;
  }
  return '-';
}

// Função genérica para pegar o último valor de um array de métricas
function getLastMetricValue(metric: any, field: string = 'value', suffix: string = '') {
  if (Array.isArray(metric) && metric.length > 0) {
    const last = metric[metric.length - 1];
    if (last && typeof last === 'object' && field in last) {
      return `${last[field]}${suffix}`;
    }
  }
  if (typeof metric === 'string' || typeof metric === 'number') {
    return `${metric}${suffix}`;
  }
  return '-';
}

function convertMetricsToArray(metricsObj: any) {
  if (!metricsObj) return [];
  if (Array.isArray(metricsObj)) return metricsObj.filter(Boolean);
  if (typeof metricsObj === 'object') {
    return Object.entries(metricsObj).map(([id, data]) =>
      typeof data === 'object' && data !== null ? { id, ...data } : { id, value: data }
    );
  }
  return [];
}

function convertPatientMetrics(patient: any) {
  if (!patient) return patient;
  const metricKeys = [
    'weight',
    'glucose',
    'bloodPressure',
    'temperature',
    'oxygen',
    'heartRate'
  ];
  const converted = { ...patient };
  metricKeys.forEach((key) => {
    converted[key] = convertMetricsToArray(patient[key]);
  });
  return converted;
}

const PatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);

  // Estado para pacientes e carregamento
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  // Buscar pacientes do usuário logado
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const patientsRef = ref(db, `patients/${user.uid}`);
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.entries(data).map(([id, value]: any) => {
          const patient = { id, ...value };
          return convertPatientMetrics(patient);
        });
        setPatients(array);
      } else {
        setPatients([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Buscar relatórios do usuário logado
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const reportsRef = ref(db, `reports/${user.uid}`);
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setReports(arr.reverse());
      } else {
        setReports([]);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

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
    navigate(`/patients/${user?.uid}/${patientId}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNewReportClick = () => {
    navigate('/reports');
  };

  const handleExportReport = (report: any) => {
    // Exemplo: exporta como JSON (você pode adaptar para PDF, CSV, etc)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `relatorio_${report.patientName}_${report.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Função para adicionar paciente
  const handleAddPatient = async (dadosPaciente: any) => {
    const db = getDatabase(app);
    const userId = user?.uid; // Pegue do contexto de autenticação
    const patientsRef = ref(db, `patients/${userId}`);
    const newPatientRef = push(patientsRef);
    await set(newPatientRef, { ...dadosPaciente });
  };

  // Função para adicionar relatório
  const handleAddReport = async (dadosRelatorio: any) => {
    const db = getDatabase(app);
    const userId = user?.uid; // Pegue do contexto de autenticação
    const reportsRef = ref(db, `reports/${userId}`);
    const newReportRef = push(reportsRef);
    await set(newReportRef, { ...dadosRelatorio });
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
          inputProps={{ maxLength: INPUT_LIMITS.NAME }}
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
        
        {tabValue === 0 ? (
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
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={handleNewReportClick}
            size="small"
            sx={{
              minWidth: 100,
              fontWeight: 400,
              fontSize: { xs: '0.6rem', sm: '0.95rem' },
              py: 0.5,
              px: 1
            }}
          >
            Novo Relatório
          </Button>
        )}
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
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAddPatient(patient.id); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteIcon sx={{ color: '#e53935' }} fontSize="small" />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getLastBloodPressureString(patient.bloodPressure)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {getLastMetricValue(patient.heartRate, 'value', 'bpm')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Última verificação: {patient.lastCheck || '--'}
                      </Typography>
                    </Box>
                  </Box>
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
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Relatórios Salvos
          </Typography>
          {reports.length === 0 ? (
            <>
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
            </>
          ) : (
            reports.map((report) => (
              <Card key={report.id} sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Paciente: {report.patientName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Período: {report.period}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                    Criado em: {new Date(report.createdAt).toLocaleString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    fullWidth
                    onClick={() => handleExportReport(report)}
                  >
                    Exportar Relatório
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
      
      <AddPatientModal 
        open={addPatientModalOpen} 
        onClose={() => setAddPatientModalOpen(false)} 
        userId={user?.uid}
      />
    </PageContainer>
  );
};

export default PatientsPage;