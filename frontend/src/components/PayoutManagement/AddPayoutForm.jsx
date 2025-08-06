import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { usePayoutStore } from "../../store/payoutStore";
import { useInvestmentStore } from "../../store/investmentStore"; // To fetch investments

export default function AddPayoutForm({ closeModal }) {
  const { createPayout } = usePayoutStore((state) => state);
  const { investments, fetchInvestments } = useInvestmentStore(
    (state) => state
  );

  const [formData, setFormData] = useState({
    investmentId: "",
    dueDate: "",
    paidDate: "",
    amountDue: "",
    amountPaid: 0,
    paymentMode: "",
    receiptRef: "",
    notes: "",
  });

  const [selectedInvestment, setSelectedInvestment] = useState(null); // State to hold the selected investment
  const [error, setError] = useState(""); // State to hold error messages

  useEffect(() => {
    fetchInvestments(); // Fetch all investments when the component mounts
  }, [fetchInvestments]);

  // Validate the form
  const validateForm = () => {
    setError(""); // Reset error message before validation
    if (!formData.investmentId) {
      return "Investment is required."; // This is the error message
    }
    if (!formData.dueDate) {
      return "Due date is required.";
    }
    if (!formData.paidDate) {
      return "Paid date is required."; // Added validation for paidDate
    }
    if (formData.amountPaid < 0) {
      return "Amount Paid cannot be negative.";
    }
    if (!formData.paymentMode) {
      return "Payment Mode is required.";
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
      await createPayout(formData);
    } catch (error) {
      console.error("Error creating payout:", error);
      setError("Error creating payout. Please try again later.");
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Investment Selector */}
      <div>
        <label className="block mb-1">Investment</label>
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
      </div>

      {/* Due Date */}
      <div>
        <label className="block mb-1">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Paid Date */}
      <div>
        <label className="block mb-1">Paid Date</label>
        <input
          type="date"
          value={formData.paidDate}
          onChange={(e) =>
            setFormData({ ...formData, paidDate: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Amount Paid */}
      <div>
        <label className="block mb-1">Amount Paid</label>
        <input
          type="number"
          placeholder="Amount Paid"
          // value={formData.amountPaid}
          onChange={(e) =>
            setFormData({ ...formData, amountPaid: Number(e.target.value) })
          }
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Payment Mode */}
      <div>
        <label className="block mb-1">Payment Mode</label>
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
      </div>

      {/* Receipt Reference */}
      <div>
        <label className="block mb-1">Receipt Ref</label>
        <input
          type="text"
          placeholder="Receipt Ref"
          value={formData.receiptRef}
          onChange={(e) =>
            setFormData({ ...formData, receiptRef: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block mb-1">Notes</label>
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full h-10 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Create Payout
        </Button>
      </div>
    </form>
  );
}
