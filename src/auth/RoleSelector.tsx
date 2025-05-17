import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";

interface RoleSelectorProps {
  role: string;
  onRoleChange: (value: string) => void;
}

const RoleSelector = ({ role, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="role" className="col-span-4">
        Função
      </Label>
      <Select value={role} onValueChange={onRoleChange} required>
        <SelectTrigger id="role" className="col-span-4">
          <SelectValue placeholder="Selecione sua função" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="doctor">Médico</SelectItem>
          <SelectItem value="nurse">Enfermeiro</SelectItem>
          <SelectItem value="caregiver">Cuidador</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="other">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;
