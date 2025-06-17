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
} from "@mui/material";
import { useState } from "react";
import { Patient } from "../modals/add/AddPatientModal";

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
      <DialogTitle
       
      >
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
          {filtered.map((p) => (
            <ListItem key={p.id} disablePadding>
              <ListItemButton onClick={() => onSelect(p)}>
                <ListItemText primary={p.name} secondary={p.age} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onCreateNew(search)}
          // Só habilita se não houver paciente com o CPF exato
          disabled={
            !search ||
            filtered.some(
              (p) =>
                p.cpf &&
                p.cpf.replace(/\D/g, '') === search.replace(/\D/g, '')
            )
          }
        >
          Cadastrar novo paciente
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientQuickSearchModal;