import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/LoginPage";
import { useToast } from "./components/hooks/use-toast";
import PatientsPage from "./pages/PatientsPage";
import { AuthProvider } from "./contexts/AuthContext"; // Adicione este import

const App = () => {
  const { showToast, ToastComponent } = useToast();

  return (
    <AuthProvider>
      <BrowserRouter>
        {ToastComponent}
        <Routes>
          <Route path="/" element={<Index showToast={showToast} />} />
          <Route path="/patients" element={<PatientsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;