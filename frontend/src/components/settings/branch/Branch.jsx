import { useState, useMemo, useEffect } from "react";
import DataTable from "../../ui/table/DataTable";
import Button from "../../ui/Button";
import PaginationControls from "../../ui/PaginationContrls";
import Modal from "../../ui/Modal/Modal";
import { useBranchStore } from "../../../store/branchStore";
import ToastNotification from "../../ui/ToastNotification.jsx";

const columns = [
  { key: "name", label: "Branch Name" },
  { key: "location", label: "Location" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function BranchManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [error, setError] = useState(null);

  // State for showing toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");

  const {
    branches,
    branchAdded,
    branchUpdated,
    branchDeleted,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    loading,
  } = useBranchStore((state) => state);

  // Fetch branches when actions are performed
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches, branchAdded, branchUpdated, branchDeleted]);

  // UseEffect to display toast notifications for add, update, and delete actions
  useEffect(() => {
    if (branchAdded) {
      setToastType("success");
      setToastMessage(`Branch added: ${branchAdded.name}`);
      setShowToast(true);
    }

    if (branchUpdated) {
      setToastType("success");
      setToastMessage(`Branch updated: ${branchUpdated.name}`);
      setShowToast(true);
    }

    if (branchDeleted) {
      setToastType("error");
      setToastMessage(`Branch deleted: ${branchDeleted}`);
      setShowToast(true);
    }
  }, [branchAdded, branchUpdated, branchDeleted]);

  const handleCreateOrUpdate = async () => {
    if (!formData?.name || !formData?.location) {
      setError("Name and Location are required.");
      return;
    }
    setError(null);
    try {
      if (editMode) {
        await updateBranch(editingBranchId, formData); // If in edit mode, update the branch
      } else {
        await addBranch(formData); // If new branch, create the branch
      }
      setFormData({ name: "", location: "" });
      setIsModalOpen(false);
      setEditMode(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (branchId) => {
    try {
      await deleteBranch(branchId);
    } catch (err) {
      setError("Failed to delete the branch.");
    }
  };

  // Ensure that filteredRows is always an array
  const filteredRows = useMemo(() => {
    if (!Array.isArray(branches)) {
      return []; // If branches isn't an array, return an empty array
    }

    return branches.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.location?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [branches, search]); // Ensure this depends on branches and search

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleEdit = (branch) => {
    setEditMode(true);
    setEditingBranchId(branch.id);
    setIsModalOpen(true);
    setFormData({
      name: branch.name,
      location: branch.location,
    });
  };

  return (
    <main className="grow">
      {/* Render Toast Notification */}
      <ToastNotification
        type={toastType}
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)} // Hide toast after it closes
      />
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", location: "" });
              setIsModalOpen(true);
            }}
          >
            Create Branch
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
                  <Button variant="primary" onClick={() => handleEdit(row)}>
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
        title={editMode ? "Edit Branch" : "Create Branch"}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Branch Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button className ="w-full h-10" variant="primary" onClick={handleCreateOrUpdate}>
              {editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
