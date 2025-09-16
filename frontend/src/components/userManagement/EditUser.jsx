import { useEffect, useMemo, useState } from "react";
import CountryList from "country-list-with-dial-code-and-flag";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";

export default function EditUserForm({ userId, onClose }) {
  const { updateUser, getUserById, users, fetchUsers, error } = useUserStore((s) => s);
  const { branches, fetchBranches } = useBranchStore((s) => s);
  const { roles, fetchRoles } = useRoleStore((s) => s);

  const LEVEL = {
    ADMINISTRATE: "ADMINISTRATE",
    HEAD: "HEAD",
    MANAGER: "MANAGER",
    EXECUTIVE: "EXECUTIVE",
    ASSOCIATE: "ASSOCIATE",
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    branchId: "",
    roleId: "",
    designation: "",
    // hierarchy
    userLevel: "ASSOCIATE",
    administrateId: "",
    headId: "",
    managerId: "",
    // NEW multi-exec
    executiveIds: [],
    // legacy single kept only as backend fallback (not used in UI)
    executiveId: "",
  });

  // password (optional change)
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [errorValidation, setErrorValidation] = useState("");
  const [countries, setCountries] = useState([]);

  // ----- helpers -----
  const deriveLevelFromUser = (u) => {
    if (u?.userLevel) return u.userLevel;
    if (u?.isAdmin) return LEVEL.ADMINISTRATE;
    if (u?.isHead) return LEVEL.HEAD;
    if (u?.isManager) return LEVEL.MANAGER;
    return LEVEL.ASSOCIATE;
  };

  const usersByLevel = useMemo(
    () => ({
      ADMINISTRATE: users?.filter((u) => u.userLevel === LEVEL.ADMINISTRATE) ?? [],
      HEAD: users?.filter((u) => u.userLevel === LEVEL.HEAD) ?? [],
      MANAGER: users?.filter((u) => u.userLevel === LEVEL.MANAGER) ?? [],
      EXECUTIVE: users?.filter((u) => u.userLevel === LEVEL.EXECUTIVE) ?? [],
      ASSOCIATE: users?.filter((u) => u.userLevel === LEVEL.ASSOCIATE) ?? [],
    }),
    [users]
  );

  // visibility flags based on level
  const visibilityFromLevel = (level) => ({
    showAdministrate: [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER, LEVEL.HEAD].includes(level),
    showHead: [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER].includes(level),
    showManager: [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE].includes(level),
    showExecutive: [LEVEL.ASSOCIATE].includes(level),
  });

  const { showAdministrate, showHead, showManager, showExecutive } = visibilityFromLevel(formData.userLevel);

  // cascading filters (same as AddUserForm)
  const filteredHeads = showHead
    ? (formData.administrateId
        ? usersByLevel.HEAD.filter((h) => h.administrateId === formData.administrateId)
        : usersByLevel.HEAD)
    : [];

  const filteredManagers = showManager
    ? (formData.headId
        ? usersByLevel.MANAGER.filter((m) => m.headId === formData.headId)
        : (formData.administrateId
            ? usersByLevel.MANAGER.filter((m) => m.headId && filteredHeads.some((h) => h.id === m.headId))
            : usersByLevel.MANAGER))
    : [];

  const filteredExecutives = showExecutive
    ? (formData.managerId
        ? usersByLevel.EXECUTIVE.filter((e) => e.managerId === formData.managerId)
        : (formData.headId
            ? usersByLevel.EXECUTIVE.filter((e) =>
                e.managerId && filteredManagers.some((m) => m.id === e.managerId)
              )
            : (formData.administrateId
                ? usersByLevel.EXECUTIVE.filter((e) =>
                    e.managerId && usersByLevel.MANAGER.some((m) =>
                      m.id === e.managerId && filteredManagers.some((fm) => fm.id === m.id)
                    )
                  )
                : usersByLevel.EXECUTIVE)))
    : [];

  // level change: recompute visibility + clear incompatible upstream ids
  const onLevelChange = (level) => {
    const v = visibilityFromLevel(level);
    setFormData((prev) => ({
      ...prev,
      userLevel: level,
      administrateId: v.showAdministrate ? prev.administrateId : "",
      headId: v.showHead ? prev.headId : "",
      managerId: v.showManager ? prev.managerId : "",
      executiveIds: v.showExecutive ? (prev.executiveIds ?? []) : [],
    }));
  };

  // ----- effects -----
  useEffect(() => { setCountries(CountryList.getAll()); }, []);

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchUsers();
  }, [fetchRoles, fetchBranches, fetchUsers]);

  // Load user
  useEffect(() => {
    if (!userId) return;
    const u = getUserById(userId);
    if (!u) return;

    // Pull current executive assignments if present in the user object
    // Prefer `myExecutives` (array of assignments with executiveId), fallback to legacy single `executiveId`
    const existingExecIds = Array.from(
      new Set([
        ...((u.myExecutives?.map?.((ea) => ea.executiveId)) || []),
        ...(u.executiveId ? [u.executiveId] : []),
      ].filter(Boolean))
    );

    console.log(u,"uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
    

    setFormData({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      countryCode: u.countryCode || "+91",
      branchId: u.branchId || "",
      roleId: u.roleId || "",
      designation: u.designation || "",
      userLevel: deriveLevelFromUser(u),
      administrateId: u.administrateId || "",
      headId: u.headId || "",
      managerId: u.managerId || "",
      executiveIds: existingExecIds,
      executiveId: existingExecIds[0] || "",
    });
  }, [userId, getUserById]);

  useEffect(() => { if (error) setErrorValidation(error); }, [error]);

  // ----- submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.branchId || !formData.roleId) {
      setErrorValidation("Please fill all required fields.");
      return;
    }

    // nearest supervisor client-side enforcement
    if (formData.userLevel === LEVEL.ASSOCIATE && (!formData.executiveIds || formData.executiveIds.length === 0)) {
      setErrorValidation("Please select at least one Executive for this Associate.");
      return;
    }
    if (formData.userLevel === LEVEL.EXECUTIVE && !formData.managerId) {
      setErrorValidation("Please select a Manager for this Executive.");
      return;
    }
    if (formData.userLevel === LEVEL.MANAGER && !formData.headId) {
      setErrorValidation("Please select a Head for this Manager.");
      return;
    }
    if (formData.userLevel === LEVEL.HEAD && !formData.administrateId) {
      setErrorValidation("Please select an Administrate for this Head.");
      return;
    }

    // password validation (only if attempting to change)
    if (newPassword || confirmNewPassword) {
      if (!newPassword || !confirmNewPassword) {
        setErrorValidation("Please enter both password fields.");
        return;
      }
      if (newPassword.length < 5) {
        setErrorValidation("Password must be at least 5 characters long.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorValidation("Passwords do not match.");
        return;
      }
    }

    try {
      const firstExecutiveId = formData.executiveIds?.[0] ?? null; // legacy fallback only

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        roleId: formData.roleId,
        branchId: formData.branchId,
        designation: formData.designation,

        // hierarchy
        userLevel: formData.userLevel,
        administrateId: formData.administrateId || null,
        headId: formData.headId || null,
        managerId: formData.managerId || null,

        // NEW multi
        executiveIds: formData.executiveIds || [],
        // legacy single (backend may ignore)
        executiveId: firstExecutiveId,

        // optional password
        ...(newPassword ? { password: newPassword } : {}),
      };

      await updateUser(userId, payload);
      setErrorValidation("");
      setNewPassword("");
      setConfirmNewPassword("");
      onClose?.();
    } catch (err) {
      setErrorValidation("Failed to update user: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

      <h3 className="font-semibold text-gray-700 border-b pb-1">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        <select
          value={formData.countryCode}
          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
          className="border px-3 py-2 rounded-md"
        >
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.dial_code}>
              {c.flag || c.code} {c.name} ({c.dial_code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="border px-3 py-2 rounded-md col-span-2 md:col-span-3"
        />
      </div>

      <h3 className="font-semibold text-gray-700 border-b pb-1">Work Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={formData.branchId}
          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Branch</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Role</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Designation (Optional)"
        value={formData.designation}
        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Level & hierarchy */}
      <h3 className="font-semibold text-gray-700 border-b pb-1">Hierarchy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={formData.userLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value={LEVEL.ADMINISTRATE}>Administrate</option>
          <option value={LEVEL.HEAD}>Head</option>
          <option value={LEVEL.MANAGER}>Manager</option>
          <option value={LEVEL.EXECUTIVE}>Executive</option>
          <option value={LEVEL.ASSOCIATE}>Associate</option>
        </select>

        {/* Administrate */}
        {showAdministrate && (
          <select
            value={formData.administrateId}
            onChange={(e) => {
              const administrateId = e.target.value;
              setFormData((prev) => ({ ...prev, administrateId, headId: "", managerId: "", executiveIds: [] }));
            }}
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Administrate</option>
            {usersByLevel.ADMINISTRATE.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {/* Head (filtered) */}
        {showHead && (
          <select
            value={formData.headId}
            onChange={(e) => {
              const headId = e.target.value;
              setFormData((prev) => ({ ...prev, headId, managerId: "", executiveIds: [] }));
            }}
            disabled={!formData.administrateId}
            className="border px-3 py-2 rounded-md w-full disabled:bg-gray-100"
          >
            <option value="">{formData.administrateId ? "Select Head" : "Select Administrate first"}</option>
            {filteredHeads.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {/* Manager (filtered) */}
        {showManager && (
          <select
            value={formData.managerId}
            onChange={(e) => {
              const managerId = e.target.value;
              setFormData((prev) => ({ ...prev, managerId, executiveIds: [] }));
            }}
            disabled={!formData.headId}
            className="border px-3 py-2 rounded-md w-full disabled:bg-gray-100"
          >
            <option value="">{formData.headId ? "Select Manager" : "Select Head first"}</option>
            {filteredManagers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {/* Executives (multi) */}
        {showExecutive && (
          <select
            multiple
            value={formData.executiveIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
              setFormData({ ...formData, executiveIds: selected });
            }}
            disabled={!formData.managerId}
            className="border px-3 py-2 rounded-md w-full disabled:bg-gray-100 h-40"
          >
            <option value="" disabled>
              {formData.managerId ? "Select Executive(s)" : "Select Manager first"}
            </option>
            {filteredExecutives.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Change Password (optional) */}
      <h3 className="font-semibold text-gray-700 border-b pb-1">
        Change Password <span className="text-xs text-gray-500">(optional)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border px-3 py-2 rounded-md w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
          >
            {showNewPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmNewPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="border px-3 py-2 rounded-md w-full pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmNewPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
          >
            {showConfirmNewPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">Leave password fields blank to keep the current password unchanged.</p>

      <div className="flex justify-center mt-4">
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md">
          Update User
        </Button>
      </div>
    </form>
  );
}
