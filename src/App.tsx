import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { theme } from 'theme';
import { BrowserRouter } from 'react-router-dom';
import { Router } from 'Router';

export const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Router />
        </ThemeProvider>
      </BrowserRouter>
    </StyledEngineProvider>
  );
};
