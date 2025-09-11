import { useEffect, useState } from "react";
import CountryList from "country-list-with-dial-code-and-flag";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";
import Modal from "../ui/Modal/Modal";

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    branchId: "",
    roleId: "",
    designation: "",
    userLevel: "ASSOCIATE", // ADMINISTRATE | HEAD | MANAGER | EXECUTIVE | ASSOCIATE
    administrateId: "",
    headId: "",
    managerId: "",
    // NEW:
    executiveIds: [], // multi-select
    // (legacy single kept only for API fallback — we won't use it in UI)
    executiveId: "",
    password: "",
    confirmPassword: "",
  });

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [errorValidation, setErrorValidation] = useState("");
  const [countries, setCountries] = useState([]);

  const { addUser, error, userAdd, users, fetchUsers } = useUserStore((s) => s);
  const { branches, fetchBranches, addBranch } = useBranchStore((s) => s);
  const { roles, fetchRoles } = useRoleStore((s) => s);

  const LEVEL = {
    ADMINISTRATE: "ADMINISTRATE",
    HEAD: "HEAD",
    MANAGER: "MANAGER",
    EXECUTIVE: "EXECUTIVE",
    ASSOCIATE: "ASSOCIATE",
  };

  // group users by level
  const usersByLevel = {
    ADMINISTRATE: users?.filter((u) => u.userLevel === LEVEL.ADMINISTRATE) ?? [],
    HEAD:         users?.filter((u) => u.userLevel === LEVEL.HEAD) ?? [],
    MANAGER:      users?.filter((u) => u.userLevel === LEVEL.MANAGER) ?? [],
    EXECUTIVE:    users?.filter((u) => u.userLevel === LEVEL.EXECUTIVE) ?? [],
    ASSOCIATE:    users?.filter((u) => u.userLevel === LEVEL.ASSOCIATE) ?? [],
  };

  // visibility flags
  const showAdministrate = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER, LEVEL.HEAD].includes(formData.userLevel);
  const showHead         = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER].includes(formData.userLevel);
  const showManager      = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE].includes(formData.userLevel);
  const showExecutive    = [LEVEL.ASSOCIATE].includes(formData.userLevel);

  // cascading filters
  const filteredHeads = showHead
    ? (formData.administrateId
        ? usersByLevel.HEAD.filter(h => h.administrateId === formData.administrateId)
        : usersByLevel.HEAD)
    : [];

  const filteredManagers = showManager
    ? (formData.headId
        ? usersByLevel.MANAGER.filter(m => m.headId === formData.headId)
        : (formData.administrateId
            ? usersByLevel.MANAGER.filter(m => m.headId && filteredHeads.some(h => h.id === m.headId))
            : usersByLevel.MANAGER))
    : [];

  const filteredExecutives = showExecutive
    ? (formData.managerId
        ? usersByLevel.EXECUTIVE.filter(e => e.managerId === formData.managerId)
        : (formData.headId
            ? usersByLevel.EXECUTIVE.filter(e =>
                e.managerId && filteredManagers.some(m => m.id === e.managerId)
              )
            : (formData.administrateId
                ? usersByLevel.EXECUTIVE.filter(e =>
                    e.managerId && usersByLevel.MANAGER.some(m =>
                      m.id === e.managerId && filteredManagers.some(fm => fm.id === m.id)
                    )
                  )
                : usersByLevel.EXECUTIVE)))
    : [];

  // level change: recompute visibility + clear incompatible upstream ids
  const onLevelChange = (level) => {
    const nextShowAdministrate = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER, LEVEL.HEAD].includes(level);
    const nextShowHead         = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE, LEVEL.MANAGER].includes(level);
    const nextShowManager      = [LEVEL.ASSOCIATE, LEVEL.EXECUTIVE].includes(level);
    const nextShowExecutive    = [LEVEL.ASSOCIATE].includes(level);

    setFormData((prev) => ({
      ...prev,
      userLevel: level,
      administrateId: nextShowAdministrate ? prev.administrateId : "",
      headId:         nextShowHead ? prev.headId : "",
      managerId:      nextShowManager ? prev.managerId : "",
      executiveIds:   nextShowExecutive ? (prev.executiveIds ?? []) : [],
    }));
  };

  // country list, roles, branches, users
  useEffect(() => { setCountries(CountryList.getAll()); }, []);
  useEffect(() => { if (error) setErrorValidation(error); }, [error]);
  useEffect(() => { fetchRoles(); fetchBranches(); fetchUsers(); }, [fetchRoles, fetchBranches, fetchUsers, userAdd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.branchId || !formData.roleId) {
      setErrorValidation("Please fill all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorValidation("Passwords do not match.");
      return;
    }

    // Client-side guard for nearest supervisor
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

    try {
      // Legacy fallback: send single executiveId as the first selected (if backend still reads it)
      const firstExecutiveId = formData.executiveIds?.[0] ?? null;

      await addUser({
        ...formData,
        administrateId: formData.administrateId || null,
        headId:         formData.headId || null,
        managerId:      formData.managerId || null,

        // NEW multi-select field:
        executiveIds:   formData.executiveIds ?? [],

        // legacy single (safe fallback, backend can ignore):
        executiveId:    firstExecutiveId,

        // legacy flags (kept for compatibility)
        isHead:   formData.userLevel === "HEAD",
        isManager:formData.userLevel === "MANAGER",
        isAdmin:  formData.userLevel === "ADMINISTRATE",
        userType: undefined,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        countryCode: "+91",
        branchId: "",
        roleId: "",
        designation: "",
        userLevel: "ASSOCIATE",
        administrateId: "",
        headId: "",
        managerId: "",
        executiveIds: [],
        executiveId: "",
        password: "",
        confirmPassword: "",
      });
      setErrorValidation("");
    } catch (err) {
      setErrorValidation("Failed to add user: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Phone (Country Code + Phone) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Phone</label>
            <div className="grid grid-cols-12 gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="col-span-3 sm:col-span-2 md:col-span-4 border px-3 py-2 rounded-md"
              >
                <option value="">Code</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.dial_code}>
                    {c.flag || c.code} {c.name} ({c.dial_code})
                  </option>
                ))}
              </select>

              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-7 sm:col-span-8 md:col-span-8 border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Branch */}
          <select
            value={formData.branchId}
            onChange={(e) => {
              if (e.target.value === "add_new") { setIsBranchModalOpen(true); return; }
              setFormData({ ...formData, branchId: e.target.value });
            }}
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Branch</option>
            {branches?.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
            <option value="add_new" className="text-blue-600 font-semibold">➕ Add New Branch</option>
          </select>

          {/* Role */}
          <select
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Role</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>

          {/* Designation */}
          <input
            type="text"
            placeholder="Designation (Optional)"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          />

          {/* Level */}
          <select
            value={formData.userLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="md:col-span-2 border px-3 py-2 rounded-md w-full"
          >
            <option value="ADMINISTRATE">Administrate</option>
            <option value="HEAD">Head</option>
            <option value="MANAGER">Manager</option>
            <option value="EXECUTIVE">Executive</option>
            <option value="ASSOCIATE">Associate</option>
          </select>

          {/* Administrate (parent of Head) */}
          {showAdministrate && (
            <select
              value={formData.administrateId}
              onChange={(e) => {
                const administrateId = e.target.value;
                setFormData(prev => ({ ...prev, administrateId, headId: "", managerId: "", executiveIds: [] }));
              }}
              className="md:col-span-2 border px-3 py-2 rounded-md w-full"
            >
              <option value="">Select Administrate</option>
              {usersByLevel.ADMINISTRATE.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          {/* Head (filtered by Administrate) */}
          {showHead && (
            <select
              value={formData.headId}
              onChange={(e) => {
                const headId = e.target.value;
                setFormData(prev => ({ ...prev, headId, managerId: "", executiveIds: [] }));
              }}
              disabled={!formData.administrateId}
              className="md:col-span-2 border px-3 py-2 rounded-md w-full disabled:bg-gray-100"
            >
              <option value="">{formData.administrateId ? "Select Head" : "Select Administrate first"}</option>
              {filteredHeads.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          {/* Manager (filtered by Head) */}
          {showManager && (
            <select
              value={formData.managerId}
              onChange={(e) => {
                const managerId = e.target.value;
                setFormData(prev => ({ ...prev, managerId, executiveIds: [] }));
              }}
              disabled={!formData.headId}
              className="md:col-span-2 border px-3 py-2 rounded-md w-full disabled:bg-gray-100"
            >
              <option value="">{formData.headId ? "Select Manager" : "Select Head first"}</option>
              {filteredManagers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          {/* Executive (filtered by Manager) — MULTI SELECT */}
          {showExecutive && (
            <select
              multiple
              value={formData.executiveIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                setFormData({ ...formData, executiveIds: selected });
              }}
              disabled={!formData.managerId}
              className="md:col-span-2 border px-3 py-2 rounded-md w-full disabled:bg-gray-100 h-40"
            >
              <option value="" disabled>{formData.managerId ? "Select Executive(s)" : "Select Manager first"}</option>
              {filteredExecutives.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 transition duration-300 w-40 h-11">
            Add User
          </Button>
        </div>
      </form>

      {/* Create Branch Modal */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Create Branch"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Branch Name"
            value={formData.branchName || ""}
            onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.branchLocation || ""}
            onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={async () => {
                if (!formData.branchName || !formData.branchLocation) {
                  setErrorValidation("Branch name and location are required.");
                  return;
                }

                try {
                  const newBranch = await addBranch({
                    name: formData.branchName,
                    location: formData.branchLocation,
                  });

                  await fetchBranches();

                  setFormData((prev) => ({
                    ...prev,
                    branchId: newBranch?.id || prev.branchId,
                    branchName: "",
                    branchLocation: "",
                  }));

                  setIsBranchModalOpen(false);
                } catch (err) {
                  setErrorValidation("Failed to add branch: " + (err?.message || "Unknown error"));
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
