//Editar modal da glicose

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';
import { validateGlucose } from '@/utils/validations';

interface EditGlucoseModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  onSave: (data: any) => void | Promise<void>;
  patientCreatedAt: string;
  userName: string;
}

const EditGlucoseModal = ({ open, onClose, record, onSave, patientCreatedAt, userName }: EditGlucoseModalProps) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (record) {
      setValue(record.value || '');
      setDate(record.date || '');
      setTime(record.time || '');
    }
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validation = validateGlucose(value, date, patientCreatedAt);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    try {
      await onSave({ ...record, value, date, time, editedBy: userName });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        onClose();
      }, 1200);
    } catch {
      setError('Erro ao salvar dados');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Glicose</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Registro atualizado!</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Glicose (mg/dL)"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            inputProps={{
              min: patientCreatedAt || '1900-01-01',
              max: today,
            }}
          />
          <TextField
            label="Hora"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>Salvar</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGlucoseModal;