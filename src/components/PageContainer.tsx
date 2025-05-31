//Organiza a estrutura de páginas

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Header from '../components/Header';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const PageContainer = ({ children, maxWidth = 'sm' }: PageContainerProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container 
        maxWidth={maxWidth}
        sx={{ 
          py: 3, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default PageContainer;