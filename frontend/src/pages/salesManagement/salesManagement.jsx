import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { useSalesStore } from "../../store/salesStore";
import DataTable from "../../components/ui/table/DataTable";
import Modal from "../../components/ui/Modal/Modal.jsx";
import AddSalesForm from "../../components/salesManagement/AddSalesForm.jsx";
import EditSalesForm from "../../components/salesManagement/EditSalesForm.jsx";

const columns = [
  { key: "opportunityName", label: "Opportunity Name" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function SalesManagement({ opportunityId }) {
  const {
    sales,
    allSales,
    fetchSales,
    fetchAllSales,
    deleteSales,
    loading,
    investmentOpportunities,
  } = useSalesStore((state) => state);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSalesId, setEditingSalesId] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch sales for opportunity or all sales
  useEffect(() => {
    if (opportunityId) {
      fetchSales(opportunityId); // Fetch sales for a specific opportunity
    } else {
      fetchAllSales(); // Fetch all sales if no opportunityId is provided
    }
  }, [fetchSales, fetchAllSales, opportunityId]);

  const handleDelete = async (id) => {
    await deleteSales(id);
  };

  // Helper function to get Opportunity name
  const findOpportunityName = (opportunityId) => {
    const opportunity = investmentOpportunities.find(
      (opp) => opp.id === opportunityId
    );
    return opportunity ? opportunity.name : "Unknown Opportunity";
  };

  const formatDate = (date) => new Date(date).toLocaleDateString(); // Format date

  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by amount..."
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
            Add Sales
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={allSales ? allSales : []}
            renderActions={(row) => (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditMode(true);
                    setEditingSalesId(row.id);
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
            formatData={(row) => ({
              ...row,
              opportunityName: findOpportunityName(row.opportunityId), // Add opportunity name
              date: formatDate(row.date), // Format date
              paymentMode: row.paymentMode || "—", // Add fallback for payment mode
            })}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Sales" : "Add Sales"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditSalesForm
              salesId={editingSalesId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddSalesForm
              opportunityId={opportunityId}
              closeModal={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </Modal>
    </main>
  );
}
