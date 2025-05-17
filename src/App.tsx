import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";

const Patients = () => <div>Bem-vindo à área de pacientes!</div>;

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/patients" element={<Patients />} />
    </Routes>
  </BrowserRouter>
);

export default App;