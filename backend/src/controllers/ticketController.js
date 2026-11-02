const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { isValidTransition } = require("../services/ticketService");
const {
  uploadToCloudinary,
  downloadFromCloudinary,
} = require("../services/cloudinaryService");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      });
    }

    let attachment = null;

    if (req.file) {
      attachment = await uploadToCloudinary(req.file);
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || "medium",
      createdBy: req.user.userId,
      attachments: attachment ? [attachment] : [],
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isOwner = ticket.createdBy._id.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this ticket",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Get ticket error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { id, blobName } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isOwner =
      ticket.createdBy.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to download this attachment",
      });
    }

    const attachment = ticket.attachments.find(
      (item) => item.blobName === blobName
    );

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    const downloadResponse = await downloadFromCloudinary(blobName);

    if (downloadResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: "File not found in Cloudinary",
      });
    }

    if (!downloadResponse.ok || !downloadResponse.body) {
      throw new Error(
        `Cloudinary download failed with status ${downloadResponse.status}`
      );
    }

    res.setHeader(
      "Content-Type",
      attachment.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(
        attachment.fileName
      )}`
    );

    res.setHeader("Content-Length", attachment.size);
    await pipeline(Readable.fromWeb(downloadResponse.body), res);
  } catch (error) {
    console.error(
      "Download attachment error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to download attachment",
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get all tickets error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assigned user ID is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    if (assignedUser.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Ticket can only be assigned to an admin",
      });
    }

    ticket.assignedTo = assignedUser._id;
    ticket.status = "assigned";

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update ticket status",
      });
    }

    if (!isValidTransition(ticket.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${ticket.status} to ${status}`,
      });
    }

    ticket.status = status;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Update ticket status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resolveTicket = async (req, res) => {
  try {
    const { resolution } = req.body || {};

    if (!resolution || !resolution.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resolution is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress tickets can be resolved",
      });
    }

    ticket.resolution = resolution.trim();
    ticket.status = "resolved";

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket resolved successfully",
      ticket,
    });
  } catch (error) {
    console.error("Resolve ticket error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      open: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    stats.forEach((item) => {
      result[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: result,
    });
  } catch (error) {
    console.error("Ticket stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  getAllTickets,
  assignTicket,
  updateTicketStatus,
  resolveTicket,
  getTicketStats,
  downloadAttachment,
};
