import { Typography, Card, CardContent, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface BasicMetricRecordProps {
  records: any[];
  onEdit?: (record: any, index: number) => void;
  onDelete?: (record: any, index: number) => void; // NOVO
}

const BasicMetricRecord = ({ records, onEdit, onDelete }: BasicMetricRecordProps) => {
  return (
    <>
      {records.map((item, index) => (
        <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.date}{item.time ? ` às ${item.time}` : ''}
              </Typography>
            </div>
            <div>
              {onEdit && (
                <IconButton onClick={() => onEdit(item, index)}>
                  <EditIcon />
                </IconButton>
              )}
              {onDelete && (
                <IconButton color="error" onClick={() => onDelete(item, index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default BasicMetricRecord;
