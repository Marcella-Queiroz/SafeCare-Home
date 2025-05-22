//Seletor de função para o formulário de registro
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface RoleSelectorProps {
  role: string;
  onRoleChange: (value: string) => void;
}

const RoleSelector = ({ role, onRoleChange }: RoleSelectorProps) => {
  return (
    <FormControl fullWidth margin="normal" required>
      <InputLabel id="role-label">Função</InputLabel>
      <Select
        labelId="role-label"
        id="role"
        value={role}
        label="Função"
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <MenuItem value="doctor">Médico</MenuItem>
        <MenuItem value="nurse">Enfermeiro</MenuItem>
        <MenuItem value="caregiver">Cuidador</MenuItem>
        <MenuItem value="other">Outro</MenuItem>
      </Select>
    </FormControl>
  );
};

export default RoleSelector;