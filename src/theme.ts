import { createTheme } from '@mui/material';
const palette = {
  text: {
    primary: '#202d6d',
    secondary: '#88899E',
  },
  primary: {
    main: '#1A2273',
  },
};

export const theme = createTheme({
  palette,
  components: {},
  typography: {
    fontFamily: 'Ubuntu Sans, sans-serif',
  },
});
