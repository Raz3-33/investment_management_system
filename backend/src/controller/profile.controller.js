import * as profileService from "../services/profile.service.js";

// Get all payouts for a specific investment
export const getProfile = async (req, res) => {
  try {
    const profiles = await profileService.getUserById(req.query.id);

    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
      await profileService.changeUserPassword(userId, currentPassword, newPassword);
      return res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (serviceError) {
      // Catch error thrown from the service and respond with 400
      return res.status(400).json({ success: false, message: serviceError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
