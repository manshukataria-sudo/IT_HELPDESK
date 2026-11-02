const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createTicket,
  getMyTickets,
  getTicketById,
  getAllTickets,
  assignTicket,
  updateTicketStatus,
  resolveTicket,
  getTicketStats,
  downloadAttachment,
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/", protect, upload.single("attachment"), createTicket);

router.get("/", protect, getMyTickets);

router.get("/all", protect, authorizeRoles("admin"), getAllTickets);

router.patch("/:id/assign", protect, authorizeRoles("admin"), assignTicket);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateTicketStatus,
);

router.patch("/:id/resolve", protect, authorizeRoles("admin"), resolveTicket);

router.get("/stats", protect, authorizeRoles("admin"), getTicketStats);


router.get(
  "/:id/attachments/:blobName",
  protect,
  downloadAttachment
);

// Employee owner OR Admin
router.get("/:id", protect, getTicketById);

module.exports = router;
