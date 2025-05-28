
import { Typography, Card, CardContent, Box, Chip } from '@mui/material';

interface WeightRecordProps {
  records: Array<{
    date: string;
    weight: string;
    height: string;
    imc: string;
  }>;
}

const WeightRecord = ({ records }: WeightRecordProps) => {
  return (
    <>
      {records.map((item, index) => (
        <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {item.weight}
              </Typography>
              <Chip 
                label={`IMC: ${item.imc}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {item.date} - Altura: {item.height}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default WeightRecord;
