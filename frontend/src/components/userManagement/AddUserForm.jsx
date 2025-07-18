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

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  const { addUser, error,userAdd } = useUserStore((state) => state);
  const { branches, fetchBranches } = useBranchStore((state) => state);
  const { roles, fetchRoles } = useRoleStore((s) => s);

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);
  // Fetch roles when component mounts or on updates
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles,userAdd]);

  // Fetch branches when component mounts or on updates
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches,userAdd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (
      !formData?.name ||
      !formData?.email ||
      !formData?.password ||
      !formData?.roleId ||
      !formData?.branchId
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    try {
      // Call the store's addUser function, which will send data to the backend
      await addUser(formData);

      // Reset form data after successful submission
      setFormData({
        name: "",
        email: "",
        password: "",
        roleId: "",
        branchId: "",
      });
      setErrorValidation(""); // Clear any previous errors
    } catch (err) {
      // Show error if there's an issue with user creation
      setErrorValidation("Failed to add user: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}
      {/* First row with two inputs side-by-side */}
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

      {/* Second row with password and role selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
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
      </div>

      {/* Third row with branch selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={formData.branchId}
          onChange={(e) =>
            setFormData({ ...formData, branchId: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Branch</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700 transition duration-300 w-8 h-8 md:w-auto"
        >
          Add User
        </Button>
      </div>
    </form>
  );
}
