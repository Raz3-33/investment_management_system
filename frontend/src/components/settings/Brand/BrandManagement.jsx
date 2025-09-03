// src/components/settings/brand/BrandManagement.jsx

import { useEffect, useMemo, useState } from "react";
import DataTable from "../../ui/table/DataTable";
import Button from "../../ui/Button";
import PaginationControls from "../../ui/PaginationContrls";
import Modal from "../../ui/Modal/Modal";
import ToastNotification from "../../ui/ToastNotification.jsx";
import { useBrandStore } from "../../../store/useBrandStore.js";

const columns = [
  { key: "name", label: "Brand Name" },
//   { key: "slug", label: "Slug" },
  { key: "isActive", label: "Status" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function BrandManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    // slug: "",
    description: "",
    // logoUrl: "",
    isActive: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");

  const {
    brands,
    brandAdded,
    brandUpdated,
    brandDeleted,
    fetchBrands,
    addBrand,
    updateBrand,
    deleteBrand,
    loading,
  } = useBrandStore((s) => s);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands, brandAdded, brandUpdated, brandDeleted]);

  useEffect(() => {
    if (brandAdded) {
      setToastType("success");
      setToastMessage(`Brand added: ${brandAdded.name}`);
      setShowToast(true);
    }
    if (brandUpdated) {
      setToastType("success");
      setToastMessage(`Brand updated: ${brandUpdated.name}`);
      setShowToast(true);
    }
    if (brandDeleted) {
      setToastType("error");
      setToastMessage(`Brand deleted: ${brandDeleted}`);
      setShowToast(true);
    }
  }, [brandAdded, brandUpdated, brandDeleted]);

  const filteredRows = useMemo(() => {
    if (!Array.isArray(brands)) return [];
    return brands.filter((row) => {
      const q = search.toLowerCase();
      return (
        (row?.name?.toLowerCase() || "").includes(q)
      );
    });
  }, [brands, search]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleEdit = (brand) => {
    setEditMode(true);
    setEditingId(brand.id);
    setIsModalOpen(true);
    setFormData({
      name: brand.name ?? "",
    //   slug: brand.slug ?? "",
      description: brand.description ?? "",
    //   logoUrl: brand.logoUrl ?? "",
      isActive: !!brand.isActive,
    });
  };

  const handleCreateOrUpdate = async () => {
    if (!formData?.name) {
      setError("Name is required.");
      return;
    }
    setError(null);
    const payload = {
      name: formData.name.trim(),
    //   slug: formData.slug.trim().toLowerCase(),
      description: formData.description?.trim() || "",
    //   logoUrl: formData.logoUrl?.trim() || "",
      isActive: !!formData.isActive,
    };
    if (editMode) {
      await updateBrand(editingId, payload);
    } else {
      await addBrand(payload);
    }
    setFormData({ name: "", description: "", isActive: true });
    setIsModalOpen(false);
    setEditMode(false);
  };

  const handleDelete = async (id) => {
    await deleteBrand(id);
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
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: "", description: "", isActive: true });
              setIsModalOpen(true);
            }}
          >
            Create Brand
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={paginatedRows.map((r) => ({
                ...r,
                isActive: r.isActive ? "Active" : "Inactive",
              }))}
              renderActions={(row) => (
                <>
                  <Button variant="primary" onClick={() => handleEdit(row)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
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
        title={editMode ? "Edit Brand" : "Create Brand"}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
        
          
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            rows={4}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((s) => ({ ...s, isActive: e.target.checked }))}
            />
            <span className="text-sm">Active</span>
          </label>

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
