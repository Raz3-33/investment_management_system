// Updated RoleManagement.jsx with permissions editing and modal integration
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../components/ui/table/DataTable";
import Button from "../../components/ui/Button";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/Modal/Modal";
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
  const [formData, setFormData] = useState({ name: "", description: "", permissions: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const roles = useRoleStore((s) => s.roles);
  const fetchRoles = useRoleStore((s) => s.fetchRoles);
  const addRole = useRoleStore((s) => s.addRole);
  const loading = useRoleStore((s) => s.loading);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateOrUpdate = async () => {
    if (!formData.name) {
      setError("Name is required.");
      return;
    }
    setError(null);
    try {
      await addRole(formData); // should handle both create and update based on backend
      setFormData({ name: "", description: "", permissions: [] });
      setIsModalOpen(false);
      setEditMode(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleEdit = (role) => {
    const formattedPermissions = role.permissions.map((p) => `${p.permission.name}:${p.access.toLowerCase()}`);
    setFormData({ name: role.name, description: role.description || "", permissions: formattedPermissions });
    setEditingRoleId(role.id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const filteredRows = useMemo(() => {
    return roles.filter((row) =>
      (row.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (row.description?.toLowerCase() || "").includes(search.toLowerCase())
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
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
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />

          {defaultModules.map((module) => (
            <PermissionSelector
              key={module}
              module={module}
              permissions={formData.permissions}
              onChange={(newPerms) => setFormData({ ...formData, permissions: newPerms })}
              actions={defaultActions}
            />
          ))}

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
