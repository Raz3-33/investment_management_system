import { useState, useMemo, useEffect } from "react";
import DataTable from "../../ui/table/DataTable";
import Button from "../../ui/Button";
import PaginationControls from "../../ui/PaginationContrls";
import Modal from "../../ui/Modal/Modal";
import ToastNotification from "../../ui/ToastNotification.jsx";
import { useTerritoryStore } from "../../../store/territoryStore"; // NEW

const columns = [
  { key: "name", label: "Territory Name" },
  { key: "region", label: "Region" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function TerritoryManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", region: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");

  const {
    territories,
    territoryAdded,
    territoryUpdated,
    territoryDeleted,
    fetchTerritories,
    addTerritory,
    updateTerritory,
    deleteTerritory,
    loading,
  } = useTerritoryStore((s) => s);

  useEffect(() => {
    fetchTerritories();
  }, [fetchTerritories, territoryAdded, territoryUpdated, territoryDeleted]);

  useEffect(() => {
    if (territoryAdded) {
      setToastType("success");
      setToastMessage(`Territory added: ${territoryAdded.name}`);
      setShowToast(true);
    }
    if (territoryUpdated) {
      setToastType("success");
      setToastMessage(`Territory updated: ${territoryUpdated.name}`);
      setShowToast(true);
    }
    if (territoryDeleted) {
      setToastType("error");
      setToastMessage(`Territory deleted: ${territoryDeleted}`);
      setShowToast(true);
    }
  }, [territoryAdded, territoryUpdated, territoryDeleted]);

  // Basic form validation
  const validate = (data) => {
    const e = {};
    const name = (data.name || "").trim();
    const region = (data.region || "").trim();
    if (!name) e.name = "Name is required.";
    else if (name.length < 3) e.name = "Name must be at least 3 characters.";
    if (!region) e.region = "Region is required.";
    return e;
  };

  const handleCreateOrUpdate = async () => {
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        region: formData.region.trim(),
      };
      if (editMode) {
        await updateTerritory(editingId, payload);
      } else {
        await addTerritory(payload);
      }
      setFormData({ name: "", region: "" });
      setIsModalOpen(false);
      setEditMode(false);
    } catch (err) {
      setToastType("error");
      setToastMessage(err?.message || "Something went wrong. Please try again.");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTerritory(id);
    } catch (err) {
      setToastType("error");
      setToastMessage("Failed to delete the territory.");
      setShowToast(true);
    }
  };

  const filteredRows = useMemo(() => {
    if (!Array.isArray(territories)) return [];
    return territories.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.region?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [territories, search]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleEdit = (row) => {
    setEditMode(true);
    setEditingId(row.id);
    setIsModalOpen(true);
    setFormData({ name: row.name, region: row.region || "" });
    setErrors({});
  };

  return (
    <main className="grow">
      <ToastNotification
        type={toastType}
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", region: "" });
              setErrors({});
              setIsModalOpen(true);
            }}
          >
            Create Territory
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
        title={editMode ? "Edit Territory" : "Create Territory"}
      >
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Territory Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Region"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className={`border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white ${
                errors.region ? "border-red-500" : ""
              }`}
            />
            {errors.region && (
              <p className="text-red-500 text-sm mt-1">{errors.region}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleCreateOrUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
