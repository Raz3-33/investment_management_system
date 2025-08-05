import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentStore } from "../../store/investmentStore";
import { useInvestorStore } from "../../store/investorStore";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";

// Function to format ISO string into YYYY-MM-DD format
const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
};

export default function EditInvestmentForm({ investmentId, closeModal }) {
  const { investments, updateInvestment } = useInvestmentStore(
    (state) => state
  );
  const { investors, fetchInvestors } = useInvestorStore((state) => state);
  const { investmentOpportunities, fetchInvestmentOpportunities } =
    useInvestmentOpportunityStore((state) => state);

  const investment = investments.find((inv) => inv.id === investmentId);

  console.log(investment?.coolOffPeriod,"investmentinvestmentinvestment")

  const [formData, setFormData] = useState({
    amount: investment?.amount || "",
    investorId: investment?.investorId || "",
    opportunityId: investment?.opportunityId || "",
    // roiPercent: investment?.roiPercent || "",
    payoutMode: investment?.payoutMode || "",
    contractStart: investment?.contractStart || "",
    contractEnd: investment?.contractEnd || "",
    paymentMethod: investment?.paymentMethod || "",
    agreementSigned: investment?.agreementSigned || false,
    coolOffPeriod: investment?.coolOffPeriod || "",
    status: investment?.status || "Ongoing",
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    fetchInvestors(); // Fetch investors on component mount
    fetchInvestmentOpportunities(); // Fetch investment opportunities on component mount
  }, [fetchInvestors, fetchInvestmentOpportunities]);

  useEffect(() => {
    // Pre-select the opportunity if it's available
    if (investment?.opportunityId) {
      const selectedOp = investmentOpportunities.find(
        (op) => op.id === investment.opportunityId
      );
      setSelectedOpportunity(selectedOp);
    }
  }, [investmentOpportunities, investment?.opportunityId]);

  const handleOpportunityChange = (e) => {
    const selectedOp = investmentOpportunities.find(
      (op) => op.id === e.target.value
    );
    setSelectedOpportunity(selectedOp); // Set the selected opportunity
    setFormData({ ...formData, opportunityId: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      amount,
      investorId,
      opportunityId,
      // roiPercent,
      payoutMode,
      contractStart,
      contractEnd,
      paymentMethod,
      coolOffPeriod,
    } = formData;

    if (
      !amount ||
      !investorId ||
      !opportunityId ||
      !payoutMode ||
      !contractStart ||
      !contractEnd ||
      !coolOffPeriod ||
      !paymentMethod
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    // if (isNaN(amount) || isNaN(roiPercent)) {
    //   setErrorValidation("Amount and ROI Percent must be numbers.");
    //   return;
    // }

    // Validate if the amount is greater than minAmount in the selected opportunity
    if (selectedOpportunity && amount < selectedOpportunity.minAmount) {
      setErrorValidation(
        `Amount should be greater than the minimum amount of ${selectedOpportunity.minAmount}`
      );
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
        setErrorValidation("CoolOff Period date cannot be before Contract Start date.");
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
          >
            <option value="">Select Opportunity</option>
            {investmentOpportunities?.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.name} - {opp.brandName}
              </option>
            ))}
          </select>
        </div>

        {/* ROI Percentage */}
        {/* <div>
          <label className="block mb-1">ROI Percentage</label>
          <input
            type="number"
            placeholder="ROI Percentage"
            value={formData.roiPercent}
            onChange={(e) => setFormData({ ...formData, roiPercent: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div> */}

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
            value={formatDateForInput(formData.contractStart)}
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

         {/* Cooloff period */}
         <div>
          <label className="block mb-1">CoolOff Period</label>
          <input
            type="date"
            placeholder="CoolOff Period"
            value={
              formData.coolOffPeriod
                ? formatDateForInput(formData.coolOffPeriod)
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                coolOffPeriod: value,
              }));
            }}
            className="border px-3 py-2 rounded-md w-full"
          />
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
