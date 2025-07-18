import { useState, useEffect, useMemo } from "react";
// Import your user store
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import DataTable from "../../components/ui/table/DataTable";
import Button from "../../components/ui/Button";
import PaginationControls from "../../components/ui/PaginationContrls";
import AddUserForm from "../../components/userManagement/AddUserForm";
import Modal from "../../components/ui/modal/Modal";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "branch", label: "Branch" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 0,
    branchId: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [error, setError] = useState(null);

  const { users, fetchUsers, loading, deleteUser } = useUserStore(
    (state) => state
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  const filteredRows = useMemo(() => {
    return users.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.email?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [search, users]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const navigate = useNavigate();

  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", description: "", permissions: [] });
              setIsModalOpen(true);
            }}
          >
            Add User
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
              renderActions={(row) => (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/edit-user/${row.id}`)}
                  >
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(row.id)}>
                    Delete
                  </Button>
                </>
              )}
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
          {false ? (
            <p className="text-gray-500">Loading role details...</p>
          ) : (
            <AddUserForm />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => alert()}>
              {editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
