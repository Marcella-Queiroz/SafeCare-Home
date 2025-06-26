import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/LoginPage";
import { useToast } from "./components/hooks/use-toast";
import PatientsPage from "./pages/PatientsPage";
import { AuthProvider } from "./contexts/AuthContext";
import PatientDetailPage from "./pages/PatientDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const { showToast, ToastComponent } = useToast();

  return (
    <AuthProvider>
      <Router>
        {ToastComponent}
        <Routes>
          <Route path="/" element={<Index showToast={showToast} />} />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:userId/:patientId" 
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;