import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore"; // Importing setting store for investment types and business categories
import { useBranchStore } from "../../store/branchStore"; // Importing the branch store

export default function AddInvestmentOpportunityForm() {
  const { addInvestmentOpportunity, error } = useInvestmentOpportunityStore(
    (state) => state
  );
  const {
    investmentTypes,
    fetchInvestmentTypes,
    businessCategories,
    fetchBusinessCategories,
  } = useSettingStore((state) => state);
  const { branches, fetchBranches } = useBranchStore((state) => state); // Fetch branches

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    investmentTypeId: "",
    businessCategoryId: "",
    brandName: "",
    minAmount: "",
    maxAmount: "",
    roiPercent: "",
    turnOverPercentage: "",
    turnOverAmount: "",
    lockInMonths: "",
    exitOptions: "",
    payoutMode: "",
    renewalFee: "",
    selectedBranchIds: [], // Initialize selected branches as an empty array
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    fetchInvestmentTypes(); // Fetch investment types
    fetchBusinessCategories(); // Fetch business categories
    fetchBranches(); // Fetch branches
  }, [fetchInvestmentTypes, fetchBusinessCategories, fetchBranches]);

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);

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
      !formData.lockInMonths ||
      !formData.exitOptions ||
      !formData.payoutMode ||
      !formData.renewalFee ||
      formData.selectedBranchIds.length === 0 // Ensure at least one branch is selected
    ) {
      setErrorValidation("All fields are required and at least one branch must be selected.");
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
      // Call the store's addInvestmentOpportunity function to send data to the backend
      await addInvestmentOpportunity(formData);

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
    } catch (err) {
      setErrorValidation(
        "Failed to add investment opportunity: " + err.message
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunity Name */}
        <input
          type="text"
          placeholder="Opportunity Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Brand Name */}
        <input
          type="text"
          placeholder="Brand Name"
          value={formData.brandName}
          onChange={(e) =>
            setFormData({ ...formData, brandName: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Investment Type */}
        <select
          value={formData.investmentTypeId}
          onChange={(e) =>
            setFormData({ ...formData, investmentTypeId: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Investment Type</option>
          {investmentTypes?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Business Category */}
        <select
          value={formData.businessCategoryId}
          onChange={(e) =>
            setFormData({ ...formData, businessCategoryId: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Business Category</option>
          {businessCategories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Minimum Amount */}
        <input
          type="text"
          placeholder="Min Amount"
          value={formData.minAmount}
          onChange={(e) =>
            setFormData({ ...formData, minAmount: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Maximum Amount */}
        <input
          type="text"
          placeholder="Max Amount"
          value={formData.maxAmount}
          onChange={(e) =>
            setFormData({ ...formData, maxAmount: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* ROI Percentage */}
        <div className="relative">
          <input
            type="text"
            placeholder="Minimum Gurante"
            value={formData.roiPercent}
            onChange={(e) => {
              // Allow only numbers and dot, but let user clear the field
              const value = e.target.value.replace(/[^0-9.]/g, "");
              setFormData({ ...formData, roiPercent: value });
            }}
            className="border px-3 py-2 rounded-md w-full pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            %
          </span>
        </div>

        {/* Turn Over Percentage */}
        <div className="relative">
          <input
            type="text"
            placeholder="Turn Over Percentage"
            value={formData.turnOverPercentage}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, "");
              setFormData({ ...formData, turnOverPercentage: value });
            }}
            className="border px-3 py-2 rounded-md w-full"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            %
          </span>
        </div>

        {/* Lock-in Months */}
        <input
          type="text"
          placeholder="Lock-in Months"
          value={formData.lockInMonths}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "");
            setFormData({ ...formData, lockInMonths: value });
          }}
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Exit Options */}
        <input
          type="text"
          placeholder="Exit Options"
          value={formData.exitOptions}
          onChange={(e) =>
            setFormData({ ...formData, exitOptions: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />

        {/* Payout Mode */}
        <select
          value={formData.payoutMode}
          onChange={(e) =>
            setFormData({ ...formData, payoutMode: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">Select Payout Mode</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>

        {/* Renewal Fee */}
        <div>

        <input
          type="text"
          placeholder="Renewal Fee"
          value={formData.renewalFee}
          onChange={(e) =>
            setFormData({ ...formData, renewalFee: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        />
        </div>

        {/* Branches Selection */}
        <div>
          <label className="block mb-1">Select Branches</label>
          <select
            multiple
            value={formData.selectedBranchIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, selectedBranchIds: selected });
            }}
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
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full h-9 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Add Investment Opportunity
        </Button>
      </div>
    </form>
  );
}
