import { useState, useEffect,useMemo } from "react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/Modal/Modal.jsx";
import { useInvestorStore } from "../../store/investorStore";
import AddInvestorForm from "../../components/investorManagement/AddInvestorForm";
import EditInvestorForm from "../../components/investorManagement/EditInvestorForm";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function InvestorManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingInvestorId, setEditingInvestorId] = useState(null);

  const {
    investors,
    investorAdd,
    investorUpdate,
    fetchInvestors,
    deleteInvestor,
    loading,
    error,
    updateInvestor,
  } = useInvestorStore((state) => state);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors, updateInvestor, investorAdd, investorUpdate]);

  const handleDelete = async (id) => {
    await deleteInvestor(id);
  };

  const filteredRows = useMemo(() => {
    if (investorAdd) {
      setIsModalOpen(false);
    }
    return investors.filter(
      (row) =>
        row?.name.toLowerCase().includes(search.toLowerCase()) ||
        row?.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, investors, investorAdd,updateInvestor]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
            // className="w-40 h-12"
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Add Investor
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
                      setEditingInvestorId(row.id);
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
        title={editMode ? "Edit Investor" : "Add Investor"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditInvestorForm
              investorId={editingInvestorId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddInvestorForm closeModal={() => setIsModalOpen(false)} />
          )}
        </div>
      </Modal>
    </main>
  );
}
