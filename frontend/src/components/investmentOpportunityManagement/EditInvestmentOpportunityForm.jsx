import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore"; // Importing setting store for investment types and business categories

export default function EditInvestmentOpportunityForm({
  opportunityId,
  closeModal,
}) {
  const { investmentOpportunities, updateInvestmentOpportunity } =
    useInvestmentOpportunityStore((state) => state);
  const {
    investmentTypes,
    fetchInvestmentTypes,
    businessCategories,
    fetchBusinessCategories,
  } = useSettingStore((state) => state);

  const opportunity = investmentOpportunities.find(
    (opp) => opp.id === opportunityId
  );


  const [formData, setFormData] = useState({
    name: opportunity?.name || "",
    description: opportunity?.description || "",
    investmentTypeId: opportunity?.investmentTypeId || "",
    businessCategoryId: opportunity?.businessCategoryId || "",
    brandName: opportunity?.brandName || "",
    minAmount: opportunity?.minAmount || "",
    maxAmount: opportunity?.maxAmount || "",
    roiPercent: opportunity?.roiPercent || "",
    turnOverPercentage: opportunity?.turnOverPercentage || "",
    turnOverAmount: opportunity?.turnOverAmount || "",
    lockInMonths: opportunity?.lockInMonths || "",
    exitOptions: opportunity?.exitOptions || "",
    payoutMode: opportunity?.payoutMode || "",
  });

  console.log(formData,"formDataformDataformData")


  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    fetchInvestmentTypes(); // Fetch investment types on component mount
    fetchBusinessCategories(); // Fetch business categories on component mount
  }, [fetchInvestmentTypes, fetchBusinessCategories]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.investmentTypeId ||
      !formData.businessCategoryId ||
      !formData.brandName ||
      !formData.minAmount ||
      !formData.roiPercent ||
      !formData.turnOverAmount ||
      !formData.turnOverPercentage ||
      !formData.lockInMonths ||
      !formData.exitOptions ||
      !formData.payoutMode
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    // Validate minAmount, roiPercent, and lockInMonths as numbers
    if (
      isNaN(formData.minAmount) ||
      isNaN(formData.roiPercent) ||
      isNaN(formData.lockInMonths)
    ) {
      setErrorValidation(
        "Min Amount, ROI Percent, and Lock-in Months must be numbers."
      );
      return;
    }

    try {
      // Call the store's updateInvestmentOpportunity function to send updated data to the backend
      await updateInvestmentOpportunity(opportunityId, formData);
      closeModal(); // Close modal after successful update
    } catch (err) {
      setErrorValidation(
        "Failed to update investment opportunity: " + err.message
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Display error message */}
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* Opportunity Name */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Opportunity Name</label>
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
          <label className="block text-xs font-medium mb-0.5">Description</label>
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
          <label className="block text-xs font-medium mb-0.5">Investment Type</label>
          <select
            value={formData.investmentTypeId}
            onChange={(e) =>
              setFormData({ ...formData, investmentTypeId: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
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
          <label className="block text-xs font-medium mb-0.5">Business Category</label>
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

        {/* Minimum Amount */}
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

        {/* Maximum Amount */}
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
          <label className="block text-xs font-medium mb-0.5">Minimum Gurante %</label>
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

        {/* Turn over Percentage  */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Turn Over Percentage</label>
          <input
            type="text"
            placeholder="Turn Over Percentage"
            value={formData.turnOverPercentage}
            onChange={(e) =>
              setFormData({ ...formData, turnOverPercentage: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Turn over Amount */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Turn Over Amount</label>
          <input
            type="text"
            placeholder="Turn Over Amount"
            value={formData.turnOverAmount}
            onChange={(e) =>
              setFormData({ ...formData, turnOverAmount: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Lock-in Months */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Lock-in Months</label>
          <input
            type="text"
            placeholder="Lock-in Months"
            value={formData.lockInMonths}
            onChange={(e) =>
              setFormData({ ...formData, lockInMonths: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>

        {/* Exit Options */}
        <div>
          <label className="block text-xs font-medium mb-0.5">Exit Options</label>
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
          <label className="block text-xs font-medium mb-0.5">Payout Mode</label>
          <select
            value={formData.payoutMode}
            onChange={(e) =>
              setFormData({ ...formData, payoutMode: e.target.value })
            }
            className="border px-2 py-1 rounded-md w-full text-sm"
          >
            <option value="">Select Payout Mode</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-2">
        <Button
          type="submit"
          className="w-full md:w-auto h-8 bg-blue-600 text-white hover:bg-blue-700 transition duration-300 text-sm"
        >
          Update Investment Opportunity
        </Button>
      </div>
    </form>
  );
}
