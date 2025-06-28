import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { Observation } from '../../types/patient';

interface ObservationsSectionProps {
  observations: Observation[];
  onAdd: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const ObservationsSection = ({ observations, onAdd, onEdit, onDelete }: ObservationsSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [text, setText] = useState('');

  const handleOpen = (obs?: Observation) => {
    setEditId(obs?.id || null);
    setText(obs?.text || '');
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setText('');
    setEditId(null);
  };

  const handleSave = () => {
    if (editId) onEdit(editId, text);
    else onAdd(text);
    handleClose();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <NotesOutlinedIcon sx={{ mr: 1, fontSize: 20, verticalAlign: 'text-bottom' }} />
          Observações
        </Typography>
        <Button size="small"
          variant="outlined" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ borderRadius: 2 }}>
          Adicionar
        </Button>
      </Box>
      {observations.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <NotesOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Nenhuma observação registrada
            </Typography>
          </CardContent>
        </Card>
      ) : (
        observations.map(obs => (
          <Card key={obs.id} sx={{ mb: 1 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
              <Box>
                <Typography variant="body2">{obs.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(() => {
                    const dateToShow = obs.createdAt || (obs as any).date;
                    return dateToShow && !isNaN(new Date(dateToShow).getTime()) 
                      ? new Date(dateToShow).toLocaleString() 
                      : 'Data não disponível';
                  })()}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpen(obs)}><EditIcon fontSize="small" /></IconButton>
                <IconButton onClick={() => onDelete(obs.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={modalOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Editar Observação' : 'Nova Observação'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Observação"
            value={text}
            onChange={e => setText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!text.trim()}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObservationsSection;