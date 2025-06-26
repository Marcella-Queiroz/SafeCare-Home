//Pagina de criação de relatórios

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

  // Buscar pacientes do Firebase usando função segura
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
      
      // Listener em tempo real para mudanças na lista de pacientes do usuário
      const userPatientsRef = ref(db, `userPatients/${user.uid}`);
      const unsubscribeUserPatients = onValue(userPatientsRef, async (snapshot) => {
        const patientIdsObj = snapshot.val();
        if (!patientIdsObj) {
          setPatients([]);
          setSelectedPatient(''); // Limpar seleção se não há pacientes
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
          
          // Se o paciente selecionado foi removido, limpar a seleção
          const currentPatientIds = patientsArray.map(p => p.id);
          if (selectedPatient && !currentPatientIds.includes(selectedPatient)) {
            setSelectedPatient('');
          }
        } catch (error) {
          console.error('Erro ao atualizar pacientes:', error);
          setPatients([]);
        }
      });

      // Listener adicional para mudanças nos dados globais dos pacientes
      const patientsGlobalRef = ref(db, 'patientsGlobal');
      const unsubscribePatientsGlobal = onValue(patientsGlobalRef, async () => {
        // Recarregar a lista quando houver mudanças nos dados globais
        try {
          const patientsData = await getUserPatientsWithData(user.uid);
          const patientsArray = patientsData.map(patient => ({
            id: patient.id,
            name: patient.name,
            createdAt: patient.createdAt || '',
          }));
          setPatients(patientsArray);
          
          // Verificar se o paciente selecionado ainda existe
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

  // Limpar datas ao trocar de paciente
  useEffect(() => {
    setStartDate('');
    setEndDate('');
  }, [selectedPatient]);

  const today = new Date().toISOString().split('T')[0];
  const selectedPatientObj = patients.find(p => p.id === selectedPatient);
  const patientCreatedAt = selectedPatientObj?.createdAt
    ? selectedPatientObj.createdAt.split('T')[0]
    : '';

  const isStartDateValid =
    !startDate ||
    (startDate >= (patientCreatedAt || '1900-01-01') && startDate <= today);

  const isEndDateValid =
    !endDate ||
    (endDate >= (patientCreatedAt || '1900-01-01') && endDate <= today);

  const isCreateDisabled =
    !selectedPatient ||
    !startDate ||
    !endDate ||
    !isStartDateValid ||
    !isEndDateValid;

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

      // Busque todos os dados do paciente do banco usando estrutura global
      const patientRef = ref(db, `patientsGlobal/${selectedPatient}`);
      const snapshot = await get(patientRef);
      const patientData = snapshot.val();

      if (!patientData) {
        setError('Paciente não encontrado.');
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
      setTimeout(() => navigate('/patients?tab=relatorios'), 800);
    } catch (err) {
      setError('Erro ao salvar relatório.');
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
                        ? `A data inicial deve ser entre ${patientCreatedAt || 'o cadastro'} e hoje.`
                        : ''
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
                        ? `A data final deve ser entre ${patientCreatedAt || 'o cadastro'} e hoje.`
                        : ''
                    }
                    disabled={!selectedPatient}
                  />
                </Box>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>Relatório criado com sucesso!</Alert>}
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