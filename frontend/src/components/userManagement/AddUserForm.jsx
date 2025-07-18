import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useUserStore } from "../../store/userStore";
import { useRoleStore } from "../../store/roleStore";
import { useBranchStore } from "../../store/branchStore";

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    branchId: "",
  });

  const { addUser } = useUserStore((state) => state);

  const { branches, fetchBranches } = useBranchStore((state) => state);

  const { roles, fetchRoles } = useRoleStore((s) => s);

  // Fetch roles when actions are performed
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Fetch branches when actions are performed
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUser(formData);
      setFormData({
        name: "",
        email: "",
        password: "",
        roleId: "",
        branchId: "",
      });
    } catch (err) {
      console.error("Failed to add user", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />
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
      <Button type="submit">Add User</Button>
    </form>
  );
}
