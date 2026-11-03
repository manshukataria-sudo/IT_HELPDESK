import { Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NewTicketPage from "./pages/NewTicketPage.jsx";
import TicketDetailsPage from "./pages/TicketDetailsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/tickets/new" element={<NewTicketPage />} />
      <Route path="/tickets/:id" element={<TicketDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
