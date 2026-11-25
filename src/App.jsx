import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Loans from "./pages/Loans";
import Admin from "./pages/Admin";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Requieren sesión (USER o ADMIN) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/forbidden" element={<Forbidden />} />
      </Route>

      {/* Solo ADMIN */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;