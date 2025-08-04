import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useProfileStore } from "../../store/profileStore";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { users, fetchProfiles, updatePassword } = useProfileStore(
    (state) => state
  );

  const [formData, setFormData] = useState({
    fullName: users?.name,
    email: users?.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Correct usage: pass an object with currentPassword and newPassword
    const result = await updatePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (result?.success) {
      toast("Password updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } else {
      toast.error(result?.message || "Failed to update password");
    }
  };

  return (
    <div
      className="bg-gray-100 flex items-center justify-center p-6"
    //   style={{ minHeight: "100dvh", height: "100dvh", overflow: "hidden" }}
    >
      <div
        className="bg-white shadow-xl rounded-2xl w-full max-w-4xl p-8"
        style={{
          maxHeight: "90dvh",
          overflow: "auto",
        }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              disabled
              className="w-full mt-1 p-2 border rounded-md bg-gray-100 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full mt-1 p-2 border rounded-md bg-gray-100 text-gray-700"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t"></div>

        {/* Change Password */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Change Password
        </h3>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handlePasswordUpdate}
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Confirm new password"
            />
          </div>
          <div className="col-span-2 text-right">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
