import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import LogoutButton from "../components/LogoutButton.jsx";
import { Link } from "react-router-dom";
import "./AdminPage.css";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [resolution, setResolution] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setError("");

      const [ticketsData, statsData, usersData] =
        await Promise.all([
          apiRequest("/tickets/all"),
          apiRequest("/tickets/stats"),
          apiRequest("/users/admins"),
        ]);

      setTickets(ticketsData.tickets || []);
      setStats(statsData.stats || {});

      setAdmins(
        (usersData.users || []).filter(
          (user) => user.role === "admin"
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Assign ticket
  const assignTicket = async (ticketId, adminId) => {
    if (!adminId) return;

    try {
      setError("");

      await apiRequest(
        `/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({
            assignedTo: adminId,
          }),
        }
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Change ticket status
  const updateStatus = async (ticketId, status) => {
    try {
      setError("");

      await apiRequest(
        `/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        }
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Resolve ticket
  const resolveTicket = async (ticketId) => {
    try {
      setError("");

      const text = resolution[ticketId];

      if (!text?.trim()) {
        setError(
          "Please enter a resolution before resolving."
        );
        return;
      }

      await apiRequest(
        `/tickets/${ticketId}/resolve`,
        {
          method: "PATCH",
          body: JSON.stringify({
            resolution: text.trim(),
          }),
        }
      );

      setResolution((prev) => ({
        ...prev,
        [ticketId]: "",
      }));

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-shell">
          <p>Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              Admin Dashboard
            </h1>

            <p className="admin-subtitle">
              Manage and resolve IT support tickets
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Error */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="admin-statistics">
            {Object.entries(stats).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="admin-stat-card"
                >
                  <p className="admin-stat-label">
                    {status.replace("_", " ")}
                  </p>

                  <p className="admin-stat-value">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* No tickets */}
        {tickets.length === 0 ? (
          <div className="admin-empty">
            <h2 className="admin-empty-title">
              No tickets found
            </h2>

            <p className="admin-muted">
              There are currently no support tickets.
            </p>
          </div>
        ) : (
          /* Tickets */
          <div className="admin-ticket-list">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="admin-ticket"
              >

                {/* Ticket header */}
                <div className="admin-ticket-header">
                  <div>
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="admin-ticket-title"
                    >
                      {ticket.title}
                    </Link>

                    <p className="admin-ticket-description">
                      {ticket.description}
                    </p>
                  </div>

                  <span className="admin-ticket-status">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Ticket information */}
                <div className="admin-ticket-information">

                  <div>
                    <p className="admin-field-label">
                      Employee
                    </p>

                    <p className="admin-field-value">
                      {ticket.createdBy?.name || "Unknown"}
                    </p>

                    <p className="admin-field-secondary">
                      {ticket.createdBy?.email || ""}
                    </p>
                  </div>

                  <div>
                    <p className="admin-field-label">
                      Priority
                    </p>

                    <p className="admin-field-value admin-capitalize">
                      {ticket.priority}
                    </p>
                  </div>

                  <div>
                    <p className="admin-field-label">
                      Category
                    </p>

                    <p className="admin-field-value admin-capitalize">
                      {ticket.category}
                    </p>
                  </div>

                  <div>
                    <p className="admin-field-label">
                      Assigned To
                    </p>

                    <p className="admin-field-value">
                      {ticket.assignedTo?.name ||
                        "Unassigned"}
                    </p>
                  </div>

                </div>

                {/* Admin actions */}
                <div className="admin-actions">

                  <p className="admin-actions-title">
                    Admin Actions
                  </p>

                  <div className="admin-actions-row">

                    {/* Assign */}
                    <select
                      value={ticket.assignedTo?._id || ""}
                      onChange={(e) =>
                        assignTicket(
                          ticket._id,
                          e.target.value
                        )
                      }
                      className="admin-assignee"
                    >
                      <option value="">
                        {ticket.assignedTo
                          ? "Change assignee"
                          : "Assign to..."}
                      </option>

                      {admins.map((admin) => (
                        <option
                          key={admin._id}
                          value={admin._id}
                        >
                          {admin.name}
                        </option>
                      ))}
                    </select>

                    {/* Start work */}
                    {ticket.status === "assigned" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            ticket._id,
                            "in_progress"
                          )
                        }
                        className="admin-button admin-start-button"
                      >
                        Start Work
                      </button>
                    )}

                    {/* Close resolved ticket */}
                    {ticket.status === "resolved" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            ticket._id,
                            "closed"
                          )
                        }
                        className="admin-button admin-close-button"
                      >
                        Close Ticket
                      </button>
                    )}

                  </div>

                  {/* Resolution */}
                  {ticket.status === "in_progress" && (
                    <div className="admin-resolution-form">

                      <textarea
                        rows={3}
                        value={
                          resolution[ticket._id] || ""
                        }
                        onChange={(e) =>
                          setResolution((prev) => ({
                            ...prev,
                            [ticket._id]:
                              e.target.value,
                          }))
                        }
                        placeholder="Describe how the issue was resolved..."
                        className="admin-resolution-input"
                      />

                      <button
                        onClick={() =>
                          resolveTicket(ticket._id)
                        }
                        className="admin-button admin-resolve-button"
                      >
                        Resolve Ticket
                      </button>

                    </div>
                  )}

                  {/* Existing resolution */}
                  {ticket.resolution && (
                    <div className="admin-existing-resolution">
                      <p className="admin-existing-resolution-title">
                        Resolution
                      </p>

                      <p className="admin-existing-resolution-text">
                        {ticket.resolution}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}