import { useState } from "react";
import PermissionSelector from "../../components/roleManagement/permission/PermissionSelector";
import Button from "../../components/ui/Button";
import { useRoleStore } from "../../store/roleStore";

const modules = [
  "User Management",
  "Role Management",
  "Settings",
  "Investor",
  "Investment",
];

export default function RolePermissionForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addRole = useRoleStore((s) => s.addRole);

  const handlePermissionChange = (updatedPermissions) => {
    setForm((prev) => ({
      ...prev,
      permissions: updatedPermissions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Role name is required.");
      return;
    }

    setError("");
    setLoading(true);

    // Convert permissions like "User Management:view" → { label: "...", access: "..." }
    const formattedPermissions = form.permissions.map((entry) => {
      const [label, access] = entry.split(":");
      return {
        id:
          label.toLowerCase().replace(/\s+/g, "_") + "_" + access.toLowerCase(), // optional ID format
        label,
        access,
      };
    });

    const payload = {
      name: form.name,
      description: form.description || null,
      permissions: formattedPermissions,
    };

    try {
      await addRole(payload);
      setForm({ name: "", description: "", permissions: [] });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Role Name *"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
        </div>

        {modules.map((mod) => (
          <PermissionSelector
            key={mod}
            module={mod}
            permissions={form.permissions}
            onChange={handlePermissionChange}
          />
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="pt-4 flex justify-end">
          <Button
            className="w-25 h-8"
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </form>

      <div className="mt-4">
        <pre className="text-xs bg-gray-100 p-2 rounded dark:bg-gray-800 dark:text-white">
          {JSON.stringify(form?.permissions, null, 2)}
        </pre>
      </div>
    </>
  );
}
