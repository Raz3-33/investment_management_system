import { useState, useMemo, useEffect } from "react";
import DataTable from "../../components/ui/table/DataTable";
import Button from "../../components/ui/Button";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/modal/Modal";
import PermissionSelector from "../../components/roleManagement/permission/PermissionSelector";
import { useRoleStore } from "../../store/roleStore";

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions", isAction: true },
];

const defaultModules = [
  "User Management",
  "Role Management",
  "Settings",
  "Investor",
  "Investment",
];

const defaultActions = ["View", "Update", "Delete", "Approve"];

function handleActions(row, onEdit) {
  return (
    <div className="flex space-x-2">
      <Button variant="primary" onClick={() => onEdit(row)}>
        Edit
      </Button>
      <Button variant="danger" onClick={() => alert(`Delete ${row.name}`)}>
        Delete
      </Button>
    </div>
  );
}

export default function RoleManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [error, setError] = useState(null);

  const {
    roles,
    fetchRoles,
    addRole,
    updateRole,
    loading,
    fetchRoleDetail,
    loadingRoleDetail,
    roleDetail,
  } = useRoleStore((s) => s);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateOrUpdate = async () => {
    if (!formData?.name) {
      setError("Name is required.");
      return;
    }
    setError(null);
    try {
      if (editMode) {
        await updateRole(editingRoleId, formData); // If in edit mode, update the role
        console.log(formData, "formDataformDataformDataformDataformData");
      } else {
        await addRole(formData); // If new role, create the role
      }
      setFormData({ name: "", description: "", permissions: [] });
      setIsModalOpen(false);
      setEditMode(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    console.log(
      roleDetail,
      "roleDetailroleDetailroleDetailroleDetailroleDetailroleDetail"
    );

    if (!editMode || !roleDetail?.permissions) return;
    // Mapping the permissions based on permission name (name:access)
    const formattedPermissions = roleDetail.permissions.map((rp) => {
      const name = rp.permission?.name || ""; // Permission name
      // const access = rp.access || ""; // Access (e.g., "view", "approve")
      return `${name}`; // Use the name and access to create the key
    });

    setFormData({
      name: roleDetail?.name || "",
      description: roleDetail.description || "",
      permissions: formattedPermissions,
    });
  }, [roleDetail, editMode]);

  const handleEdit = async (role) => {
    setEditMode(true);
    setEditingRoleId(role.id);
    setIsModalOpen(true);

    try {
      await fetchRoleDetail(role.id);
    } catch (err) {
      setError("Failed to load role details.");
    }
  };

  const filteredRows = useMemo(() => {
    return roles.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.description?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [search, roles]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            variant="primary"
            className="w-25 h-8"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", description: "", permissions: [] });
              setIsModalOpen(true);
            }}
          >
            Create Role
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={paginatedRows}
              renderActions={(row) => handleActions(row, handleEdit)}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Role" : "Create New Role"}
      >
        <div className="space-y-4">
          {loadingRoleDetail ? (
            <p className="text-gray-500">Loading role details...</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
              />

              {defaultModules.map((module) => (
                <PermissionSelector
                  key={module}
                  module={module}
                  permissions={formData.permissions}
                  onChange={(newPerms) =>
                    setFormData({ ...formData, permissions: newPerms })
                  }
                  actions={defaultActions}
                />
              ))}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleCreateOrUpdate}>
              {editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
