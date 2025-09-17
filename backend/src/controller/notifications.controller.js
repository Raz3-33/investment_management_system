import * as svc from "../services/notifications.service.js";

export const getSummary = async (req, res) => {
    
    
  try {
    const role = (req.query.role || "").toLowerCase();
    if (!["legal", "finance", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    const data = await svc.getSummary(role);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || "Failed to fetch summary" });
  }
};

export const getList = async (req, res) => {
  try {
    const role = (req.query.role || "").toLowerCase();
    const status = (req.query.status || "pending").toLowerCase(); // 'pending' | 'all'
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const cursor = req.query.cursor || null;

    if (!["legal", "finance", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const data = await svc.getList({ role, status, limit, cursor });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || "Failed to fetch list" });
  }
};
