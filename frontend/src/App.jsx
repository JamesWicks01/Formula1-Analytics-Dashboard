import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Teams from "./pages/Teams";
import Races from "./pages/Races";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/races" element={<Races />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;