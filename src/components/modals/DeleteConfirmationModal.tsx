import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

const DeleteConfirmationModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  loading = false 
}: DeleteConfirmationModalProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta ação não pode ser desfeita
        </Alert>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={<DeleteIcon />}
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
