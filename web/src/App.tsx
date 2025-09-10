import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FluentProvider } from '@fluentui/react-components';
import { queryClient } from './lib/queryClient';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Layout } from './components/common/Layout';
import { getTheme } from './theme/customTheme';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';

function AppContent() {
  const { theme } = useTheme();

  return (
    <FluentProvider theme={getTheme(theme)}>
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
      <ReactQueryDevtools initialIsOpen={false} />
    </FluentProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
