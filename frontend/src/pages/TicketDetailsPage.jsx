import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest, API_URL } from "../lib/api";
import "./TicketDetailsPage.css";

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const ticketData = await apiRequest(`/tickets/${id}`);
        const commentData = await apiRequest(`/comments/${id}`);

        setTicket(ticketData.ticket);
        setComments(commentData.comments);
      } catch (err) {
        console.error("Ticket details error:", err);
        setError(err.message);
      }
    };

    loadData();
  }, [id]);

  const addComment = async () => {
    if (!message.trim()) return;

    try {
      await apiRequest(`/comments/${id}`, {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      });

      setMessage("");

      const commentData = await apiRequest(`/comments/${id}`);

      setComments(commentData.comments);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadAttachment = async (attachment) => {
    try {
      setDownloading(attachment.blobName);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/tickets/${id}/attachments/${encodeURIComponent(
          attachment.blobName,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Download API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        throw new Error(`Download failed (${response.status}): ${errorText}`);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Attachment download error:", err);
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  if (error) {
    return (
      <main className="ticket-details-page">
        <div className="ticket-error-card">
          <p className="ticket-error">{error}</p>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="ticket-details-page">
        <p className="ticket-loading">Loading...</p>
      </main>
    );
  }

  return (
    <main className="ticket-details-page">
      <div className="ticket-details-shell">
        {/* Ticket */}
        <div className="ticket-panel">
          <h1 className="ticket-title">{ticket.title}</h1>

          <p className="ticket-description">{ticket.description}</p>

          <div className="ticket-metadata">
            <p>
              <strong>Status:</strong> {ticket.status.replace("_", " ")}
            </p>

            <p>
              <strong>Priority:</strong> {ticket.priority}
            </p>

            <p>
              <strong>Category:</strong> {ticket.category}
            </p>

            {ticket.createdBy && (
              <p>
                <strong>Created by:</strong> {ticket.createdBy.name}
              </p>
            )}

            {ticket.assignedTo && (
              <p>
                <strong>Assigned to:</strong> {ticket.assignedTo.name}
              </p>
            )}
          </div>

          {ticket.resolution && (
            <div className="ticket-resolution">
              <strong>Resolution</strong>

              <p className="ticket-resolution-text">{ticket.resolution}</p>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="ticket-attachments">
              <h2 className="ticket-section-title">Attachments</h2>

              <div className="ticket-attachment-list">
                {ticket.attachments.map((attachment) => (
                  <div
                    key={attachment.blobName}
                    className="ticket-attachment"
                  >
                    <div>
                      <p className="ticket-attachment-name">📎 {attachment.fileName}</p>

                      <p className="ticket-attachment-meta">
                        {attachment.contentType} ·{" "}
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <button
                      onClick={() => downloadAttachment(attachment)}
                      disabled={downloading === attachment.blobName}
                      className="ticket-download"
                    >
                      {downloading === attachment.blobName
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="ticket-comments-panel">
          <h2 className="ticket-section-title">Comments</h2>

          <div className="ticket-comment-list">
            {comments.length === 0 ? (
              <p className="ticket-muted">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="ticket-comment">
                  <strong>{comment.author?.name || "User"}</strong>

                  <p className="ticket-comment-message">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          <textarea
            className="ticket-comment-input"
            rows={4}
            placeholder="Write a comment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={addComment}
            className="ticket-comment-submit"
          >
            Add Comment
          </button>
        </div>
      </div>
    </main>
  );
}
