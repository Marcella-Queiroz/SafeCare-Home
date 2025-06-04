import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/LoginPage";
import { useToast } from "./components/hooks/use-toast";
import PatientsPage from "./pages/PatientsPage";
import { AuthProvider } from "./contexts/AuthContext";
import PatientDetailPage from "./pages/PatientDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";

const App = () => {
  const { showToast, ToastComponent } = useToast();

  return (
    <AuthProvider>
      <Router>
        {ToastComponent}
        <Routes>
          <Route path="/" element={<Index showToast={showToast} />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:userId/:patientId" element={<PatientDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;