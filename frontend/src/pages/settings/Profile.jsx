// src/pages/settings/Profile.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProfileStore } from "../../store/profileStore";

export default function Profile() {
  const {
    users,            // can be either { ...user } or { data: { ...user } }
    fetchProfiles,    // () => Promise<void>
    updatePassword,   // ({ currentPassword, newPassword }) => Promise<{success:boolean,message?:string}>
    loading,
    error,
  } = useProfileStore((s) => s);

  // Normalize store shape: some responses use { success, data: {...} }
  const user = users?.data ?? users ?? null;

  const [fetching, setFetching] = useState(false);

  // Password form state
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdVisible, setPwdVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setFetching(true);
        await fetchProfiles();
      } catch {
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setFetching(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchProfiles]);

  // Avatar with one-time fallback (prevents request loops)
  const DEFAULT_AVATAR = "/images/avatar-default.png";
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  useEffect(() => {
    const next = user?.image_url || DEFAULT_AVATAR;
    setAvatarSrc(next);
  }, [user?.image_url]);

  // Display helpers based on your data model
  const displayName = user?.name ?? "—";
  const displayEmail = user?.email ?? "—";
  const displayPhone = user?.phone
    ? `${user?.countryCode ? user.countryCode + " " : ""}${user.phone}`
    : "—";
  const displayRole = user?.isAdmin
    ? "Administrator"
    : user?.role?.name || user?.designation || "—";
  const displayBranch =
    user?.branch?.name
      ? user?.branch?.location
        ? `${user.branch.name} • ${user.branch.location}`
        : user.branch.name
      : "—";

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : null;
  const updatedAt = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : null;

  const isManager = !!user?.isManager;
  const isHead = !!user?.isHead;
  const isAdmin = !!user?.isAdmin;

  const onPwdChange = (e) => {
    const { name, value } = e.target;
    setPwd((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    const { newPassword, confirmPassword } = pwd;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return false;
    }
    const hasLetter = /[A-Za-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    if (!hasLetter || !hasDigit) {
      toast.error("New password must include letters and numbers");
      return false;
    }
    return true;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setPwdSubmitting(true);
      const result = await updatePassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });

      if (result?.success) {
        toast.success("Password updated successfully");
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result?.message || "Failed to update password");
      }
    } catch {
      toast.error("Something went wrong while updating password");
    } finally {
      setPwdSubmitting(false);
    }
  };

  const isLoading = fetching || loading;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#034E81]">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          View your account details and change your password.
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Avatar + basic */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center md:items-start">
          <img
            src={avatarSrc}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-2 border-[#034E81] shadow mb-3 object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => {
              if (avatarSrc !== DEFAULT_AVATAR) setAvatarSrc(DEFAULT_AVATAR);
            }}
          />

          <div className="text-center md:text-left space-y-1">
            <div className="text-lg font-semibold text-[#034E81]">
              {displayName}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary role string */}
              <span className="text-sm text-gray-600">{displayRole}</span>

              {/* Flags as chips */}
              {isAdmin && (
                <span className="text-[10px] uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                  Admin
                </span>
              )}
              {isManager && (
                <span className="text-[10px] uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  Manager
                </span>
              )}
              {isHead && (
                <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  Head
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Details (read-only) */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={displayName}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role / Designation
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={displayRole}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={displayPhone}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    id="branch"
                    type="text"
                    value={displayBranch}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <input
                    id="status"
                    type="text"
                    value={user?.isActive ? "Active" : "Inactive"}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <input
                      type="text"
                      value={createdAt}
                      disabled
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                )}

                {updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <input
                      type="text"
                      value={updatedAt}
                      disabled
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 my-6" />

              {/* Change Password */}
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <h3 className="text-lg font-semibold text-[#034E81]">Change Password</h3>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={pwdVisible.current ? "text" : "password"}
                        value={pwd.currentPassword}
                        onChange={onPwdChange}
                        autoComplete="current-password"
                        required
                        className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPwdVisible((v) => ({ ...v, current: !v.current }))}
                        className="absolute inset-y-0 right-2 my-auto text-xs text-gray-500"
                        aria-label="Toggle current password visibility"
                      >
                        {pwdVisible.current ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={pwdVisible.next ? "text" : "password"}
                        value={pwd.newPassword}
                        onChange={onPwdChange}
                        autoComplete="new-password"
                        required
                        className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPwdVisible((v) => ({ ...v, next: !v.next }))}
                        className="absolute inset-y-0 right-2 my-auto text-xs text-gray-500"
                        aria-label="Toggle new password visibility"
                      >
                        {pwdVisible.next ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Min 8 chars, include letters & numbers.</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={pwdVisible.confirm ? "text" : "password"}
                        value={pwd.confirmPassword}
                        onChange={onPwdChange}
                        required
                        className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPwdVisible((v) => ({ ...v, confirm: !v.confirm }))}
                        className="absolute inset-y-0 right-2 my-auto text-xs text-gray-500"
                        aria-label="Toggle confirm password visibility"
                      >
                        {pwdVisible.confirm ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={pwdSubmitting}
                    className="inline-flex items-center justify-center px-4 py-2 rounded text-white bg-[#034E81] hover:bg-[#023b61] disabled:opacity-60"
                  >
                    {pwdSubmitting ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                    className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50"
                    disabled={pwdSubmitting}
                  >
                    Reset
                  </button>
                </div>
              </form>

              {error ? (
                <p className="mt-4 text-sm text-red-600">
                  {typeof error === "string" ? error : "An error occurred."}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
