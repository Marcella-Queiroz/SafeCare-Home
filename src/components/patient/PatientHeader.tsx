// Componente de cabeçalho da ficha do paciente com informações básicas e status de compartilhamento

import { Box, Typography, Card, CardContent, Button, Divider, Chip, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { getDatabase, ref, update } from "firebase/database";
import { ReactNode, useEffect, useState } from 'react';
import type { Patient } from '../../types/patient';
import { formatBirthDate } from '@/utils/dataUtils';
import { getUserNameById, getPatientSharingInfo } from '@/utils/securityUtils';
import { useAuth } from '@/contexts/AuthContext';

interface PatientHeaderProps {
  patient: Patient;
  onClose: () => void;
  onEditPatient: () => void;
}

const getLastMetric = (
  metricArr: any[] | undefined,
  field: string,
  unit?: string
) => {
  if (Array.isArray(metricArr) && metricArr.length > 0) {
    const last = metricArr[metricArr.length - 1];
    const value = last[field];
    return value !== undefined && value !== null
      ? `${value}${unit ? ` ${unit}` : ''}`
      : 'Não cadastrado';
  }
  return 'Não cadastrado';
};

const PatientHeader = ({ patient, onClose, onEditPatient }: PatientHeaderProps) => {
  const db = getDatabase();
  const patientId = "ID_DO_PACIENTE";
  const now = new Date();
  const lastCheck = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const [cpf, setCpf] = useState<string>('');
  const [createdByName, setCreatedByName] = useState<string>('');
  const [originalOwnerName, setOriginalOwnerName] = useState<string>('');
  const [isLoadingNames, setIsLoadingNames] = useState<boolean>(true);
  const [sharingInfo, setSharingInfo] = useState<{
    shared: boolean;
    originalOwner?: string;
    beingShared: boolean;
    sharedWithCount: number;
    sharedWithUsers: string[];
  }>({ shared: false, beingShared: false, sharedWithCount: 0, sharedWithUsers: [] });
  
  const { user } = useAuth();

  const handleSaveLastCheck = async () => {
    if (user?.uid) {
      const { updateLastCheckSecure } = await import('../../utils/securityUtils');
      await updateLastCheckSecure(user.uid, patientId);
    }
  };

  useEffect(() => {
    const loadUserNames = async () => {
      if (patient && user?.uid) {
        setIsLoadingNames(true);
        setCpf(patient.cpf || '');
        
        const sharing = await getPatientSharingInfo(user.uid, patient, patient.id);
        setSharingInfo(sharing);
        if (patient.createdBy) {
          const name = await getUserNameById(patient.createdBy);
          
          if (name) {
            setCreatedByName(name);
          } else {
            if (patient.createdBy.includes('@')) {
              setCreatedByName(patient.createdBy); // Usa o próprio email
            } else {
              setCreatedByName('Usuário não encontrado');
            }
          }
        }
        if (sharing.shared && sharing.originalOwner) {
          const name = await getUserNameById(sharing.originalOwner);
          
          if (name) {
            setOriginalOwnerName(name);
          } else {
            if (sharing.originalOwner.includes('@')) {
              setOriginalOwnerName(sharing.originalOwner); // Usa o próprio email
            } else {
              setOriginalOwnerName('Usuário não encontrado');
            }
          }
        }
        
        setIsLoadingNames(false);
      }
    };

    loadUserNames();
  }, [patient, user?.uid]);

  return (
    <>
      <Card sx={{ mb: 3, position: 'relative', borderRadius: 3 }}>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Ficha do Paciente
          </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              {patient.name}
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Idade:</strong> {patient.age} anos
              </Typography>
              {patient.birthDate && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Data de Nascimento:</strong> {formatBirthDate(patient.birthDate)}
                </Typography>
              )}
              {patient.gender && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Sexo:</strong> {patient.gender}
                </Typography>
              )}
              {patient.phone && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Telefone:</strong> {patient.phone}
                </Typography>
              )}
              {patient.address && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Endereço:</strong> {patient.address}
                </Typography>
              )}
              {patient.conditions && patient.conditions.length > 0 && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Condições:</strong> {patient.conditions.join(', ')}
                </Typography>
              )}
              {patient.cpf && (
                <Typography variant="body2" color="textSecondary">
                  <strong>CPF:</strong> {patient.cpf}
                </Typography>
              )}

            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              sx={{ borderRadius: 2 }}
              onClick={onEditPatient}
            >
              Editar
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container columnSpacing={7} rowSpacing={2}>
          <Grid size={{ xs:6 }}>
            <Typography variant="body2" color="textSecondary">Peso:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.weight, 'weight', 'kg')}
            </Typography>
          </Grid>
          <Grid size={{ xs:6 }}>
            <Typography variant="body2" color="textSecondary">Glicose:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.glucose, 'value', 'mg/dL')}
            </Typography>
          </Grid>
          <Grid size={{ xs:6 }}>
            <Typography variant="body2" color="textSecondary">Temperatura:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.temperature, 'value', '°C')}
            </Typography>
          </Grid>
          <Grid size={{ xs:6 }}>
            <Typography variant="body2" color="textSecondary">Saturação:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.oxygen, 'value', '%')}
            </Typography>
          </Grid>
          <Grid size={{ xs:6 }}>
            <Typography variant="body2" color="textSecondary">Frequência Cardíaca:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getLastMetric(patient.heartRate, 'value', 'bpm')}
            </Typography>
          </Grid>
          {patient.lastCheck && (
            <Grid size={{ xs:12, md:6 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Última verificação: {patient.lastCheck}
              </Typography>
            </Grid>
          )}
          
          <Grid size={{ xs:12 }}>
            {patient.createdBy && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                <strong>Paciente cadastrado por:</strong> {
                  isLoadingNames ? 'Verificando...' : (createdByName || 'Não identificado')
                }
              </Typography>
            )}
            
            {sharingInfo.shared && originalOwnerName && (
              <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                <strong>Paciente compartilhado por:</strong> {originalOwnerName}
              </Typography>
            )}
            
            {sharingInfo.beingShared && sharingInfo.sharedWithUsers && sharingInfo.sharedWithUsers.length > 0 && (
              <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                <strong>Paciente compartilhado com ({sharingInfo.sharedWithCount}):</strong> {sharingInfo.sharedWithUsers.join(', ')}
              </Typography>
            )}
          </Grid>

        </Grid>
      </CardContent>
    </Card>
    </>
  );
};

export default PatientHeader;