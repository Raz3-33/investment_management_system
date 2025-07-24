import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { usePayoutStore } from '../../store/payoutStore.js';

export default function EditPayoutForm({ payoutId, closeModal }) {
  const { payouts, updatePayout } = usePayoutStore((state) => state);
  const payout = payouts.find((p) => p.id === payoutId);

  const [formData, setFormData] = useState({
    amountPaid: payout?.amountPaid || '',
    paidDate: payout?.paidDate || '',
    notes: payout?.notes || '',
  });

  useEffect(() => {
    if (payout) {
      setFormData({
        amountPaid: payout.amountPaid,
        paidDate: payout.paidDate,
        notes: payout.notes,
      });
    }
  }, [payout]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updatePayout(payoutId, formData);
      closeModal();
    } catch (error) {
      console.error('Error updating payout:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Amount Paid"
        value={formData.amountPaid}
        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
      />
      <input
        type="date"
        placeholder="Paid Date"
        value={formData.paidDate}
        onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
      />
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <Button type="submit">Update Payout</Button>
    </form>
  );
}
