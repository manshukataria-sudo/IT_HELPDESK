import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import "./NewTicketPage.css";

export default function NewTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "hardware",
    priority: "medium",
  });

  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("priority", form.priority);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await apiRequest("/tickets", {
        method: "POST",
        body: formData,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="new-ticket-page">
      <form
        onSubmit={submit}
        className="new-ticket-form"
      >
        <h1 className="new-ticket-title">
          Create Support Ticket
        </h1>

        {error && (
          <p className="new-ticket-error">
            {error}
          </p>
        )}

        <input
          className="new-ticket-input new-ticket-field"
          placeholder="Ticket title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          required
        />

        <textarea
          className="new-ticket-input new-ticket-field"
          placeholder="Describe your problem"
          rows={6}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          required
        />

        <select
          className="new-ticket-input new-ticket-field"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        >
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="access">Access</option>
          <option value="other">Other</option>
        </select>

        <select
          className="new-ticket-input new-ticket-priority"
          value={form.priority}
          onChange={(e) =>
            setForm({
              ...form,
              priority: e.target.value,
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Attachment */}
        <div className="new-ticket-attachment">
          <label className="new-ticket-label">
            Attachment{" "}
            <span className="new-ticket-muted">
              (optional)
            </span>
          </label>

          <input
            type="file"
            onChange={(e) =>
              setAttachment(e.target.files[0] || null)
            }
            className="new-ticket-input"
          />

          {attachment && (
            <p className="new-ticket-selected">
              Selected: {attachment.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="new-ticket-submit"
        >
          {submitting
            ? "Creating Ticket..."
            : "Create Ticket"}
        </button>
      </form>
    </main>
  );
}