
// Página de criação e gerenciamento de relatórios médicos dos pacientes

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContainer from '../components/PageContainer';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { useAuth } from '../contexts/AuthContext';
import { getUserPatientsWithData } from '@/utils/securityUtils';
import { formatBirthDate } from '@/utils/dataUtils';
import { formatDateToBR } from '@/utils/dateUtils';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<{ id: string, name: string, createdAt?: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const loadPatients = async () => {
      if (!user?.uid) {
        setPatients([]);
        return;
      }

      try {
        const patientsData = await getUserPatientsWithData(user.uid);
        const patientsArray = patientsData.map(patient => ({
          id: patient.id,
          name: patient.name,
          createdAt: patient.createdAt || '',
        }));
        setPatients(patientsArray);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setPatients([]);
      }
    };

    if (user?.uid) {
      const db = getDatabase();
      
      const userPatientsRef = ref(db, `userPatients/${user.uid}`);
      const unsubscribeUserPatients = onValue(userPatientsRef, async (snapshot) => {
        const patientIdsObj = snapshot.val();
        if (!patientIdsObj) {
          setPatients([]);
          setSelectedPatient('');
          return;
        }

        try {
          const patientsData = await getUserPatientsWithData(user.uid);
          const patientsArray = patientsData.map(patient => ({
            id: patient.id,
            name: patient.name,
            createdAt: patient.createdAt || '',
          }));
          setPatients(patientsArray);
          const currentPatientIds = patientsArray.map(p => p.id);
          if (selectedPatient && !currentPatientIds.includes(selectedPatient)) {
            setSelectedPatient('');
          }
        } catch (error) {
          console.error('Erro ao atualizar pacientes:', error);
          setPatients([]);
        }
      });

      const patientsGlobalRef = ref(db, 'patientsGlobal');
      const unsubscribePatientsGlobal = onValue(patientsGlobalRef, async () => {
        try {
          const patientsData = await getUserPatientsWithData(user.uid);
          const patientsArray = patientsData.map(patient => ({
            id: patient.id,
            name: patient.name,
            createdAt: patient.createdAt || '',
          }));
          setPatients(patientsArray);
          
          const currentPatientIds = patientsArray.map(p => p.id);
          if (selectedPatient && !currentPatientIds.includes(selectedPatient)) {
            setSelectedPatient('');
          }
        } catch (error) {
          console.error('Erro ao recarregar pacientes:', error);
        }
      });

      return () => {
        unsubscribeUserPatients();
        unsubscribePatientsGlobal();
      };
    } else {
      setPatients([]);
      setSelectedPatient('');
    }
  }, [user?.uid, selectedPatient]);

  useEffect(() => {
    setStartDate('');
    setEndDate('');
  }, [selectedPatient]);
  const today = new Date().toLocaleDateString('en-CA');
  
  const selectedPatientObj = patients.find(p => p.id === selectedPatient);
  
  let patientCreatedAt = '';
  if (selectedPatientObj?.createdAt) {
    try {
      const patientDate = new Date(selectedPatientObj.createdAt);
      patientCreatedAt = patientDate.toLocaleDateString('en-CA');
    } catch (error) {
      patientCreatedAt = '1900-01-01';
    }
  }

  const isStartDateValid =
    !startDate ||
    (patientCreatedAt && startDate >= patientCreatedAt && startDate <= today) ||
    (!patientCreatedAt && startDate <= today);

  const isEndDateValid =
    !endDate ||
    (patientCreatedAt && endDate >= patientCreatedAt && endDate <= today) ||
    (!patientCreatedAt && endDate <= today);

  const isCreateDisabled =
    !selectedPatient ||
    !startDate ||
    !endDate ||
    !isStartDateValid ||
    !isEndDateValid;

  const exportReportToPDF = (reportData: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const margin = {
      top: 30,
      bottom: 20,
      left: 30,
      right: 20,
    };
    const usableWidth = pageWidth - margin.left - margin.right;
    
    const weightHistory = Array.isArray(reportData.weightHistory)
      ? reportData.weightHistory
      : reportData.weightHistory
      ? Object.values(reportData.weightHistory)
      : [];
    const bloodPressureHistory = Array.isArray(reportData.bloodPressureHistory)
      ? reportData.bloodPressureHistory
      : reportData.bloodPressureHistory
      ? Object.values(reportData.bloodPressureHistory)
      : [];
    const glucoseHistory = Array.isArray(reportData.glucoseHistory)
      ? reportData.glucoseHistory
      : reportData.glucoseHistory
      ? Object.values(reportData.glucoseHistory)
      : [];
    const medications = Array.isArray(reportData.medications)
      ? reportData.medications
      : reportData.medications
      ? Object.values(reportData.medications)
      : [];
    const appointments = Array.isArray(reportData.appointments)
      ? reportData.appointments
      : reportData.appointments
      ? Object.values(reportData.appointments)
      : [];
    const heartRateHistory = Array.isArray(reportData.heartRateHistory)
      ? reportData.heartRateHistory
      : reportData.heartRateHistory
      ? Object.values(reportData.heartRateHistory)
      : [];
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(15);
    doc.setTextColor(33, 33, 33);
    doc.text("Prontuário Eletrônico do Paciente", pageWidth / 2, margin.top, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(
      `Data de Emissão: ${formatDateToBR(new Date())}`,
      margin.left,
      margin.top + 8
    );
    doc.text(
      `Relatório dos Últimos ${reportData.period || "--"}`,
      margin.left,
      margin.top + 14
    );

    const autoTableCommon = {
      margin: {
        left: margin.left,
        right: margin.right,
        top: margin.top,
        bottom: margin.bottom,
      },
      tableWidth: usableWidth,
    };
    
    autoTable(doc, {
      ...autoTableCommon,
      startY: margin.top + 19,
      head: [["DADOS DO PACIENTE", ""]],
      body: [
        ["Nome Completo:", reportData.patientName || "-"],
        ["Data de Nascimento:", formatBirthDate(reportData.birthDate || "")],
        ["Idade:", reportData.age || "-"],
        ["Sexo:", reportData.gender || "-"],
        ["Contato:", reportData.phone || "-"],
        ["Endereço:", reportData.address || "-"],
      ],
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], halign: "center" },
      bodyStyles: { halign: "left" },
      styles: { fontSize: 10 },
    });

    let y = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["CONDIÇÕES CLÍNICAS"]],
      body: (reportData.conditions || []).map((cond: string) => [cond]),
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], halign: "center" },
      bodyStyles: { halign: "left" },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["HISTÓRICO DE INDICADORES DE SAÚDE"]],
      body: [],
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], halign: "center" },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Data da Aferição", "Peso", "IMC (kg/m²)"]],
      body: weightHistory.map((item: any) => [
        item.date ? (formatDateToBR(item.date) || item.date) : "-",
        item.weight || "-",
        item.bmi || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Data da Aferição", "Pressão Arterial (Sist/Diast)"]],
      body: bloodPressureHistory.map((item: any) => [
        item.date ? (formatDateToBR(item.date) || item.date) : "-",
        item.systolic && item.diastolic
          ? `${item.systolic}/${item.diastolic}`
          : item.value || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Data da Aferição", "Frequência Cardíaca (bpm)"]],
      body: heartRateHistory.map((item: any) => [
        item.date ? (formatDateToBR(item.date) || item.date) : "-",
        item.value || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Data da Aferição", "Glicose (Jejum)"]],
      body: glucoseHistory.map((item: any) => [
        item.date ? (formatDateToBR(item.date) || item.date) : "-",
        item.value || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["MEDICAMENTOS (Prescrições Ativas)"]],
      body: [],
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], halign: "center" },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Medicamento", "Posologia"]],
      body: medications.map((item: any) => [
        item.name || "-",
        item.dosage || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["AGENDAMENTOS (Histórico e Futuros)"]],
      body: [],
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], halign: "center" },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 2;
    autoTable(doc, {
      ...autoTableCommon,
      startY: y,
      head: [["Data", "Horário", "Status"]],
      body: appointments.map((item: any) => [
        item.date ? (formatDateToBR(item.date) || item.date) : "-",
        item.time || "-",
        item.status || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    if (Array.isArray(reportData.observations) && reportData.observations.length > 0) {
      autoTable(doc, {
        ...autoTableCommon,
        startY: y,
        head: [["OBSERVAÇÕES"]],
        body: reportData.observations.map((obs: any) => [
          `${obs.text} (${obs.createdAt ? (formatDateToBR(obs.createdAt) || obs.createdAt) : 'Data não disponível'})`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [220, 220, 220], halign: "center" },
        bodyStyles: { halign: "left" },
        styles: { fontSize: 10 },
      });
    } else {
      autoTable(doc, {
        ...autoTableCommon,
        startY: y,
        head: [["OBSERVAÇÕES"]],
        body: [["Nenhuma observação registrada."]],
        theme: "grid",
        headStyles: { fillColor: [220, 220, 220], halign: "center" },
        bodyStyles: { halign: "left" },
        styles: { fontSize: 10 },
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Gerado por SafeCare Home",
        pageWidth - margin.right,
        doc.internal.pageSize.getHeight() - margin.bottom,
        { align: "right" }
      );
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`prontuario_${reportData.patientName || "paciente"}_${timestamp}.pdf`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (isCreateDisabled) {
      setError('Preencha todos os campos corretamente.');
      return;
    }

    setSubmitLoading(true);
    try {
      const db = getDatabase(app);
      const reportsRef = ref(db, `reports/${user.uid}`);

      const patientRef = ref(db, `patientsGlobal/${selectedPatient}`);
      const snapshot = await get(patientRef);
      const patientData = snapshot.val();

      if (!patientData) {
        setError('Paciente não encontrado.');
        setSubmitLoading(false);
        return;
      }

      const reportData = {
        patientName: patientData.name,
        birthDate: formatBirthDate(patientData.birthDate || ''),
        age: patientData.age || '',
        gender: patientData.gender || '',
        phone: patientData.phone || '',
        address: patientData.address || '',
        conditions: patientData.conditions || [],
        weightHistory: patientData.weight || [],
        bloodPressureHistory: patientData.bloodPressure || [],
        glucoseHistory: patientData.glucose || [],
        height: patientData.height || '',
        temperature: patientData.temperature || '',
        oxygen: patientData.oxygen || '',
        medications: patientData.medications || [],
        appointments: patientData.appointments || [],
        heartRateHistory: patientData.heartRate || [],
        observations: patientData.observations
          ? Object.values(patientData.observations)
          : [],
        period: `${startDate} a ${endDate}`,
        createdAt: new Date().toISOString(),
      };

      await push(reportsRef, reportData);

      setSuccess(true);

      // Exportar automaticamente o relatório em PDF
      try {
        exportReportToPDF(reportData);
      } catch (pdfError) {
        console.error('Erro ao exportar PDF:', pdfError);
        // Não falha o processo se o PDF der erro
      }

      setTimeout(() => navigate('/patients?tab=relatorios'), 1000);
    } catch (err) {
      console.error('Erro detalhado ao salvar relatório:', err);
      setError(`Erro ao salvar relatório: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, mr: 1 }}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h6" fontWeight={600}>
            Novo Relatório
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <form onSubmit={handleCreate}>
              <Typography fontWeight={500} sx={{ mb: 1 }}>
                Selecione o paciente
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Paciente</InputLabel>
                <Select
                  value={selectedPatient}
                  label="Paciente"
                  onChange={e => setSelectedPatient(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={500} sx={{ mb: 1 }}>
                Período
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Data inicial
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      placeholder: 'dd/mm/aaaa',
                      min: patientCreatedAt || '1900-01-01',
                      max: today,
                    }}
                    sx={{ mt: 0.5 }}
                    error={!!startDate && !isStartDateValid}
                    helperText={
                      !!startDate && !isStartDateValid
                        ? `A data inicial deve ser entre ${patientCreatedAt || '1900-01-01'} e ${today}.`
                        : selectedPatient ? `Período permitido: ${patientCreatedAt || '1900-01-01'} até ${today}` : ''
                    }
                    disabled={!selectedPatient}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Data final
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      placeholder: 'dd/mm/aaaa',
                      min: patientCreatedAt || '1900-01-01',
                      max: today,
                    }}
                    sx={{ mt: 0.5 }}
                    error={!!endDate && !isEndDateValid}
                    helperText={
                      !!endDate && !isEndDateValid
                        ? `A data final deve ser entre ${patientCreatedAt || '1900-01-01'} e ${today}.`
                        : selectedPatient ? `Período permitido: ${patientCreatedAt || '1900-01-01'} até ${today}` : ''
                    }
                    disabled={!selectedPatient}
                  />
                </Box>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>
                Relatório criado com sucesso! O PDF foi baixado automaticamente.
              </Alert>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate(-1)}
                  sx={{ minWidth: 120 }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isCreateDisabled || submitLoading}
                  sx={{ minWidth: 180 }}
                  type="submit"
                >
                  Criar Relatório
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default ReportsPage;