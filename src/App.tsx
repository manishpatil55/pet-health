import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ROUTES } from '@/constants/routes';

// Auth pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';

// Protected pages
import Dashboard from '@/pages/Dashboard';
import PetList from '@/pages/PetList';
import AddPet from '@/pages/AddPet';
import PetProfile from '@/pages/PetProfile';
import VaccinationTracker from '@/pages/VaccinationTracker';
import MedicationTracker from '@/pages/MedicationTracker';
import DewormingTracker from '@/pages/DewormingTracker';
import VetVisitHistory from '@/pages/VetVisitHistory';
import WeightTracking from '@/pages/WeightTracking';
import Documents from '@/pages/Documents';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.LANDING} element={<Landing />} />

          {/* Unified Premium Auth */}
          <Route element={<Login />}>
            <Route path={ROUTES.LOGIN} element={null} />
            <Route path={ROUTES.SIGNUP} element={null} />
            <Route path={ROUTES.VERIFY_OTP} element={null} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={null} />
            <Route path={ROUTES.RESET_PASSWORD} element={null} />
          </Route>

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.PETS} element={<PetList />} />
              <Route path={ROUTES.ADD_PET} element={<AddPet />} />
              <Route path={ROUTES.PET_PROFILE} element={<PetProfile />} />
              <Route path={ROUTES.EDIT_PET} element={<AddPet />} />
              <Route path={ROUTES.VACCINATIONS} element={<VaccinationTracker />} />
              <Route path={ROUTES.MEDICATIONS} element={<MedicationTracker />} />
              <Route path={ROUTES.DEWORMING} element={<DewormingTracker />} />
              <Route path={ROUTES.VET_VISITS} element={<VetVisitHistory />} />
              <Route path={ROUTES.WEIGHT} element={<WeightTracking />} />
              <Route path={ROUTES.DOCUMENTS} element={<Documents />} />
              <Route path={ROUTES.SETTINGS} element={<Settings />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2F3A3A',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#6BCB77',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#E76F51',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
