import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import { useToast } from "./components/hooks/use-toast";

const Patients = () => <div>Bem-vindo à área de pacientes!</div>;

const App = () => {
  const { showToast, ToastComponent } = useToast();

  return (
    <BrowserRouter>
      {ToastComponent}
      <Routes>
        <Route path="/" element={<Index showToast={showToast} />} />
        <Route path="/patients" element={<Patients />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;