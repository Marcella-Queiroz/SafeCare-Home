import {
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import { DeleteIcon, EditIcon } from "lucide-react";
import { formatDateToBR } from '../../../utils/dateUtils';

interface BasicMetricRecordProps {
  records: Array<any>;
  onEdit?: (record: any, index: number) => void;
  onDelete?: (id: string) => void;
  valueLabel?: string;
  unit?: string;
  mainField?: string;
}

const BasicMetricRecord = ({
  records,
  onEdit,
  onDelete,
  valueLabel = "Valor",
  unit = "",
  mainField = "value",
}: BasicMetricRecordProps) => (
  <>
    {records.map((item, index) => (
      <Card key={item.id || index} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {item[mainField] ?? item.value}
                {unit && <span style={{ marginLeft: 4 }}>{unit}</span>}
              </Typography>
              {item.bmi && (
                <Chip
                  label={`IMC: ${item.bmi}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
            <Box>
              {onEdit && (
                <IconButton onClick={() => onEdit(item, index)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  onClick={() => onDelete(item.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {formatDateToBR(item.date)}
            {item.height && ` - Altura: ${item.height}`}
            {item.editedBy
              ? ` | Editado por: ${item.editedBy}`
              : item.createdBy
              ? ` | Cadastrado por: ${item.createdBy}`
              : ""}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </>
);

export default BasicMetricRecord;
