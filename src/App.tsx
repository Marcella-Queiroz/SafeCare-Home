import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index"; // Supondo que a tela de login seja Index

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} /> {/* Apenas a tela de login */}
    </Routes>
  </BrowserRouter>
);

export default App;