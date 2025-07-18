import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";

export default function EditUserForm({ userId, closeModal }) {
  const { users, updateUser } = useUserStore((state) => state);
  const { roles, fetchRoles } = useRoleStore((state) => state);
  const { branches, fetchBranches } = useBranchStore((state) => state);

  const user = users.find((user) => user.id === userId);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    roleId: user?.roleId || "",
    branchId: user?.branchId || "",
  });

  const [error, setError] = useState("");

  // Fetch roles and branches
  useEffect(() => {
    fetchRoles();
    fetchBranches();
  }, [fetchRoles, fetchBranches]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (
      !formData?.name ||
      !formData?.email ||
      !formData?.roleId ||
      !formData?.branchId
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      await updateUser(userId, formData);
      closeModal(); // Close modal after successful update
    } catch (err) {
      setError("Failed to update user: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <input
          type="password"
          placeholder="Password (Leave blank to keep current)"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        /> */}
        <select
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <select
          value={formData.branchId}
          onChange={(e) =>
            setFormData({ ...formData, branchId: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
      {/* </div> */}
      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update User
        </Button>
      </div>
    </form>
  );
}
