import { useState, useMemo, useEffect } from "react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/Modal/Modal.jsx";
import AddInvestmentTypeForm from "../../components/settings/investmentType/AddInvestmentTypeForm";
import EditInvestmentTypeForm from "../../components/settings/investmentType/EditInvestmentTypeForm";
import { useSettingStore } from "../../store/settingStore";

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function InvestmentTypeManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);

  const {
    investmentTypes,
    fetchInvestmentTypes,
    investmentTypesAdded,
    loading,
    deleteInvestmentType,
    updateInvestmentTypes
  } = useSettingStore((state) => state);


  console.log(updateInvestmentTypes,"updateInvestmentTypeupdateInvestmentType")

  useEffect(() => {
    fetchInvestmentTypes();
  }, [fetchInvestmentTypes,investmentTypesAdded,updateInvestmentTypes]);

  const handleDelete = async (id) => {
    await deleteInvestmentType(id);
  };

  const filteredRows = useMemo(() => {
    if (investmentTypesAdded) {
      setIsModalOpen(false);
    }
    return investmentTypes?.filter(
      (row) =>
        (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.description?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [search, investmentTypes,investmentTypesAdded,updateInvestmentTypes]);

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
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Add Investment Type
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
                      setEditingTypeId(row.id);
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
        title={editMode ? "Edit Investment Type" : "Add Investment Type"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditInvestmentTypeForm
              typeId={editingTypeId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddInvestmentTypeForm />
          )}
        </div>
      </Modal>
    </main>
  );
}
