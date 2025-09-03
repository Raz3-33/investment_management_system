import { useState, useMemo, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/Modal/Modal.jsx";
import EditUserForm from "../../components/userManagement/EditUser";
import AddUserForm from "../../components/userManagement/AddUserForm";

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
  const [rowsPerPage] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const { users, fetchUsers, loading, deleteUser, userEdit } = useUserStore(
    (state) => state
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, userEdit]);

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  const filteredRows = useMemo(() => {
    return users?.filter(
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
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
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
                    onClick={() => {
                      setEditMode(true);
                      setEditingUserId(row.id);
                      setIsModalOpen(true);
                    }}
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
        title={editMode ? "Edit User" : "Add New User"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditUserForm
              userId={editingUserId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddUserForm />
          )}
        </div>
      </Modal>
    </main>
  );
}
