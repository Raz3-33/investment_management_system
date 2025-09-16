import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentStore } from "../../store/investmentStore";
import { useInvestorStore } from "../../store/investorStore";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";

export default function AddInvestmentForm({ closeModal }) {
  const { addInvestment, error } = useInvestmentStore((state) => state);
  const { investors, fetchInvestors } = useInvestorStore((state) => state);
  const {
    investmentOpportunities,
    fetchInvestmentOpportunities,
    fetchInvestmentOpportunityWithBranches,
  } = useInvestmentOpportunityStore((state) => state);

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
    status: "Ongoing",
    // selectedBranchId: "", // Store selected branch ID
    coolOffPeriod: "", // Store cool off period date
  });

  const [errorValidation, setErrorValidation] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    fetchInvestors();
    fetchInvestmentOpportunities();
  }, [fetchInvestors, fetchInvestmentOpportunities]);

  useEffect(() => {
    if (error) setErrorValidation(error);
  }, [error]);


  // Handle when opportunity changes
  const handleOpportunityChange = async (e) => {
    const selectedId = e.target.value;

    const selectedOpp = investmentOpportunities.find(
      (opp) => opp.id === selectedId
    );

    // clear branch immediately to avoid showing a stale name
    setFormData((prev) => ({
      ...prev,
      opportunityId: selectedId,
      amount: selectedOpp ? selectedOpp.minAmount : "",
      payoutMode: selectedOpp ? selectedOpp.payoutMode || "" : prev.payoutMode,
    }));

    setSelectedOpportunity(selectedOpp);

    // kicks off store update; the useEffect above will select the first branch when it arrives
    await fetchInvestmentOpportunityWithBranches(selectedId);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      amount,
      investorId,
      opportunityId,
      roiPercent,
      payoutMode,
      contractStart,
      contractEnd,
      paymentMethod,
      // selectedBranchId,
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
      // !selectedBranchId || // Ensure a branch is selected
      !coolOffPeriod // Ensure cool off period is selected
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    if (isNaN(amount) || isNaN(roiPercent)) {
      setErrorValidation("Amount and ROI Percent must be numbers.");
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
      await addInvestment(formData);
      setFormData({
        amount: "",
        investorId: "",
        opportunityId: "",
        roiPercent: "",
        payoutMode: "",
        contractStart: "",
        contractEnd: "",
        paymentMethod: "",
        // selectedBranchId: "", // Reset the selected branch ID
        coolOffPeriod: "", // Reset coolOffPeriod
        agreementSigned: false,
        status: "Ongoing",
      });
      setErrorValidation("");
      closeModal();
    } catch (err) {
      setErrorValidation("Failed to add investment: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Investment Opportunity */}
        <div>
          <label className="block mb-1">Investment Opportunity</label>
          <select
            value={formData.opportunityId}
            onChange={handleOpportunityChange}
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Opportunity</option>
            {investmentOpportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.name} - {opp.brandName}
              </option>
            ))}
          </select>
        </div>

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

        {/* Investor */}
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
            {investors.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.name} - {investor.type}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        {/* <div>
          <label className="block mb-1">Branch</label>
          <input
            type="text"
            value={
              investmentOpportunitiesWithBranch?.opportunityBranches?.find(
                (b) => b.branch.id === formData.selectedBranchId
              )?.branch?.name || ""
            }
            readOnly
            className="border px-3 py-2 rounded-md w-full bg-gray-100 cursor-not-allowed"
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
            value={formData.contractStart}
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
            value={formData.contractEnd}
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
            value={formData.coolOffPeriod || ""}
            onChange={(e) => {
              setFormData({ ...formData, coolOffPeriod: e.target.value });
            }}
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
          Add Investment
        </Button>
      </div>
    </form>
  );
}
