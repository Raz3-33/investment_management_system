import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import Button from "../ui/Button";

export default function EditUserForm() {
  const { userId } = useParams();
  const { users, updateUser, fetchUsers } = useUserStore((state) => state); // Access store methods and data

  const user = users.find((user) => user.id === userId); // Find the user by ID

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    roleId: user?.roleId || "",
    branchId: user?.branchId || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        branchId: user.branchId,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(userId, formData);
    } catch (err) {
      console.error("Failed to update user", err);
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
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <Button type="submit">Update User</Button>
    </form>
  );
}
