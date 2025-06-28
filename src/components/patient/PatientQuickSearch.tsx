import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { Patient } from "../../types/patient";

interface PatientQuickSearchModalProps {
  open: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelect: (patient: Patient) => void;
  onCreateNew: (searchValue: string) => void;
}

const PatientQuickSearchModal = ({
  open,
  onClose,
  patients,
  onSelect,
  onCreateNew,
}: PatientQuickSearchModalProps) => {
  const [search, setSearch] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.cpf && p.cpf.replace(/\D/g, '').includes(search.replace(/\D/g, '')))
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        overflow: 'visible',
      }}
    >
      <DialogTitle>
        Buscar Paciente
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Nome, CPF ou E-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          autoFocus
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 1, mb: 2 }}
        />
        <List>
          {filtered.map((p, idx) => (
            <Box key={p.id}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => onSelect(p)}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    background: "#f9f9f9",
                    mb: 0.5,
                    "&:hover": {
                      background: "#e3f2fd",
                      borderColor: "#90caf9",
                    },
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: "#1976d2", color: "#fff" }}>
                    {p.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Idade: {p.age} {p.cpf && `| CPF: ${p.cpf}`}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
              {idx < filtered.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          ))}
          {filtered.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: "center" }}>
              Nenhum paciente encontrado.
            </Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onCreateNew(search)}
          disabled={
            !search ||
            filtered.some(
              (p) =>
                p.cpf &&
                p.cpf.replace(/\D/g, '') === search.replace(/\D/g, '')
            )
          }
          sx={{
            backgroundColor: "#000 !important",
            color: "#fff !important",
            "&:hover": {
              backgroundColor: "#222 !important",
            },
            boxShadow: "none",
          }}
        >
          Cadastrar novo paciente
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientQuickSearchModal;