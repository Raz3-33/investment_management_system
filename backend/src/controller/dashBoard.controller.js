import * as dashboardService from "../services/dashBoard.service.js";

export const findDashboard = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.DashboardService();

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    // Handle known errors
    if (err.message) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    // Unhandled errors
    next(err);
  }
};
