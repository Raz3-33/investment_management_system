import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore"; // Importing setting store for investment types and business categories
import { useBranchStore } from "../../store/branchStore"; // Importing branch store for branches
import { useTerritoryStore } from "../../store/territoryStore"; // Importing territory store for territories

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
  const { territories, fetchTerritories } = useTerritoryStore((state) => state); // Fetch territories for Store selection

  // Initial form data setup
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
    // selectedBranchIds: [],
    isStore: false, // Store checkbox
    // selectedTerritoryIds: [], // Multi-select territories
    isSignatureStore: false, // Signature store checkbox
    // location: "", // Location for signature store
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  useEffect(() => {
    if (investmentOpportunity) {
      setFormData({
        name: investmentOpportunity?.name || "",
        description: investmentOpportunity?.description || "",
        investmentTypeId: investmentOpportunity?.investmentType?.id || "",
        businessCategoryId: investmentOpportunity?.businessCategory?.id || "",
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
        // selectedBranchIds:
        //   investmentOpportunity?.opportunityBranches?.map(
        //     (branch) => branch?.branch?.id
        //   ) || [], // Store selected branch IDs
        isStore: investmentOpportunity?.isMasterFranchise || false, // If it's a Master Franchise
        // selectedTerritoryIds:
        //   investmentOpportunity?.territoryMasters?.map(
        //     (territory) => territory?.territory?.id
        //   ) || [], // If there are territories
        isSignatureStore: investmentOpportunity?.isSignature || false, // If it's a Signature Store
        // location: investmentOpportunity?.signatureStoreLocation || "", // Signature store location
      });
    }
  }, [investmentOpportunity]);

  useEffect(() => {
    fetchInvestmentTypes(); // Fetch investment types on component mount
    fetchBusinessCategories(); // Fetch business categories on component mount
    fetchBranches(); // Fetch branches for selection
    fetchTerritories(); // Fetch territories for Store selection
    fetchInvestmentsById(opportunityId); // Fetch the investment opportunity by ID
  }, [
    fetchInvestmentTypes,
    fetchBusinessCategories,
    fetchBranches,
    fetchTerritories,
  ]);

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
      roiPercent,
      turnOverPercentage,
      lockInMonths,
      exitOptions,
      payoutMode,
      renewalFee,
      // selectedBranchIds,
      isStore,
      // selectedTerritoryIds,
      isSignatureStore,
      // location,
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
      !renewalFee
    ) {

      console.log({
        name: name,
        description: description,
        investmentTypeId: investmentTypeId,
        businessCategoryId: businessCategoryId,
        brandName: brandName,
        minAmount: minAmount,
        roiPercent: roiPercent,
        turnOverPercentage: turnOverPercentage,
        lockInMonths: lockInMonths,
        exitOptions: exitOptions,
        payoutMode: payoutMode,
        renewalFee: renewalFee,
      });

      setErrorValidation(
        "All fields are required ."
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

    // If Store is checked, at least one territory must be chosen
    // if (isStore && selectedTerritoryIds.length === 0) {
    //   setErrorValidation(
    //     "Please select at least one territory when Store is enabled."
    //   );
    //   return;
    // }

    // If Signature Store is enabled, location is required
    // if (isSignatureStore && !location) {
    //   setErrorValidation("Please enter the location for Signature Store.");
    //   return;
    // }

    try {
      // Prepare payload with territories only if isStore is true
      const payload = {
        ...formData,
        // selectedBranchIds,
        // selectedTerritoryIds: isStore ? selectedTerritoryIds : [],
        isMasterFranchise: isStore, // Master Franchise flag
        isSignature: isSignatureStore, // Signature Store flag
        // signatureStoreLocation: isSignatureStore ? location : "", // Signature Store location
      };

      // Call the store's updateInvestmentOpportunity function to send data to the backend
      await updateInvestmentOpportunity(opportunityId, payload);

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
        // selectedBranchIds: [],
        isStore: false,
        // selectedTerritoryIds: [],
        isSignatureStore: false, // Reset signature store checkbox
        // location: "", // Reset location
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
  // const handleBranchSelection = (e) => {
  //   const selectedBranches = Array.from(
  //     e.target.selectedOptions,
  //     (option) => option.value
  //   );
  //   setFormData((prev) => ({ ...prev, selectedBranchIds: selectedBranches }));
  // };

  // Handle territory selection (multiple)
  // const handleTerritorySelection = (e) => {
  //   const selectedTerritories = Array.from(
  //     e.target.selectedOptions,
  //     (option) => option.value
  //   );
  //   setFormData((prev) => ({
  //     ...prev,
  //     selectedTerritoryIds: selectedTerritories,
  //   }));
  // };

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
              setFormData({
                ...formData,
                minAmount: e.target.value.replace(/[^0-9.]/g, ""),
              })
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
              setFormData({
                ...formData,
                maxAmount: e.target.value.replace(/[^0-9.]/g, ""),
              })
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
        {/* <div>
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
        </div> */}

        {/* Master Franchise Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="isStore"
            type="checkbox"
            checked={formData.isStore}
            onChange={(e) => {
              const checked = e.target.checked;
              setFormData((prev) => ({
                ...prev,
                isStore: checked,
                // if unchecked, clear territories to avoid stale selections
                // selectedTerritoryIds: checked ? prev.selectedTerritoryIds : [],
                isSignatureStore: false, // Disable signature store checkbox
              }));
            }}
            className="h-4 w-4"
          />
          <label htmlFor="isStore" className="text-sm select-none">
            Master Franchise
          </label>
        </div>

        {/* Signature Store Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="isSignatureStore"
            type="checkbox"
            checked={formData.isSignatureStore}
            onChange={(e) => {
              const checked = e.target.checked;
              setFormData((prev) => ({
                ...prev,
                isSignatureStore: checked,
                // location: checked ? prev.location : "",
                // selectedTerritoryIds: [], // Clear territories
                isStore: false, // Disable Store checkbox
              }));
            }}
            className="h-4 w-4"
          />
          <label htmlFor="isSignatureStore" className="text-sm select-none">
            Signature Store
          </label>
        </div>

        {/* Location for Signature Store */}
        {/* {formData.isSignatureStore && (
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        )} */}

        {/* Territories multiselect (only when Store is checked) */}
        {/* {formData.isStore && (
          <div className="md:col-span-1">
            <label className="block mb-1">Select Territories</label>
            <select
              multiple
              value={formData.selectedTerritoryIds}
              onChange={handleTerritorySelection}
              className="border px-3 py-2 rounded-md w-full"
            >
              {territories?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple territories.
            </p>
          </div>
        )} */}
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
