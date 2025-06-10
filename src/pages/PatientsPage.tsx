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
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import { INPUT_LIMITS } from '@/constants/inputLimits';
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { useAuth } from '../contexts/AuthContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Metric {
  id: string;
  value: number | string;
  date: string;
}

interface BloodPressure extends Metric {
  value: string;
  systolic: number;
  diastolic: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  lastCheck?: string;
  weight: Metric[];
  glucose: Metric[];
  bloodPressure: BloodPressure[];
  temperature: Metric[];
  oxygen: Metric[];
  heartRate: Metric[];
}

interface Report {
  id: string;
  patientName: string;
  period: string;
  createdAt: number;
  metrics: {
    [key: string]: string | number;
  };
}

function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toLowerCase();
}

function getStatusByBloodPressure(bloodPressure: BloodPressure[]): 'Estável' | 'Atenção' {
  if (Array.isArray(bloodPressure) && bloodPressure.length > 0) {
    const last = bloodPressure[bloodPressure.length - 1];
    if (last && typeof last === 'object' && last.systolic && last.diastolic) {
      const { systolic, diastolic } = last;
      if (systolic >= 90 && systolic <= 130 && diastolic >= 60 && diastolic <= 85) {
        return "Estável";
      }
    }
  }
  return "Atenção";
}

function getLastBloodPressureString(bloodPressure: BloodPressure[]): string {
  if (Array.isArray(bloodPressure) && bloodPressure.length > 0) {
    const last = bloodPressure[bloodPressure.length - 1];
    if (last && last.value) {
      return last.value;
    }
    if (last && last.systolic && last.diastolic) {
        return `${last.systolic}/${last.diastolic}`;
    }
  }
  return '-';
}

function getLastMetricValue(metric: Metric[], suffix: string = ''): string {
  if (Array.isArray(metric) && metric.length > 0) {
    const last = metric[metric.length - 1];
    if (last && typeof last === 'object' && 'value' in last) {
      return `${last.value}${suffix}`;
    }
  }
  return '-';
}

function convertMetricsToArray<T extends Metric>(metricsObj: any): T[] {
  if (!metricsObj) return [];
  if (Array.isArray(metricsObj)) return metricsObj.filter(Boolean);
  if (typeof metricsObj === 'object') {
    return Object.entries(metricsObj).map(([id, data]) =>
      typeof data === 'object' && data !== null ? { id, ...data } as T : { id, value: data } as T
    );
  }
  return [];
}

function convertPatientMetrics(patient: any): Patient {
  if (!patient) return patient;
  const converted = { ...patient };
  converted.bloodPressure = convertMetricsToArray<BloodPressure>(patient.bloodPressure);
  converted.weight = convertMetricsToArray<Metric>(patient.weight);
  converted.glucose = convertMetricsToArray<Metric>(patient.glucose);
  converted.temperature = convertMetricsToArray<Metric>(patient.temperature);
  converted.oxygen = convertMetricsToArray<Metric>(patient.oxygen);
  converted.heartRate = convertMetricsToArray<Metric>(patient.heartRate);
  return converted;
}

const PatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const patientsRef = ref(db, `patients/${user.uid}`);
    
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientArray: Patient[] = Object.entries(data).map(([id, value]) => {
          const patientData = { id, ...(value as Omit<Patient, 'id'>) };
          return convertPatientMetrics(patientData);
        });
        setPatients(patientArray);
      } else {
        setPatients([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const reportsRef = ref(db, `reports/${user.uid}`);
    
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportArray: Report[] = Object.entries(data).map(([id, value]) => ({
          id,
          ...(value as Omit<Report, 'id'>),
        }));
        setReports(reportArray.reverse());
      } else {
        setReports([]);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const filteredPatients = patients.filter(patient => {
    const name = (patient.name || '').toLowerCase();
    const search = searchTerm.trim().toLowerCase();
    return name.includes(search);
  });

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${user?.uid}/${patientId}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNewReportClick = () => {
    navigate('/reports');
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!user?.uid || !patientId) return;
    const db = getDatabase(app);
    const patientRef = ref(db, `patients/${user.uid}/${patientId}`);
    try {
      await remove(patientRef);
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      alert("Não foi possível excluir o paciente.");
    }
  };

  const handleExportReport = (report: Report) => {
    const doc = new jsPDF();
    
    const metricTranslations: { [key: string]: string } = {
        weight: "Peso (kg)",
        glucose: "Glicose (mg/dL)",
        bloodPressure: "Pressão Arterial (mmHg)",
        temperature: "Temperatura (°C)",
        oxygen: "Saturação de O₂ (%)",
        heartRate: "Frequência Cardíaca (bpm)",
    };

    doc.setFontSize(16);
    doc.text("Relatório do Paciente", 14, 18);

    const data = [
      ["Paciente", report.patientName],
      ["Período", report.period],
      ["Criado em", new Date(report.createdAt).toLocaleString()],
    ];

    autoTable(doc, {
      startY: 28,
      head: [["Campo", "Valor"]],
      body: data,
      theme: "grid",
      styles: { fontSize: 12 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    if (report.metrics && Object.keys(report.metrics).length > 0) {
      const metricsBody = Object.entries(report.metrics).map(([key, value]) => {
          const translatedKey = metricTranslations[key] || key;
          return [translatedKey, String(value)];
      });
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Métrica", "Valor Médio"]],
        body: metricsBody,
        theme: "striped",
        styles: { fontSize: 11 },
      });
    }

    doc.save(`relatorio_${report.patientName}_${report.id}.pdf`);
  };

  const handleAddPatient = async (dadosPaciente: Omit<Patient, 'id'>) => {
    if(!user?.uid) return;
    const db = getDatabase(app);
    const patientsRef = ref(db, `patients/${user.uid}`);
    const newPatientRef = push(patientsRef);
    await set(newPatientRef, dadosPaciente);
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            TabIndicatorProps={{
              style: { backgroundColor: tabValue === 0 ? '#1976d2' : '#4caf50' }
            }}
            sx={{
              width: '100%',
              '.MuiTabs-flexContainer': {
                justifyContent: 'space-between'
              }
            }}
            variant="fullWidth"
          >
            <Tab
              label="PACIENTES"
              sx={{
                fontWeight: 700,
                color: tabValue === 0 ? '#1976d2' : 'inherit',
                flex: 1,
                fontSize: '1rem',
              }}
            />
            <Tab
              label="RELATÓRIOS"
              sx={{
                fontWeight: 700,
                color: tabValue === 1 ? '#1976d2' : 'inherit',
                flex: 1,
                fontSize: '1rem',
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ mb: 2 }}>
          {tabValue === 0 ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddPatientModalOpen(true)}
              fullWidth
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: 1.2,
                mb: 1
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
              fullWidth
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: 1.2,
                mb: 1
              }}
            >
              Novo Relatório
            </Button>
          )}
        </Box>
        
        {tabValue === 0 ? (
            <Box sx={{ mt: 2 }}>
                {loading ? (
                    <Typography textAlign="center">Carregando pacientes...</Typography>
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <Card 
                            key={patient.id} 
                            sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
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
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPatientToDelete(patient.id);
                                        setConfirmDeleteOpen(true);
                                      }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FavoriteIcon sx={{ color: '#e53935' }} fontSize="small" />
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {getLastBloodPressureString(patient.bloodPressure)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">FC:</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {getLastMetricValue(patient.heartRate, 'bpm')}
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
                    <Typography textAlign="center">Nenhum paciente encontrado.</Typography>
                )}
            </Box>
        ) : (
            <Box sx={{ mt: 2 }}>
                {reports.length === 0 ? (
                    <Typography textAlign="center">Nenhum relatório salvo.</Typography>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
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
            onAdd={handleAddPatient}
        />
        <DeleteConfirmationModal
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            if (patientToDelete) {
              await handleDeletePatient(patientToDelete);
            }
            setConfirmDeleteOpen(false);
            setPatientToDelete(null);
          }}
          title="Excluir Paciente"
          message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
        />
    </PageContainer>
  );
};

export default PatientsPage;