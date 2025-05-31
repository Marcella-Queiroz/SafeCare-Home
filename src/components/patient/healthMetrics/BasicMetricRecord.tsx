//Exibe a lista de registros métricos

import { Typography, Card, CardContent } from '@mui/material';

interface BasicMetricRecordProps {
  records: Array<{
    date: string;
    value: string;
    time: string;
  }>;
}

const BasicMetricRecord = ({ records }: BasicMetricRecordProps) => {
  return (
    <>
      {records.map((item, index) => (
        <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {item.value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.date} às {item.time}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default BasicMetricRecord;
