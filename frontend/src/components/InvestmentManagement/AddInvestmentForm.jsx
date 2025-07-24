import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentStore } from "../../store/investmentStore";
import { useInvestorStore } from "../../store/investorStore"; 
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";  // Fetch investment opportunities

export default function AddInvestmentForm({ closeModal }) {
  const { addInvestment, error } = useInvestmentStore((state) => state);
  const { investors, fetchInvestors } = useInvestorStore((state) => state);
  const { investmentOpportunities, fetchInvestmentOpportunities } = useInvestmentOpportunityStore((state) => state);

  const [formData, setFormData] = useState({
    amount: "",
    investorId: "",
    opportunityId: "",
    roiPercent: "",
    payoutMode: "",
    contractStart: "",
    contractEnd: "",
    paymentMethod: "",
    agreementSigned: false,
    status: "Ongoing", // Default status
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    fetchInvestors(); // Fetch investors on component mount
    fetchInvestmentOpportunities(); // Fetch investment opportunities on component mount
  }, [fetchInvestors, fetchInvestmentOpportunities]);

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (
      !formData.amount ||
      !formData.investorId ||
      !formData.opportunityId ||
      !formData.roiPercent ||
      !formData.payoutMode ||
      !formData.contractStart ||
      !formData.contractEnd ||
      !formData.paymentMethod
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    // Validate that amount, roiPercent are numbers
    if (isNaN(formData.amount) || isNaN(formData.roiPercent)) {
      setErrorValidation("Amount and ROI Percent must be numbers.");
      return;
    }

    try {
      // Call the store's addInvestment function to send data to the backend
      await addInvestment(formData);
      // Reset form data after successful submission
      setFormData({
        amount: "",
        investorId: "",
        opportunityId: "",
        roiPercent: "",
        payoutMode: "",
        contractStart: "",
        contractEnd: "",
        paymentMethod: "",
        agreementSigned: false,
        status: "Ongoing",
      });
      setErrorValidation(""); // Clear any previous errors
      closeModal(); // Close modal after successful form submission
    } catch (err) {
      setErrorValidation("Failed to add investment: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

      {/* Amount */}
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Investor */}
      <select
        value={formData.investorId}
        onChange={(e) => setFormData({ ...formData, investorId: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Investor</option>
        {investors.map((investor) => (
          <option key={investor.id} value={investor.id}>
            {investor.name} - {investor.type}
          </option>
        ))}
      </select>

      {/* Investment Opportunity */}
      <select
        value={formData.opportunityId}
        onChange={(e) => setFormData({ ...formData, opportunityId: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Investment Opportunity</option>
        {investmentOpportunities.map((opp) => (
          <option key={opp.id} value={opp.id}>
            {opp.name} - {opp.brandName}
          </option>
        ))}
      </select>

      {/* ROI Percentage */}
      <input
        type="number"
        placeholder="ROI Percentage"
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
      <label>Contract Start</label>
      <input
        type="date"
        placeholder="Contract Start"
        value={formData.contractStart}
        onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Contract End */}
      <label>Contract End</label>

      <input
        type="date"
        placeholder="Contract End"
        value={formData.contractEnd}
        onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payment Method */}
      <label>Payment Method</label>

      <input
        type="text"
        placeholder="Payment Method"
        value={formData.paymentMethod}
        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Agreement Signed Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.agreementSigned}
          onChange={() => setFormData({ ...formData, agreementSigned: !formData.agreementSigned })}
          className="mr-2"
        />
        <label>Agreement Signed</label>
      </div>

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

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" className="w-40 h-12 bg-blue-600 text-white  hover:bg-blue-700 transition duration-300">
          Add Investment
        </Button>
      </div>
    </form>
  );
}
