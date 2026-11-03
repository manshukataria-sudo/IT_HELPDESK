import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import "./DashboardPage.css";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await apiRequest("/tickets");

setTickets(data.tickets);
      } catch (err) {
        setError(err.message);
      }
    };

    loadTickets();
  }, []);

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">

 <div className="dashboard-header">
  <div>
    <h1 className="dashboard-title">
      My Tickets
    </h1>

    <p className="dashboard-subtitle">
      Track your IT support requests
    </p>
  </div>

  <div className="dashboard-actions">
    <Link
      to="/tickets/new"
      className="dashboard-create"
    >
      Create Ticket
    </Link>

    <LogoutButton />
  </div>
</div>

        {error && (
          <p className="dashboard-error">{error}</p>
        )}

        <div className="dashboard-tickets">
          {tickets.length === 0 ? (
  <div className="dashboard-empty">
    <p className="dashboard-muted">
      You haven't created any tickets yet.
    </p>
  </div>
) : (
  <div className="dashboard-ticket-list">
    {tickets.map((ticket) => (
      <Link
        to={`/tickets/${ticket._id}`}
        key={ticket._id}
        className="dashboard-ticket"
      >
        <div className="dashboard-ticket-header">
          <h2 className="dashboard-ticket-title">
            {ticket.title}
          </h2>

          <span className="dashboard-status">
            {ticket.status.replace("_", " ")}
          </span>
        </div>

        <p className="dashboard-description">
          {ticket.description}
        </p>

        <p className="dashboard-priority">
          Priority: {ticket.priority}
        </p>
      </Link>
    ))}
  </div>
)}
        </div>

      </div>
    </main>
  );
}