import { useState, useMemo, useEffect } from "react";
import Button from "../../components/ui/Button";

import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/modal/Modal";
import AddBusinessCategoryForm from "../../components/settings/businessCategory/AddBusinessCategoryForm";
import EditBusinessCategoryForm from "../../components/settings/businessCategory/EditBusinessCategoryForm";
import { useSettingStore } from "../../store/settingStore";

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function BusinessCategoryManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const {
    businessCategories,
    fetchBusinessCategories,
    loading,
    deleteBusinessCategory,
  } = useSettingStore((state) => state);

  useEffect(() => {
    fetchBusinessCategories();
  }, [fetchBusinessCategories]);

  const handleDelete = async (id) => {
    await deleteBusinessCategory(id);
  };

  const filteredRows = useMemo(() => {
    return businessCategories?.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.description?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [search, businessCategories]);

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
            className="w-40 h-11"
            onClick={() => {
              setEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Add Business Category
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
                      setEditingCategoryId(row.id);
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
        title={editMode ? "Edit Business Category" : "Add Business Category"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditBusinessCategoryForm
              categoryId={editingCategoryId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddBusinessCategoryForm />
          )}
        </div>
      </Modal>
    </main>
  );
}
