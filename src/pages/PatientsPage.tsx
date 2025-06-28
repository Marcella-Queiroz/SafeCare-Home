
// Página principal de gerenciamento de pacientes com funcionalidades de listagem, criação, compartilhamento e geração de relatórios

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PageContainer from "@/components/PageContainer";
import AddPatientModal from "@/components/modals/add/AddPatientModal";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import CheckPatientByCPFModal from '@/components/patient/CheckPatientByCPFModal';
import { INPUT_LIMITS } from "@/constants/inputLimits";
import { getDatabase, ref, onValue, set, push, remove, get, update } from "firebase/database";
import { app } from "@/services/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PatientQuickSearchModal from "@/components/patient/PatientQuickSearch";
import { convertMetricsToArray, formatBirthDate } from '@/utils/dataUtils';
import { 
  getUserPatientsWithData, 
  createPatientSecure, 
  grantPatientAccess, 
  revokePatientAccess 
} from '@/utils/securityUtils';
import { Patient, Metric, BloodPressure, Observation } from "../types/patient";

interface Report {
  observations: any[];
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
  [x: string]: any;
}

function getStatusByBloodPressure(
  bloodPressure: BloodPressure[]
): "Estável" | "Atenção" {
  if (Array.isArray(bloodPressure) && bloodPressure.length > 0) {
    const last = bloodPressure[bloodPressure.length - 1];
    if (last && typeof last === "object" && last.systolic && last.diastolic) {
      const { systolic, diastolic } = last;
      if (
        systolic >= 90 &&
        systolic <= 130 &&
        diastolic >= 60 &&
        diastolic <= 85
      ) {
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
      return String(last.value);
    }
    if (last && last.systolic && last.diastolic) {
      return `${last.systolic}/${last.diastolic}`;
    }
  }
  return "-";
}

function getLastMetricValue(metric: Metric[], suffix: string = ""): string {
  if (Array.isArray(metric) && metric.length > 0) {
    const last = metric[metric.length - 1];
    if (last && typeof last === "object" && "value" in last) {
      return `${last.value}${suffix}`;
    }
  }
  return "-";
}

function convertPatientMetrics(patient: any): Patient {
  if (!patient) return patient;
  const converted = { ...patient };
  converted.bloodPressure = convertMetricsToArray<BloodPressure>(
    patient.bloodPressure
  );
  converted.weight = convertMetricsToArray<Metric>(patient.weight);
  converted.glucose = convertMetricsToArray<Metric>(patient.glucose);
  converted.temperature = convertMetricsToArray<Metric>(patient.temperature);
  converted.oxygen = convertMetricsToArray<Metric>(patient.oxygen);
  converted.heartRate = convertMetricsToArray<Metric>(patient.heartRate);
  if (patient.createdBy) converted.createdBy = patient.createdBy;
  if (patient.editedBy) converted.editedBy = patient.editedBy;
  if (patient.lastCheck) converted.lastCheck = patient.lastCheck;
  return converted;
}
const PatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [checkCPFModalOpen, setCheckCPFModalOpen] = useState(false);
  const [pendingCPF, setPendingCPF] = useState<string | null>(null);
  useEffect(() => {
    const loadPatients = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const patientsData = await getUserPatientsWithData(user.uid);
        const patientsWithMetrics = patientsData.map(patient => 
          convertPatientMetrics(patient)
        );
        setPatients(patientsWithMetrics);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
    if (user?.uid) {
      const db = getDatabase();
      const userPatientsRef = ref(db, `userPatients/${user.uid}`);
      const unsubscribe = onValue(userPatientsRef, async (snapshot) => {
        const patientIdsObj = snapshot.val();
        if (!patientIdsObj) {
          setPatients([]);
          return;
        }

        try {
          const patientsData = await getUserPatientsWithData(user.uid);
          const patientsWithMetrics = patientsData.map(patient => 
            convertPatientMetrics(patient)
          );
          setPatients(patientsWithMetrics);
        } catch (error) {
          console.error('Erro ao atualizar pacientes:', error);
        }
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);
  useEffect(() => {
    if (!user?.uid) return;
    const db = getDatabase(app);
    const reportsRef = ref(db, `reports/${user.uid}`);

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportArray: Report[] = Object.entries(data).map(
          ([id, value]) => {
            const v = value as Partial<Report>;
            return {
              id,
              observations: Array.isArray(v.observations)
                ? v.observations
                : [],
              heartRate: v.heartRate ?? [],
              patientName: v.patientName ?? "",
              period: v.period ?? "",
              createdAt: v.createdAt ?? "",
              ...v,
            };
          }
        );
        setReports(reportArray.reverse());
      } else {
        setReports([]);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);
  const filteredPatients = patients.filter((patient) => {
    const name = (patient.name || "").toLowerCase();
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
    navigate("/reports");
  };
  const handleAddPatient = async (dadosPaciente: Omit<Patient, "id">) => {
    if (!user?.uid) return;

    try {
      const patientData = {
        ...dadosPaciente,
        createdAt: new Date().toISOString(),
        createdBy: user?.name || user?.email || user?.uid,
      };

      const patientId = await createPatientSecure(user.uid, patientData);
      
      if (!patientId) {
        console.error('Erro ao criar paciente');
        return;
      }
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
    }
  };
  const handleSharePatient = async (patientId: string, otherUserId: string) => {
    try {
      await grantPatientAccess(otherUserId, patientId);
    } catch (error) {
      console.error('Erro ao compartilhar paciente:', error);
    }
  };
  const handleDeletePatient = async (patientId: string) => {
    if (!user?.uid || !patientId) return;

    try {
      await revokePatientAccess(user.uid, patientId);
    } catch (error) {
      console.error('Erro ao remover acesso ao paciente:', error);
    }
  };
  const handleExportReport = (report: Report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const margin = {
      top: 30,
      bottom: 20,
      left: 30,
      right: 20,
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(15);
    doc.setTextColor(33, 33, 33);
    doc.text("Prontuário Eletrônico do Paciente", pageWidth / 2, margin.top, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(
      `Data de Emissão: ${new Date().toLocaleDateString()}`,
      margin.left,
      margin.top + 8
    );
    doc.text(
      `Relatório dos Últimos ${report.period || "--"}`,
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
        ["Nome Completo:", report.patientName || "-"],
        ["CPF:", report.cpf || "-"],
        ["Data de Nascimento:", formatBirthDate(report.birthDate || "")],
        ["Idade:", report.age || "-"],
        ["Sexo:", report.gender || "-"],
        ["Contato:", report.phone || "-"],
        ["Endereço:", report.address || "-"],
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
      body: (report.conditions || []).map((cond: string) => [cond]),
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
        item.date || "-",
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
        item.date || "-",
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
      body: (report.heartRate || []).map((item: any) => [
        item.date || "-",
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
        item.date || "-",
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
        item.date || "-",
        item.time || "-",
        item.status || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    if (Array.isArray(report.observations) && report.observations.length > 0) {
      autoTable(doc, {
        ...autoTableCommon,
        startY: y,
        head: [["OBSERVAÇÕES"]],
        body: report.observations.map((obs: any) => [
          `${obs.text} (${new Date(obs.createdAt).toLocaleDateString(
            "pt-BR"
          )})`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [220, 220, 220], halign: "center" },
        bodyStyles: { halign: "left" },
        styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
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
      y = (doc as any).lastAutoTable.finalY + 4;
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

    doc.save(`prontuario_${report.patientName || "paciente"}_${report.id}.pdf`);
  };

  const handleAddPatientClick = () => {
    setCheckCPFModalOpen(true);
  };

  const handleCPFCheckFound = async (patient: any) => {
    setCheckCPFModalOpen(false);
    if (!user?.uid) return;
    const db = getDatabase(app);
    const patientsRef = ref(db, `patients/${user.uid}`);
    const newPatientRef = push(patientsRef);
    const newId = newPatientRef.key;
    await set(newPatientRef, {
      ...patient,
      id: newId,
      shared: true,
      originalOwner: patient.ownerUserId,
      cpf: patient.cpf || '',
      createdBy: patient.createdBy || patient.ownerUserId || '',
      editedBy: patient.editedBy || '',
    });
  };

  const handleCPFCheckNotFound = (cpf: string) => {
    setCheckCPFModalOpen(false);
    setPendingCPF(cpf);
    setAddPatientModalOpen(true);
  };

  return (
    <PageContainer>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { backgroundColor: tabValue === 0 ? "#1976d2" : "#4caf50" },
          }}
          sx={{
            width: "100%",
            ".MuiTabs-flexContainer": {
              justifyContent: "space-between",
            },
          }}
          variant="fullWidth"
        >
          <Tab
            label="PACIENTES"
            sx={{
              fontWeight: 700,
              color: tabValue === 0 ? "#1976d2" : "inherit",
              flex: 1,
              fontSize: "1rem",
            }}
          />
          <Tab
            label="RELATÓRIOS"
            sx={{
              fontWeight: 700,
              color: tabValue === 1 ? "#1976d2" : "inherit",
              flex: 1,
              fontSize: "1rem",
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
            onClick={handleAddPatientClick}
            fullWidth
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.9rem", sm: "1rem" },
              py: 1.2,
              mb: 1,
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
              fontSize: { xs: "0.9rem", sm: "1rem" },
              py: 1.2,
              mb: 1,
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
                sx={{ mb: 2, cursor: "pointer", "&:hover": { boxShadow: 6 } }}
                onClick={() => handlePatientClick(patient.id)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{ fontWeight: 600 }}
                        >
                          {patient.name}
                        </Typography>
                        <Chip
                          label={getStatusByBloodPressure(
                            patient.bloodPressure
                          )}
                          color={
                            getStatusByBloodPressure(patient.bloodPressure) ===
                            "Estável"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                          sx={{ ml: 1, height: 22 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {patient.age} anos -{" "}
                        {(patient.conditions || []).join(", ")}
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <FavoriteIcon
                        sx={{ color: "#e53935" }}
                        fontSize="small"
                      />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getLastBloodPressureString(patient.bloodPressure)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        FC:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getLastMetricValue(patient.heartRate, "bpm")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        ml: "auto",
                      }}
                    >
                      <AccessTimeIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Última verificação: {patient.lastCheck || "--"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography textAlign="center">
              Nenhum paciente encontrado.
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          {reports.length === 0 ? (
            <Typography textAlign="center">Nenhum relatório salvo.</Typography>
          ) : (
            reports.map((report) => (
              <Card key={report.id} sx={{ mb: 2, maxWidth: 600, mx: "auto" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Paciente: {report.patientName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Período: {report.period}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    sx={{ mb: 2 }}
                  >
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

      <CheckPatientByCPFModal
        open={checkCPFModalOpen}
        onClose={() => setCheckCPFModalOpen(false)}
        onFound={handleCPFCheckFound}
        onNotFound={handleCPFCheckNotFound}
      />
      <AddPatientModal
        open={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onAdd={handleAddPatient}
        userId={user?.uid}
        initialCPF={pendingCPF || undefined}
      />
      <PatientQuickSearchModal
        open={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        patients={patients}
        onSelect={(patient) => {
          setQuickSearchOpen(false);
        }}
        onCreateNew={(searchValue) => {
          setQuickSearchOpen(false);
          setAddPatientModalOpen(true);
        }}
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