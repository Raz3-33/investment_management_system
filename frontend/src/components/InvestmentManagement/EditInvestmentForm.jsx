import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentStore } from "../../store/investmentStore";
import { useInvestorStore } from "../../store/investorStore";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";

// Function to format ISO string into YYYY-MM-DD format
// Returns 'YYYY-MM-DD' or '' if it can't parse
export const formatDateForInput = (value) => {
  if (!value) return "";

  // If it's already a Date
  if (value instanceof Date && !isNaN(value)) {
    // Adjust to local so the same calendar date shows in <input type="date">
    const d = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 10);
  }

  // If it's a timestamp
  if (typeof value === "number") {
    const d = new Date(value);
    if (!isNaN(d)) {
      const adj = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return adj.toISOString().slice(0, 10);
    }
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // If already 'YYYY-MM-DD'
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    // Try to extract a date portion from messy strings
    // 1) Prefer full ISO date at the start
    const isoFullMatch = trimmed.match(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/
    );
    if (isoFullMatch) {
      const d = new Date(isoFullMatch[0]);
      if (!isNaN(d)) {
        const adj = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return adj.toISOString().slice(0, 10);
      }
    }

    // 2) Fallback: just grab the 'YYYY-MM-DD' part if present
    const ymd = trimmed.match(/\d{4}-\d{2}-\d{2}/);
    if (ymd) return ymd[0];

    // 3) Last resort: let Date parse the whole string
    const d = new Date(trimmed);
    if (!isNaN(d)) {
      const adj = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return adj.toISOString().slice(0, 10);
    }

    return "";
  }

  return "";
};

export default function EditInvestmentForm({ investmentId, closeModal }) {
  const { investments, updateInvestment } = useInvestmentStore(
    (state) => state
  );
  const { investors, fetchInvestors } = useInvestorStore((state) => state);
  const {
    investmentOpportunities,
    fetchInvestmentOpportunities,
    fetchInvestmentOpportunityWithBranches,
    investmentOpportunitiesWithBranch,
  } = useInvestmentOpportunityStore((state) => state);

  const investment = investments.find((inv) => inv.id === investmentId);

  const [formData, setFormData] = useState({
    amount: investment?.amount || "",
    investorId: investment?.investorId || "",
    opportunityId: investment?.opportunityId || "",
    payoutMode: investment?.payoutMode || "",
    contractStart: investment?.contractStart || "",
    contractEnd: investment?.contractEnd || "",
    paymentMethod: investment?.paymentMethod || "",
    agreementSigned: investment?.agreementSigned || false,
    status: investment?.status || "Ongoing",
    selectedBranchId: investment?.branchId || "", // Store selected branch ID
    coolOffPeriod: investment?.coolOffPeriod || "", // Store cool off period date
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    fetchInvestors();
    fetchInvestmentOpportunities();
    // Fetch associated branches for the selected opportunity
    fetchInvestmentOpportunityWithBranches(formData?.opportunityId);
  }, [fetchInvestors, fetchInvestmentOpportunities]);

  useEffect(() => {
    fetchInvestmentOpportunityWithBranches(formData?.opportunityId);
  }, [fetchInvestmentOpportunities]);

  useEffect(() => {
    if (investment?.opportunityId) {
      const selectedOp = investmentOpportunities.find(
        (op) => op.id === investment.opportunityId
      );
      setSelectedOpportunity(selectedOp);
    }
  }, [investmentOpportunities, investment?.opportunityId]);


  // Handle when opportunity changes
  const handleOpportunityChange = async (e) => {
    const selectedId = e.target.value;
    setFormData((prev) => {
      const selectedOp = investmentOpportunities.find(
        (op) => op.id === selectedId
      );
      return {
        ...prev,
        opportunityId: selectedId,
        amount: selectedOp ? selectedOp.minAmount : "",
        payoutMode: selectedOp ? selectedOp.payoutMode || "" : prev.payoutMode,
      };
    });

    // Find selected opportunity from the list
    const selectedOp = investmentOpportunities.find(
      (op) => op.id === selectedId
    );
    setSelectedOpportunity(selectedOp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      amount,
      investorId,
      opportunityId,
      payoutMode,
      contractStart,
      contractEnd,
      paymentMethod,
      selectedBranchId,
      coolOffPeriod,
    } = formData;

    // Validate required fields
    if (
      !amount ||
      !investorId ||
      !opportunityId ||
      !payoutMode ||
      !contractStart ||
      !contractEnd ||
      !paymentMethod ||
      !selectedBranchId || // Ensure a branch is selected
      !coolOffPeriod // Ensure cool off period is selected
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    if (isNaN(amount)) {
      setErrorValidation("Amount must be a number.");
      return;
    }

    // Validate contractEnd date is not less than lock-in months from contractStart
    if (selectedOpportunity && selectedOpportunity.lockInMonths) {
      const startDate = new Date(contractStart);
      const endDate = new Date(contractEnd);
      const minEndDate = new Date(startDate);
      minEndDate.setMonth(
        minEndDate.getMonth() + Number(selectedOpportunity.lockInMonths)
      );
      if (endDate < minEndDate) {
        setErrorValidation(
          `Contract end date must be at least ${selectedOpportunity.lockInMonths} month(s) after contract start date.`
        );
        return;
      }
    }

    // Validate that coolOffPeriod is not less than contractStart
    {
      const startDate = new Date(contractStart);
      const coolOffDate = new Date(coolOffPeriod);
      if (coolOffDate < startDate) {
        setErrorValidation(
          "CoolOff Period date cannot be before Contract Start date."
        );
        return;
      }
    }

    try {
      // Call the store's updateInvestment function to send updated data to the backend
      await updateInvestment(investmentId, formData);
      closeModal(); // Close the modal after successful form submission
    } catch (err) {
      setErrorValidation("Failed to update investment: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Investor ID */}
        <div>
          <label className="block mb-1">Investor</label>
          <select
            value={formData.investorId}
            onChange={(e) =>
              setFormData({ ...formData, investorId: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Investor</option>
            {investors?.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.name} - {investor.type}
              </option>
            ))}
          </select>
        </div>

        {/* Investment Opportunity */}
        <div>
          <label className="block mb-1">Investment Opportunity</label>
          <select
            value={formData.opportunityId}
            onChange={handleOpportunityChange}
            className="border px-3 py-2 rounded-md w-full"
            disabled
          >
            <option value="">Select Opportunity</option>
            {investmentOpportunities?.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.name} - {opp.brandName}
              </option>
            ))}
          </select>
        </div>

        {/* Payout Mode */}
        <div>
          <label className="block mb-1">Payout Mode</label>
          <select
            value={formData.payoutMode}
            onChange={(e) =>
              setFormData({ ...formData, payoutMode: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Mode</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block mb-1">Payment Method</label>
          <input
            type="text"
            placeholder="e.g., Bank Transfer"
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Contract Start */}
        <div>
          <label className="block mb-1">Contract Start</label>
          <input
            type="date"
            value={formatDateForInput(formData?.contractStart)}
            onChange={(e) =>
              setFormData({ ...formData, contractStart: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Contract End */}
        <div>
          <label className="block mb-1">Contract End</label>
          <input
            type="date"
            value={formatDateForInput(formData.contractEnd)}
            onChange={(e) =>
              setFormData({ ...formData, contractEnd: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* CoolOff Period */}
        <div>
          <label className="block mb-1">CoolOff Period</label>
          <input
            type="date"
            value={formatDateForInput(formData.coolOffPeriod || "")}
            onChange={(e) => {
              setFormData({ ...formData, coolOffPeriod: e.target.value });
            }}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Branch Selection */}
        <div>
          <label className="block mb-1">Select Branch</label>
          <select
            value={formData.selectedBranchId}
            onChange={(e) =>
              setFormData({ ...formData, selectedBranchId: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Branch</option>
            {investmentOpportunitiesWithBranch?.opportunityBranches?.map(
              (items) => (
                <option key={items?.branch.id} value={items?.branch?.id}>
                  {items?.branch?.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* Agreement Signed */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            checked={formData.agreementSigned}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                agreementSigned: !prev.agreementSigned,
              }))
            }
            className="mr-2"
          />
          <label>Agreement Signed</label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full md:w-40 h-12 bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update Investment
        </Button>
      </div>
    </form>
  );
}
