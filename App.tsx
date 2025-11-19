import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DriverProvider } from './contexts/DriverContext';
import { LoginScreen } from './screens/LoginScreen';
import { DriverScreen } from './screens/DriverScreen';
import { AdminScreen } from './screens/AdminScreen';

// Simple wrapper to redirect to login if accessing root
const IndexRedirect = () => <Navigate to="/login" replace />;

const App: React.FC = () => {
  return (
    <DriverProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/driver" element={<DriverScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </DriverProvider>
  );
};

export default App;
