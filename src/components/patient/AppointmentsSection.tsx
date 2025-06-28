// Componente para exibição e gerenciamento dos agendamentos médicos do paciente

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface Appointment {
  title: string;
  date: string;
  time: string;
  createdBy?: string;
  editedBy?: string;
}

interface AppointmentsSectionProps {
  appointments?: Appointment[];
  onAddAppointment: () => void;
  onEditAppointment: (appointment: any, index: number) => void;
  onDeleteAppointment: (index: number) => void;
}

const AppointmentsSection = ({ 
  appointments, 
  onAddAppointment, 
  onEditAppointment, 
  onDeleteAppointment 
}: AppointmentsSectionProps) => {
  const [appointmentMenuAnchor, setAppointmentMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  const handleAppointmentMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAppointmentMenuAnchor({ ...appointmentMenuAnchor, [index]: event.currentTarget });
  };

  const handleAppointmentMenuClose = (index: number) => {
    setAppointmentMenuAnchor({ ...appointmentMenuAnchor, [index]: null });
  };

  const handleEditClick = (appointment: any, index: number) => {
    onEditAppointment(appointment, index);
    handleAppointmentMenuClose(index);
  };

  const handleDeleteClick = (index: number) => {
    onDeleteAppointment(index);
    handleAppointmentMenuClose(index);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <AssessmentIcon sx={{ mr: 1, fontSize: 20, verticalAlign: 'text-bottom' }} />
          Agendamentos
        </Typography>
        <Button 
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddAppointment}
          sx={{ borderRadius: 2 }}
        >
          Agendar
        </Button>
      </Box>
      
      {appointments && appointments.length > 0 ? (
        appointments.map((appointment, index) => (
          <Card key={index} sx={{ mb: 2, borderRadius: 3, position: 'relative' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    {appointment.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {appointment.date}
                  </Typography>
                  <Chip 
                    label={appointment.time} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                
                <IconButton 
                  size="small"
                  onClick={(e) => handleAppointmentMenuOpen(e, index)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={appointmentMenuAnchor[index]}
                  open={Boolean(appointmentMenuAnchor[index])}
                  onClose={() => handleAppointmentMenuClose(index)}
                  PaperProps={{
                    sx: { borderRadius: 2 }
                  }}
                >
                  <MenuItem onClick={() => handleEditClick(appointment, index)}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Editar
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleDeleteClick(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Excluir
                  </MenuItem>
                </Menu>
              </Box>
              
              <Typography variant="body2" color="textSecondary">
                {appointment.createdBy && `Cadastrado por: ${appointment.createdBy}`}
                {appointment.editedBy && ` | Editado por: ${appointment.editedBy}`}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AssessmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Nenhum agendamento registrado
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AppointmentsSection;
