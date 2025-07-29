import { useState, useEffect } from "react";
import Button from "../../components/ui/Button.jsx";
import { useInvestmentStore } from "../../store/investmentStore.js";
import DataTable from "../../components/ui/table/DataTable.jsx";
import PaginationControls from "../../components/ui/PaginationContrls.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import AddInvestmentForm from "../../components/InvestmentManagement/AddInvestmentForm.jsx";
import EditInvestmentForm from "../../components/InvestmentManagement/EditInvestmentForm.jsx";
import InvestmentTable from "../../components/ui/table/InvestmentTable.jsx";

// const columns = [
//   { key: "name", label: "Name" },
//   { key: "amount", label: "Amount" },
//   { key: "date", label: "Date" },
//   { key: "status", label: "Status" },
//   { key: "actions", label: "Actions", isAction: true },
// ];

const columns = [
  { key: "investor", label: "Investor Name" }, // Displaying investor's name
  { key: "amount", label: "Amount" },
  { key: "date", label: "Investment Date" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", isAction: true },
];


export default function InvestmentManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingInvestmentId, setEditingInvestmentId] = useState(null);

  const { investments, fetchInvestments, loading, deleteInvestment } = useInvestmentStore((state) => state);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleDelete = async (id) => {
    await deleteInvestment(id);
  };

  const filteredRows = investments.filter(
    (row) =>
      (row?.investor?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (row?.amount?.toString() || "").includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  console.log(paginatedRows[0]?.investor.name,"paginatedRowspaginatedRowspaginatedRowspaginatedRowspaginatedRows");
  
  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or amount..."
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
            Add Investment
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            <InvestmentTable
              columns={columns}
              rows={paginatedRows}
              renderActions={(row) => (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditMode(true);
                      setEditingInvestmentId(row.id);
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
        title={editMode ? "Edit Investment" : "Add Investment"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditInvestmentForm investmentId={editingInvestmentId} closeModal={() => setIsModalOpen(false)} />
          ) : (
            <AddInvestmentForm closeModal={() => setIsModalOpen(false)} />
          )}
        </div>
      </Modal>
    </main>
  );
}
