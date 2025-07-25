import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import { usePayoutStore } from '../../store/payoutStore';
import Modal from '../../components/ui/modal/Modal';
import EditPayoutForm from '../../components/PayoutManagement/EditPayoutForm';
import AddPayoutForm from '../../components/PayoutManagement/AddPayoutForm';
import DataTable from '../../components/ui/table/DataTable';

const columns = [
  { key: 'dueDate', label: 'Due Date' },
  { key: 'amountDue', label: 'Amount Due' },
  { key: 'amountPaid', label: 'Amount Paid' },
  { key: 'paymentMode', label: 'Payment Mode' }, // Change from 'status' to 'paymentMode'
  { key: 'actions', label: 'Actions', isAction: true },
];

export default function PayoutManagement({ investmentId }) {
  const { payouts, fetchPayouts, loading, deletePayout } = usePayoutStore((state) => state);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPayouts(investmentId);
  }, [fetchPayouts, investmentId]);

  const handleDelete = async (id) => {
    await deletePayout(id);
  };

  const renderActions = (row) => (
    <>
      <Button
        variant="primary"
        onClick={() => {
          setEditMode(true);
          setEditingPayoutId(row.id);
          setIsModalOpen(true);
        }}
      >
        Edit
      </Button>
      <Button variant="danger" onClick={() => handleDelete(row.id)}>
        Delete
      </Button>
    </>
  );

  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name or payment mode..."
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
            Add Payout
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
              rows={payouts}
              renderActions={renderActions}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? 'Edit Payout' : 'Add Payout'}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditPayoutForm payoutId={editingPayoutId} closeModal={() => setIsModalOpen(false)} />
          ) : (
            <AddPayoutForm investmentId={investmentId} closeModal={() => setIsModalOpen(false)} />
          )}
        </div>
      </Modal>
    </main>
  );
}
