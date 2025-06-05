//Exibe registros de peso, altura e IMC

import { Typography, Card, CardContent, Box, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface WeightRecordProps {
  records: Array<{
    bmi: string;
    date: string;
    weight: string;
    height: string;
    imc: string;
    id?: string;
  }>;
  onEdit?: (record: any, index: number) => void;
  onDelete?: (record: any, index: number) => void;
}

const WeightRecord = ({ records, onEdit, onDelete }: WeightRecordProps) => (
  <>
    {records.map((item, index) => (
      <Card key={item.id || index} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {item.weight}
              </Typography>
              <Chip label={`IMC: ${item.bmi ?? item.imc ?? '-'}`} size="small" color="primary" variant="outlined" />
            </Box>
            <Box>
              {onEdit && (
                <IconButton onClick={() => onEdit(item, index)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton onClick={() => onDelete(item, index)} size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {item.date} - Altura: {item.height}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </>
);

export default WeightRecord;
