//Layout para exibição de métricas de saúde

import { Typography, Card, CardContent } from '@mui/material';
import { ReactNode } from 'react';

interface HealthMetricDisplayProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const HealthMetricDisplay = ({ title, icon, children }: HealthMetricDisplayProps) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {icon}
        {title}
      </Typography>
      {children}
    </>
  );
};

export default HealthMetricDisplay;
