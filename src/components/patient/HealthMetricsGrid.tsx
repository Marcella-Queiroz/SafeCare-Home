// Exibe o grupo de cards das métricas de saúde

import { Typography, Card, CardContent, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Weight } from 'lucide-react';
import OpacityIcon from '@mui/icons-material/Opacity';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import Grid from '@mui/material/Grid';

type HealthMetricType = 'bloodPressure' | 'weight' | 'oxygen' | 'temperature' | 'glucose' | 'heartRate';

interface HealthMetricsGridProps {
  onMetricClick: (type: HealthMetricType) => void;
  weight?: any[];
  bloodPressure?: any[];
  glucose?: any[];
  temperature?: any[];
  oxygen?: any[];
  heartRate?: any[];
}

const HealthMetricsGrid = ({
  onMetricClick,
  weight,
  bloodPressure,
  glucose,
  temperature,
  oxygen,
  heartRate,
}: HealthMetricsGridProps) => {
  const metrics = [
    {
      type: 'weight' as HealthMetricType,
      icon: <Weight size={24} style={{ color: '#3949ab' }} />,
      label: 'Peso, Altura e IMC'
    },
    {
      type: 'bloodPressure' as HealthMetricType,
      icon: <FavoriteIcon sx={{ color: '#e53935', fontSize: { xs: 24, md: 32 } }} />,
      label: 'Pressão Arterial'
    },
    {
      type: 'glucose' as HealthMetricType,
      icon: <BloodtypeIcon sx={{ color: '#ff9800', fontSize: { xs: 24, md: 32 } }} />,
      label: 'Glicose'
    },
    {
      type: 'temperature' as HealthMetricType,
      icon: <ThermostatIcon sx={{ color: '#e53935', fontSize: { xs: 24, md: 32 } }} />,
      label: 'Temperatura'
    },
    {
      type: 'oxygen' as HealthMetricType,
      icon: <OpacityIcon sx={{ color: '#1e88e5', fontSize: { xs: 24, md: 32 } }} />,
      label: 'Saturação O₂'
    },
    {
      type: 'heartRate' as HealthMetricType,
      icon: <MonitorHeartIcon sx={{ color: '#e53935', fontSize: { xs: 24, md: 32 } }} />,
      label: 'Freq. Cardíaca'
    }
  ];

  const renderCard = (metric: (typeof metrics)[number]) => (
    <Grid item xs={12} sm={4} key={metric.type}>
      <Card
        sx={{
          height: { xs: 100, md: 170 },
          width: '100%',
          aspectRatio: '1/1',
          cursor: 'pointer',
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(76, 175, 80, 0.04)',
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 20px rgba(76, 175, 80, 0.2)'
          }
        }}
        onClick={() => onMetricClick(metric.type)}
      >
        <CardContent
          sx={{
            textAlign: 'center',
            p: 1.5,
            '&:last-child': { pb: 1.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          {metric.icon}
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              fontWeight: 500,
              mt: 0.5,
              fontSize: { xs: '0.7rem', md: '0.85rem' },
              lineHeight: 1.1,
              textAlign: 'center'
            }}
          >
            {metric.label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Indicadores de Saúde
      </Typography>

      <Grid
        container
        spacing={2}
        justifyContent="center"
        sx={{ maxWidth: 600, margin: '0 auto', mb: 4 }}
      >
        <Grid container spacing={2}>
          {metrics.map(renderCard)}
        </Grid>
      </Grid>
    </>
  );
};

export default HealthMetricsGrid;
