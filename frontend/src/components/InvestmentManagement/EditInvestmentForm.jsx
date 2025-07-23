import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentStore } from "../../store/investmentStore";

export default function EditInvestmentForm({ investmentId, closeModal }) {
  const { investments, updateInvestment } = useInvestmentStore((state) => state);
  const investment = investments.find((inv) => inv.id === investmentId);

  const [formData, setFormData] = useState({
    amount: investment?.amount || "",
    investorId: investment?.investorId || "",
    investmentOpportunityId: investment?.investmentOpportunityId || "",
    roiPercent: investment?.roiPercent || "",
    payoutMode: investment?.payoutMode || "",
    contractStart: investment?.contractStart || "",
    contractEnd: investment?.contractEnd || "",
    paymentMethod: investment?.paymentMethod || "",
    status: investment?.status || "Ongoing",
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    if (errorValidation) {
      setErrorValidation(errorValidation);
    }
  }, [errorValidation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.amount || !formData.investorId || !formData.investmentOpportunityId) {
      setErrorValidation("Amount, Investor, and Investment Opportunity are required.");
      return;
    }

    // Validate that amount, roiPercent, contractStart and contractEnd are numbers
    if (isNaN(formData.amount) || isNaN(formData.roiPercent)) {
      setErrorValidation("Amount and ROI Percent must be numbers.");
      return;
    }

    try {
      await updateInvestment(investmentId, formData);
      closeModal(); // Close the modal after successful form submission
    } catch (err) {
      setErrorValidation("Failed to update investment: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

      {/* Amount */}
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Investor ID */}
      <input
        type="text"
        placeholder="Investor ID"
        value={formData.investorId}
        onChange={(e) => setFormData({ ...formData, investorId: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Investment Opportunity ID */}
      <input
        type="text"
        placeholder="Investment Opportunity ID"
        value={formData.investmentOpportunityId}
        onChange={(e) => setFormData({ ...formData, investmentOpportunityId: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* ROI Percent */}
      <input
        type="number"
        placeholder="ROI Percent"
        value={formData.roiPercent}
        onChange={(e) => setFormData({ ...formData, roiPercent: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payout Mode */}
      <select
        value={formData.payoutMode}
        onChange={(e) => setFormData({ ...formData, payoutMode: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Payout Mode</option>
        <option value="Monthly">Monthly</option>
        <option value="Quarterly">Quarterly</option>
      </select>

      {/* Contract Start */}
      <input
        type="date"
        placeholder="Contract Start"
        value={formData.contractStart}
        onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Contract End */}
      <input
        type="date"
        placeholder="Contract End"
        value={formData.contractEnd}
        onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payment Method */}
      <input
        type="text"
        placeholder="Payment Method"
        value={formData.paymentMethod}
        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Status */}
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="Ongoing">Ongoing</option>
        <option value="Completed">Completed</option>
        <option value="Canceled">Canceled</option>
      </select>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-40 h-12 bg-blue-600 text-white"
        >
          Update Investment
        </Button>
      </div>
    </form>
  );
}
