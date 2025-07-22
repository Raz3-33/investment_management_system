import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore"; // Importing setting store for investment types and business categories

export default function AddInvestmentOpportunityForm() {
  const { addInvestmentOpportunity, error } = useInvestmentOpportunityStore((state) => state);
  const { investmentTypes, fetchInvestmentTypes, businessCategories, fetchBusinessCategories, loading } = useSettingStore(
    (state) => state
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    investmentTypeId: "",
    businessCategoryId: "",
    brandName: "",
    minAmount: "",
    maxAmount: "",
    roiPercent: "",
    lockInMonths: "",
    exitOptions: "",
    payoutMode: "",
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    fetchInvestmentTypes(); // Fetch investment types on component mount
    fetchBusinessCategories(); // Fetch business categories on component mount
  }, [fetchInvestmentTypes, fetchBusinessCategories]);

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
      !formData.payoutMode
    ) {
      setErrorValidation("All fields are required.");
      return;
    }

    // Validate minAmount, roiPercent, and lockInMonths as numbers
    if (isNaN(formData.minAmount) || isNaN(formData.roiPercent) || isNaN(formData.lockInMonths)) {
      setErrorValidation("Min Amount, ROI Percent, and Lock-in Months must be numbers.");
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
        lockInMonths: "",
        exitOptions: "",
        payoutMode: "",
      });
      setErrorValidation(""); // Clear any previous errors
    } catch (err) {
      setErrorValidation("Failed to add investment opportunity: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

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
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Brand Name */}
      <input
        type="text"
        placeholder="Brand Name"
        value={formData.brandName}
        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Investment Type */}
      <select
        value={formData.investmentTypeId}
        onChange={(e) => setFormData({ ...formData, investmentTypeId: e.target.value })}
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
        onChange={(e) => setFormData({ ...formData, businessCategoryId: e.target.value })}
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
        onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Maximum Amount */}
      <input
        type="text"
        placeholder="Max Amount"
        value={formData.maxAmount}
        onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* ROI Percentage */}
      <input
        type="text"
        placeholder="ROI Percent"
        value={formData.roiPercent}
        onChange={(e) => setFormData({ ...formData, roiPercent: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Lock-in Months */}
      <input
        type="text"
        placeholder="Lock-in Months"
        value={formData.lockInMonths}
        onChange={(e) => setFormData({ ...formData, lockInMonths: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Exit Options */}
      <input
        type="text"
        placeholder="Exit Options"
        value={formData.exitOptions}
        onChange={(e) => setFormData({ ...formData, exitOptions: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payout Mode */}
      <input
        type="text"
        placeholder="Payout Mode (Monthly, Quarterly, etc.)"
        value={formData.payoutMode}
        onChange={(e) => setFormData({ ...formData, payoutMode: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

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
