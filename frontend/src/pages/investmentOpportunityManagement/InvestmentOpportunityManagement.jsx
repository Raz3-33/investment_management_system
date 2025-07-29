import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import Modal from "../../components/ui/Modal/Modal.jsx";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import AddInvestmentOpportunityForm from "../../components/investmentOpportunityManagement/AddInvestmentOpportunityForm";
import EditInvestmentOpportunityForm from "../../components/investmentOpportunityManagement/EditInvestmentOpportunityForm";

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "investmentType", label: "Investment Type" },
  { key: "businessCategory", label: "Business Category" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function InvestmentOpportunityManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingOpportunityId, setEditingOpportunityId] = useState(null);

  const {
    investmentOpportunities,
    investmentOpportunityUpdate,
    investmentOpportunityDelete,
    fetchInvestmentOpportunities,
    loading,
    deleteInvestmentOpportunity,
  } = useInvestmentOpportunityStore((state) => state);

  useEffect(() => {
    fetchInvestmentOpportunities();
  }, [
    fetchInvestmentOpportunities,
    investmentOpportunityUpdate,
    investmentOpportunityDelete,
  ]);

  const handleDelete = async (id) => {
    await deleteInvestmentOpportunity(id);
  };

  const filteredRows = investmentOpportunities.filter(
    (row) =>
      (row?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (row?.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

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
            placeholder="Search name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            className="w-40 h-12"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Add Investment Opportunity
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
                      setEditingOpportunityId(row.id);
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
        title={
          editMode
            ? "Edit Investment Opportunity"
            : "Add Investment Opportunity"
        }
      >
        <div className="space-y-4">
          {editMode ? (
            <EditInvestmentOpportunityForm
              opportunityId={editingOpportunityId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddInvestmentOpportunityForm />
          )}
        </div>
      </Modal>
    </main>
  );
}
