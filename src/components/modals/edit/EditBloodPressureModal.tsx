import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert
} from '@mui/material';

interface EditBloodPressureModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  onSave: (data: any) => void | Promise<void>;
  patientCreatedAt: string;
  userName: string; // <-- NOVO
}

const EditBloodPressureModal = ({ open, onClose, record, onSave, patientCreatedAt, userName }: EditBloodPressureModalProps) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (record) {
      setSystolic(record.systolic || '');
      setDiastolic(record.diastolic || '');
      setDate(record.date || '');
      setTime(record.time || '');
    }
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!systolic || !diastolic || !date) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (date < patientCreatedAt) {
      setError(`A data não pode ser anterior a ${patientCreatedAt}`);
      return;
    }
    if (date > today) {
      setError('A data não pode ser maior que hoje');
      return;
    }
    setLoading(true);
    try {
      await onSave({ ...record, systolic, diastolic, date, time, editedBy: userName }); // <-- Salva quem editou
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
      <DialogTitle>Editar Pressão Arterial</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Registro atualizado!</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Sistólica (mmHg)"
            type="number"
            value={systolic}
            onChange={e => setSystolic(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 3 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Diastólica (mmHg)"
            type="number"
            value={diastolic}
            onChange={e => setDiastolic(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 3 }}
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

export default EditBloodPressureModal;