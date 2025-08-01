import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { usePayoutStore } from "../../store/payoutStore";
import { useInvestmentStore } from "../../store/investmentStore"; // To fetch investments

export default function EditPayoutForm({ payoutId, closeModal }) {
  const { payouts, updatePayout } = usePayoutStore((state) => state);
  const { investments, fetchInvestments } = useInvestmentStore(
    (state) => state
  ); // Fetch investments

  // Find the payout to edit
  const payout = payouts.find((p) => p.id === payoutId);

  // Formatting the dueDate and paidDate for input[type="date"]
  const formattedDueDate = payout?.dueDate
    ? new Date(payout.dueDate).toISOString().split("T")[0]
    : "";

  const formattedPaidDate = payout?.paidDate
    ? new Date(payout.paidDate).toISOString().split("T")[0]
    : "";

  const [formData, setFormData] = useState({
    investmentId: payout?.investmentId || "",
    dueDate: formattedDueDate, // Format the dueDate for the date input
    paidDate: formattedPaidDate, // Format the paidDate for the date input
    amountDue: payout?.amountDue || "",
    amountPaid: payout?.amountPaid || "",
    paymentMode: payout?.paymentMode || "",
    receiptRef: payout?.receiptRef || "",
    notes: payout?.notes || "",
  });

  const [selectedInvestment, setSelectedInvestment] = useState(null); // State to hold the selected investment
  const [error, setError] = useState(""); // State to hold error messages

  useEffect(() => {
    fetchInvestments(); // Fetch all investments when the component mounts
  }, [fetchInvestments]);

  // Handle selecting an investment
  const handleInvestmentChange = (e) => {
    const investmentId = e.target.value;
    const investment = investments.find((inv) => inv.id === investmentId);

    setSelectedInvestment(investment);

    // Set default values based on the selected investment
    if (investment) {
      setFormData({
        ...formData,
        amountDue: investment.amount, // Assume amountDue is the same as investment amount initially
        amountPaid: 0,
        investmentId: e.target.value,
      });
    } else {
      setError("Invalid Investment");
    }
  };

  // Validate the form
  const validateForm = () => {
    setError(""); // Reset error message before validation
    if (!formData.investmentId) {
      return "Investment is required."; // This is the error message
    }
    if (!formData.dueDate) {
      return "Due date is required.";
    }
    if (!formData.amountDue || formData.amountDue <= 0) {
      return "Amount Due must be a positive number.";
    }
    if (formData.amountPaid < 0) {
      return "Amount Paid cannot be negative.";
    }
    if (!formData.paymentMode) {
      return "Payment Mode is required.";
    }
    if (!formData.paidDate) {
      return "Paid Date is required.";
    }

    return ""; // No error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError); // Show error message if validation fails
      return;
    }

    try {
      // Submit the payout form
      await updatePayout(payoutId, formData);
      closeModal(); // Close the modal after successful creation
    } catch (error) {
      console.error("Error updating payout:", error);
      setError(error?.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Investment Selector */}
      <select
        value={formData.investmentId} // Bind the value to formData.investmentId
        onChange={handleInvestmentChange}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Investment</option>
        {investments?.map((investment) => (
          <option key={investment.id} value={investment.id}>
            {investment.opportunity.name} - {investment.amount}{" "}
            {/* Displaying opportunity name and amount */}
          </option>
        ))}
      </select>

      {/* Due Date */}
      <input
        type="date"
        placeholder="Due Date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Paid Date */}
      <input
        type="date"
        placeholder="Paid Date"
        value={formData.paidDate}
        onChange={(e) =>
          setFormData({ ...formData, paidDate: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Amount Due */}
      <input
        type="number"
        placeholder="Amount Due"
        value={formData.amountDue}
        onChange={(e) =>
          setFormData({ ...formData, amountDue: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
        disabled={selectedInvestment && selectedInvestment.amount} // Disable if investment is selected
      />

      {/* Amount Paid */}
      <input
        type="number"
        placeholder="Amount Paid"
        value={formData.amountPaid}
        onChange={(e) =>
          setFormData({ ...formData, amountPaid: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payment Mode */}
      <select
        value={formData.paymentMode}
        onChange={(e) =>
          setFormData({ ...formData, paymentMode: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Payment Mode</option>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="Check">Check</option>
      </select>

      {/* Receipt Reference */}
      <input
        type="text"
        placeholder="Receipt Ref"
        value={formData.receiptRef}
        onChange={(e) =>
          setFormData({ ...formData, receiptRef: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Notes */}
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full h-10 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update Payout
        </Button>
      </div>
    </form>
  );
}
