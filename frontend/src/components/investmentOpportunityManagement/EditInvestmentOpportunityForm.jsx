import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore"; // Importing setting store for investment types and business categories
import { useBranchStore } from "../../store/branchStore"; // Importing branch store for branches

export default function EditInvestmentOpportunityForm({
  opportunityId,
  closeModal,
}) {
  const {
    fetchInvestmentsById,
    updateInvestmentOpportunity,
    investmentOpportunity,
  } = useInvestmentOpportunityStore((state) => state);
  const {
    investmentTypes,
    fetchInvestmentTypes,
    businessCategories,
    fetchBusinessCategories,
  } = useSettingStore((state) => state);
  const { branches, fetchBranches } = useBranchStore((state) => state); // Fetch branches for selection

  // const opportunity = investmentOpportunities.find(
  //   (opp) => opp.id === opportunityId
  // );

  console.log(
    investmentOpportunity,
    "investmentOpportunityinvestmentOpportunityinvestmentOpportunityinvestmentOpportunity"
  );

  // Initial form data setup
  const [formData, setFormData] = useState({
    name: investmentOpportunity?.name || "",
    description: investmentOpportunity?.description || "",
    investmentTypeId: investmentOpportunity?.investmentTypeId || "",
    businessCategoryId: investmentOpportunity?.businessCategoryId || "",
    brandName: investmentOpportunity?.brandName || "",
    minAmount: investmentOpportunity?.minAmount || "",
    maxAmount: investmentOpportunity?.maxAmount || "",
    roiPercent: investmentOpportunity?.roiPercent || "",
    turnOverPercentage: investmentOpportunity?.turnOverPercentage || "",
    turnOverAmount: investmentOpportunity?.turnOverAmount || "",
    lockInMonths: investmentOpportunity?.lockInMonths || "",
    exitOptions: investmentOpportunity?.exitOptions || "",
    payoutMode: investmentOpportunity?.payoutMode || "",
    renewalFee: investmentOpportunity?.renewalFee || "",
    selectedBranchIds: branches?.map((branch) => branch.id) || [], // Store selected branch IDs
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    if (investmentOpportunity) {
      setFormData({
        name: investmentOpportunity?.name || "",
        description: investmentOpportunity?.description || "",
        investmentTypeId: investmentOpportunity?.investmentTypeId || "",
        businessCategoryId: investmentOpportunity?.businessCategoryId || "",
        brandName: investmentOpportunity?.brandName || "",
        minAmount: investmentOpportunity?.minAmount || "",
        maxAmount: investmentOpportunity?.maxAmount || "",
        roiPercent: investmentOpportunity?.roiPercent || "",
        turnOverPercentage: investmentOpportunity?.turnOverPercentage || "",
        turnOverAmount: investmentOpportunity?.turnOverAmount || "",
        lockInMonths: investmentOpportunity?.lockInMonths || "",
        exitOptions: investmentOpportunity?.exitOptions || "",
        payoutMode: investmentOpportunity?.payoutMode || "",
        renewalFee: investmentOpportunity?.renewalFee || "",
        selectedBranchIds: branches?.map((branch) => branch.id) || [], // Store selected branch IDs
      });
    }
  }, [investmentOpportunity]);

  useEffect(() => {
    fetchInvestmentTypes(); // Fetch investment types on component mount
    fetchBusinessCategories(); // Fetch business categories on component mount
    fetchBranches(); // Fetch branches for selection
    fetchInvestmentsById(opportunityId);
  }, [fetchInvestmentTypes, fetchBusinessCategories, fetchBranches]);

  useEffect(() => {
    if (errorValidation) {
      setErrorValidation(errorValidation);
    }
  }, [errorValidation]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      description,
      investmentTypeId,
      businessCategoryId,
      brandName,
      minAmount,
      maxAmount,
      roiPercent,
      turnOverPercentage,
      lockInMonths,
      exitOptions,
      payoutMode,
      renewalFee,
      selectedBranchIds,
    } = formData;

    // Basic validation for required fields
    if (
      !name ||
      !description ||
      !investmentTypeId ||
      !businessCategoryId ||
      !brandName ||
      !minAmount ||
      !roiPercent ||
      !turnOverPercentage ||
      !lockInMonths ||
      !exitOptions ||
      !payoutMode ||
      !renewalFee ||
      selectedBranchIds.length === 0 // Ensure at least one branch is selected
    ) {
      setErrorValidation(
        "All fields are required and at least one branch must be selected."
      );
      return;
    }

    // Validate minAmount, roiPercent, and lockInMonths as numbers
    if (isNaN(minAmount) || isNaN(roiPercent) || isNaN(lockInMonths)) {
      setErrorValidation(
        "Min Amount, ROI Percent, and Lock-in Months must be numbers."
      );
      return;
    }

    try {
      // Call the store's updateInvestmentOpportunity function to send data to the backend
      await updateInvestmentOpportunity(opportunityId, formData);

      // Reset form data after successful submission
      setFormData({
        name: "",
        description: "",
        investmentTypeId: "",
        businessCategoryId: "",
        brandName: "",
        minAmount: "",
        maxAmount: "",
        roiPercent: "",
        turnOverAmount: "",
        turnOverPercentage: "",
        lockInMonths: "",
        exitOptions: "",
        payoutMode: "",
        renewalFee: "",
        selectedBranchIds: [], // Reset selected branches
      });
      setErrorValidation(""); // Clear any previous errors
      closeModal(); // Close modal after successful update
    } catch (err) {
      setErrorValidation(
        "Failed to update investment opportunity: " + err.message
      );
    }
  };

  // Handle branch selection (multiple)
  const handleBranchSelection = (e) => {
    const selectedBranches = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, selectedBranchIds: selectedBranches }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunity Name */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Opportunity Name
          </label>
          <input
            type="text"
            placeholder="Opportunity Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Description
          </label>
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Brand Name</label>
          <input
            type="text"
            placeholder="Brand Name"
            value={formData.brandName}
            onChange={(e) =>
              setFormData({ ...formData, brandName: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Investment Type */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Investment Type
          </label>
          <select
            value={formData.investmentTypeId}
            onChange={(e) =>
              setFormData({ ...formData, investmentTypeId: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
            disabled
          >
            <option value="">Select Investment Type</option>
            {investmentTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Business Category */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Business Category
          </label>
          <select
            value={formData.businessCategoryId}
            onChange={(e) =>
              setFormData({ ...formData, businessCategoryId: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          >
            <option value="">Select Business Category</option>
            {businessCategories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Min Amount</label>
          <input
            type="text"
            placeholder="Min Amount"
            value={formData.minAmount}
            onChange={(e) =>
              setFormData({ ...formData, minAmount: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Max Amount</label>
          <input
            type="text"
            placeholder="Max Amount"
            value={formData.maxAmount}
            onChange={(e) =>
              setFormData({ ...formData, maxAmount: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* ROI Percentage */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Minimum Gurante %
          </label>
          <input
            type="text"
            placeholder="Minimum Gurante %"
            value={formData.roiPercent}
            onChange={(e) =>
              setFormData({ ...formData, roiPercent: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Turn Over Percentage */}
        <div className="relative">
          <label className="block text-xs font-medium mb-0.5">
            Turn Over Percentage
          </label>
          <input
            type="text"
            placeholder="Turn Over Percentage"
            value={formData.turnOverPercentage}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, "");
              setFormData({ ...formData, turnOverPercentage: value });
            }}
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            %
          </span>
        </div>

        {/* Lock-in Months */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Lock-in Months
          </label>
          <input
            type="text"
            placeholder="Lock-in Months"
            value={formData.lockInMonths}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setFormData({ ...formData, lockInMonths: value });
            }}
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Exit Options */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Exit Options
          </label>
          <input
            type="text"
            placeholder="Exit Options"
            value={formData.exitOptions}
            onChange={(e) =>
              setFormData({ ...formData, exitOptions: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Payout Mode */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Payout Mode
          </label>
          <select
            value={formData.payoutMode}
            onChange={(e) =>
              setFormData({ ...formData, payoutMode: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          >
            <option value="">Select Mode</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {/* Renewal Fee */}
        <div>
          <label className="block text-xs font-medium mb-0.5">
            Renewal Fee
          </label>
          <input
            type="text"
            placeholder="Renewal Fee"
            value={formData.renewalFee}
            onChange={(e) =>
              setFormData({ ...formData, renewalFee: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Branches Selection */}
        <div>
          <label className="block mb-1">Select Branches</label>
          <select
            multiple
            value={formData.selectedBranchIds}
            onChange={handleBranchSelection}
            className="border px-3 py-2 rounded-md w-full"
          >
            {branches?.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-2">
        <Button
          type="submit"
          className="w-full h-9 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update Investment Opportunity
        </Button>
      </div>
    </form>
  );
}
