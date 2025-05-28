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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface MedicationsSectionProps {
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    time?: string;
  }>;
  onAddMedication: () => void;
  onEditMedication: (medication: any, index: number) => void;
  onDeleteMedication: (index: number) => void;
}

const MedicationsSection = ({ 
  medications, 
  onAddMedication, 
  onEditMedication, 
  onDeleteMedication 
}: MedicationsSectionProps) => {
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchor({ ...menuAnchor, [index]: event.currentTarget });
  };

  const handleMenuClose = (index: number) => {
    setMenuAnchor({ ...menuAnchor, [index]: null });
  };

  const handleEditClick = (medication: any, index: number) => {
    onEditMedication(medication, index);
    handleMenuClose(index);
  };

  const handleDeleteClick = (index: number) => {
    onDeleteMedication(index);
    handleMenuClose(index);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <LocalHospitalIcon sx={{ mr: 1, fontSize: 20, verticalAlign: 'text-bottom' }} />
          Medicamentos
        </Typography>
        <Button 
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddMedication}
          sx={{ borderRadius: 2 }}
        >
          Adicionar
        </Button>
      </Box>
      
      {medications && medications.length > 0 ? (
        medications.map((med, index) => (
          <Card key={index} sx={{ mb: 2, borderRadius: 3, position: 'relative' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    {med.name} {med.dosage}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {med.frequency}
                  </Typography>
                  {med.time && (
                    <Chip 
                      label={med.time} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
                
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, index)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={menuAnchor[index]}
                  open={Boolean(menuAnchor[index])}
                  onClose={() => handleMenuClose(index)}
                  PaperProps={{
                    sx: { borderRadius: 2 }
                  }}
                >
                  <MenuItem onClick={() => handleEditClick(med, index)}>
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
            </CardContent>
          </Card>
        ))
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocalHospitalIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Nenhum medicamento registrado
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MedicationsSection;
