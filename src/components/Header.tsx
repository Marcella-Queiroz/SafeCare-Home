import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  styled,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    minWidth: 180,
    marginTop: theme.spacing(1),
  },
  '& .MuiMenuItem-root:first-of-type': {
    marginTop: 0,
    paddingTop: theme.spacing(1),
  },
}));

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Link to="/patients" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
        </Box>
        <IconButton
          size="large"
          aria-label="menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          sx={{ color: '#bdbdbd' }}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
        <StyledMenu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem disabled sx={{ opacity: 0.7, mt: 0, pt: 1 }}>
            {user?.name}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleProfile}>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Sair
          </MenuItem>
        </StyledMenu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;