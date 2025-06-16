// Pagina de gerenciamento de pacientes e relatórios

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
import { useAuth } from '@/contexts/AuthContext';
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
  observations: boolean;
  heartRate: any[];
  id: string;
  patientName: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  conditions?: string[];
  weightHistory?: any[];
  bloodPressureHistory?: any[];
  glucoseHistory?: any[];
  height?: string;
  temperature?: string;
  oxygen?: string;
  medications?: any[];
  appointments?: any[];
  period: string;
  createdAt: number | string;
  metrics?: {
    [key: string]: string | number;
  };
}

// Função para obter o status baseado na pressão arterial
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

// Função para obter o último valor de pressão arterial como string
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

// Função para obter o último valor de uma métrica
function getLastMetricValue(metric: Metric[], suffix: string = ''): string {
  if (Array.isArray(metric) && metric.length > 0) {
    const last = metric[metric.length - 1];
    if (last && typeof last === 'object' && 'value' in last) {
      return `${last.value}${suffix}`;
    }
  }
  return '-';
}

// Função para converter métricas em array
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

// Função para converter os dados do paciente
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

// Função que gerencia lista de pacientes e relatórios
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

  // Carrega pacientes do Firebase
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const patientsRef = ref(db, `patients/${user.uid}`);
    
    //
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

  // Filtra pacientes com base no termo de busca
  const filteredPatients = patients.filter(patient => {
    const name = (patient.name || '').toLowerCase();
    const search = searchTerm.trim().toLowerCase();
    return name.includes(search);
  });

  // Função para lidar com o clique no paciente
  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${user?.uid}/${patientId}`);
  };

  // Função para lidar com a mudança de aba
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Função para abrir o modal de novo relatório
  const handleNewReportClick = () => {
    navigate('/reports');
  };

  // Função para excluir paciente
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

  //Função para exportar relatório
  const handleExportReport = (report: Report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const margin = {
      top: 30,
      bottom: 20,
      left: 30,
      right: 20
    };
    const usableWidth = pageWidth - margin.left - margin.right;
    const weightHistory = Array.isArray(report.weightHistory)
      ? report.weightHistory
      : report.weightHistory
        ? Object.values(report.weightHistory)
        : [];
    const bloodPressureHistory = Array.isArray(report.bloodPressureHistory)
      ? report.bloodPressureHistory
      : report.bloodPressureHistory
        ? Object.values(report.bloodPressureHistory)
        : [];
    const glucoseHistory = Array.isArray(report.glucoseHistory)
      ? report.glucoseHistory
      : report.glucoseHistory
        ? Object.values(report.glucoseHistory)
        : [];
    const medications = Array.isArray(report.medications)
      ? report.medications
      : report.medications
        ? Object.values(report.medications)
        : [];
    const appointments = Array.isArray(report.appointments)
      ? report.appointments
      : report.appointments
        ? Object.values(report.appointments)
        : [];

    // Cabeçalho
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.setTextColor(33, 33, 33);
    doc.text('Prontuário Eletrônico do Paciente', pageWidth / 2, margin.top, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString()}`, margin.left, margin.top + 8);
    doc.text(`Relatório dos Últimos ${report.period || '--'}`, margin.left, margin.top + 14);

    const autoTableCommon = {
      margin: { left: margin.left, right: margin.right, top: margin.top, bottom: margin.bottom },
      tableWidth: usableWidth
    };

    // Dados do paciente
    autoTable(doc, {
      ...autoTableCommon,
      startY: margin.top + 19,
      head: [['DADOS DO PACIENTE', '']],
      body: [
        ['Nome Completo:', report.patientName || '-'],
        ['Data de Nascimento:', report.birthDate || '-'],
        ['Idade:', report.age || '-'],
        ['Sexo:', report.gender || '-'],
        ['Contato:', report.phone || '-'],
        ['Endereço:', report.address || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], halign: 'center' },
      bodyStyles: { halign: 'left' },
      styles: { fontSize: 10 }
    });

    let y = (doc as any).lastAutoTable.finalY + 4;

    // Condições clínicas
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['CONDIÇÕES CLÍNICAS']],
      body: (report.conditions || []).map((cond: string) => [cond]),
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], halign: 'center' },
      bodyStyles: { halign: 'left' },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // Histórico de indicadores de saúde
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['HISTÓRICO DE INDICADORES DE SAÚDE']],
      body: [],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], halign: 'center' },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // Peso corporal
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Data da Aferição', 'Peso', 'IMC (kg/m²)']],
      body: (weightHistory).map((item: any) => [
        item.date || '-', item.weight || '-', item.bmi || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // Pressão arterial (removida a coluna de frequência cardíaca)
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Data da Aferição', 'Pressão Arterial (Sist/Diast)']],
      body: (bloodPressureHistory).map((item: any) => [
        item.date || '-',
        (item.systolic && item.diastolic) ? `${item.systolic}/${item.diastolic}` : (item.value || '-')
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // Frequência Cardíaca (mantida como tabela separada)
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Data da Aferição', 'Frequência Cardíaca (bpm)']],
      body: (report.heartRate || []).map((item: any) => [
        item.date || '-', item.value || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 }
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // Glicose
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Data da Aferição', 'Glicose (Jejum)']],
      body: (glucoseHistory).map((item: any) => [
        item.date || '-', item.value || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // Medicamentos
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['MEDICAMENTOS (Prescrições Ativas)']],
      body: [],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], halign: 'center' },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Medicamento', 'Posologia']],
      body: (medications).map((item: any) => [
        item.name || '-', item.dosage || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // Agendamentos
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['AGENDAMENTOS (Histórico e Futuros)']],
      body: [],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], halign: 'center' },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [['Data', 'Horário', 'Status']], 
      body: (appointments).map((item: any) => [
        item.date || '-', item.time || '-', item.status || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // Observações
    if (Array.isArray(report.observations) && report.observations.length > 0) {
      autoTable(doc, {
        ...autoTableCommon,
        startY: y,
        head: [['OBSERVAÇÕES']],
        body: report.observations.map((obs: any) => [
          `${obs.text} (${new Date(obs.createdAt).toLocaleDateString('pt-BR')})`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], halign: 'center' },
        bodyStyles: { halign: 'left' },
        styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    } else {
      autoTable(doc, {
        ...autoTableCommon,
        startY: y,
        head: [['OBSERVAÇÕES']],
        body: [['Nenhuma observação registrada.']],
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], halign: 'center' },
        bodyStyles: { halign: 'left' },
        styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Gerado por SafeCare Home',
        pageWidth - margin.right,
        doc.internal.pageSize.getHeight() - margin.bottom,
        { align: 'right' }
      );
    }

    doc.save(`prontuario_${report.patientName || 'paciente'}_${report.id}.pdf`);
  };


  // Função para cadastrar paciente
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
          userId={user?.uid}
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

export type { Metric, BloodPressure };

export default PatientsPage;