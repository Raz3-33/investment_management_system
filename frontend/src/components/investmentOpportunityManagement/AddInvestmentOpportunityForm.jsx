import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";
import { useSettingStore } from "../../store/settingStore";
import { useBranchStore } from "../../store/branchStore";
import { useTerritoryStore } from "../../store/territoryStore";
import { useBrandStore } from "../../store/useBrandStore";
import Modal from "../ui/Modal/Modal";
import AddInvestmentTypeForm from "../settings/investmentType/AddInvestmentTypeForm";
import AddBusinessCategoryForm from "../settings/businessCategory/AddBusinessCategoryForm";

export default function AddInvestmentOpportunityForm() {
  const { addInvestmentOpportunity, error } = useInvestmentOpportunityStore(
    (s) => s
  );

  const { brands, fetchBrands, addBrand } = useBrandStore((s) => s);

  const {
    investmentTypes,
    fetchInvestmentTypes,
    businessCategories,
    fetchBusinessCategories,
  } = useSettingStore((s) => s);

  const { branches, fetchBranches } = useBranchStore((s) => s);

  // NEW: territories
  const { territories, fetchTerritories } = useTerritoryStore((s) => s);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    investmentTypeId: "",
    businessCategoryId: "",
    // brandName: "",
    brandId: "",
    minAmount: "",
    maxAmount: "",
    roiPercent: "",
    turnOverPercentage: "",
    turnOverAmount: "",
    lockInMonths: "",
    exitOptions: "",
    payoutMode: "",
    renewalFee: "",
    selectedBranchIds: [],
    // NEW FIELDS:
    isStore: false, // controls whether store-wise territories apply
    selectedTerritoryIds: [], // multi-select territories
    isSignature: false, // Signature store checkbox state
    signatureStoreLocation: "", // signatureStoreLocation field for signature store
    isStockist: false,
  });

  const [errorValidation, setErrorValidation] = useState("");

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isInvestmentTypeModalOpen, setIsInvestmentTypeModalOpen] =
    useState(false);
  const [isBusinessCategoryModalOpen, setIsBusinessCategoryModalOpen] =
    useState(false);

  useEffect(() => {
    fetchInvestmentTypes();
    fetchBusinessCategories();
    fetchBranches();
    fetchTerritories();
    fetchBrands();
  }, [
    fetchInvestmentTypes,
    fetchBusinessCategories,
    fetchBranches,
    fetchTerritories,
    fetchBrands,
  ]);

  useEffect(() => {
    if (error) setErrorValidation(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const modesSelected =
      Number(formData.isStore) +
      Number(formData.isSignature) +
      Number(formData.isStockist);
    if (modesSelected > 1) {
      setErrorValidation(
        "Choose only one: Master Franchise OR Signature Store OR Stockist."
      );
      return;
    }
    // Required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.investmentTypeId ||
      !formData.businessCategoryId ||
      // !formData.brandName ||
      !formData.brandId ||
      !formData.minAmount ||
      !formData.roiPercent ||
      !formData.lockInMonths ||
      !formData.exitOptions ||
      !formData.payoutMode ||
      !formData.renewalFee
      // formData.selectedBranchIds.length === 0
    ) {
      setErrorValidation("All fields are required .");
      return;
    }

    // If Store is checked, at least one territory must be chosen
    // if (formData.isStore && formData.selectedTerritoryIds.length === 0) {
    //   setErrorValidation(
    //     "Please select at least one territory when Store is enabled."
    //   );
    //   return;
    // }

    // If Signature Store is enabled, signatureStoreLocation is required
    // if (formData.isSignature && !formData.signatureStoreLocation) {z
    //   setErrorValidation("Please enter the location for Signature Store.");
    //   return;
    // }

    // Numeric validations
    if (
      isNaN(formData.minAmount) ||
      (formData.maxAmount && isNaN(formData.maxAmount)) ||
      isNaN(formData.roiPercent) ||
      isNaN(formData.lockInMonths) ||
      (formData.turnOverPercentage && isNaN(formData.turnOverPercentage)) ||
      (formData.turnOverAmount && isNaN(formData.turnOverAmount)) ||
      isNaN(formData.renewalFee)
    ) {
      setErrorValidation(
        "Amounts, percentages, and months must be valid numbers."
      );
      return;
    }

    try {
      // Prepare payload with territories only if isStore is true
      const payload = {
        ...formData,
        // selectedBranchIds: formData.selectedBranchIds,
        // selectedTerritoryIds: formData.isStore
        //   ? formData.selectedTerritoryIds
        //   : [],
      };

      await addInvestmentOpportunity(payload);

      // Reset form data
      setFormData({
        name: "",
        description: "",
        investmentTypeId: "",
        businessCategoryId: "",
        minAmount: "",
        maxAmount: "",
        roiPercent: "",
        turnOverAmount: "",
        turnOverPercentage: "",
        lockInMonths: "",
        exitOptions: "",
        payoutMode: "",
        renewalFee: "",
        selectedBranchIds: [],
        isStore: false,
        isSignature: false, // Reset signature store checkbox
        selectedTerritoryIds: [],
        signatureStoreLocation: "", // Reset signatureStoreLocation
      });
      setErrorValidation(""); // Clear any previous errors
    } catch (err) {
      setErrorValidation(
        "Failed to add investment opportunity: " + err.message
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {/* <input
          type="text"
          placeholder="Brand Name"
          value={formData.brandName}
          onChange={(e) =>
            setFormData({ ...formData, brandName: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full"
        /> */}

          {/* Brand */}
          <select
            value={formData.brandId}
            onChange={(e) => {
              if (e.target.value === "add-new") {
                setFormData({ ...formData, brandId: "" }); // reset selection
                setIsBrandModalOpen(true);
              } else {
                setFormData({ ...formData, brandId: e.target.value });
              }
            }}
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Brand</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value="add-new" className="text-blue-600 font-semibold">
              ➕ Add Brand
            </option>
          </select>

          {/* Investment Type */}
          <select
            value={formData.investmentTypeId}
            onChange={(e) => {
              if (e.target.value === "__add_new__") {
                // reset selection and open the modal
                setFormData({ ...formData, investmentTypeId: "" });
                setIsInvestmentTypeModalOpen(true);
                return;
              }
              setFormData({ ...formData, investmentTypeId: e.target.value });
            }}
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Investment Type</option>
            {investmentTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            <option value="__add_new__">➕ Add Investment Type</option>
          </select>

          {/* Business Category */}
          <select
            value={formData.businessCategoryId}
            onChange={(e) => {
              if (e.target.value === "__add_new__") {
                setFormData({ ...formData, businessCategoryId: "" });
                setIsBusinessCategoryModalOpen(true);
                return;
              }
              setFormData({ ...formData, businessCategoryId: e.target.value });
            }}
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Business Category</option>
            {businessCategories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__add_new__">➕ Add Business Category</option>
          </select>

          {/* Min Amount */}
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
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* Max Amount */}
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
            className="border px-3 py-2 rounded-md w-full"
          />

          {/* ROI % */}
          <div className="relative">
            <input
              type="text"
              placeholder="Minimum Guarantee (%)"
              value={formData.roiPercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roiPercent: e.target.value.replace(/[^0-9.]/g, ""),
                })
              }
              className="border px-3 py-2 rounded-md w-full pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              %
            </span>
          </div>

          {/* Turn Over % */}
          <div className="relative">
            <input
              type="text"
              placeholder="Turn Over Percentage"
              value={formData.turnOverPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  turnOverPercentage: e.target.value.replace(/[^0-9.]/g, ""),
                })
              }
              className="border px-3 py-2 rounded-md w-full pr-8"
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
            onChange={(e) =>
              setFormData({
                ...formData,
                lockInMonths: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
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

          <div>
            {/* Renewal Fee */}
            <input
              type="text"
              placeholder="Renewal Fee"
              value={formData.renewalFee}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  renewalFee: e.target.value.replace(/[^0-9.]/g, ""),
                })
              }
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>
          {/* Branches */}
          {/* <div>
          <label className="block mb-1">Select Branches</label>
          <select
            multiple
            value={formData.selectedBranchIds}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (o) => o.value
              );
              setFormData({ ...formData, selectedBranchIds: selected });
            }}
            className="border px-3 py-2 rounded-md w-full"
          >
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div> */}

          {/* NEW: Store checkbox */}
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
                  isSignature: false, // Disable signature store checkbox
                }));
              }}
              className="h-4 w-4"
            />
            <label htmlFor="isStore" className="text-sm select-none">
              Master Franchise
            </label>
          </div>

          {/* NEW: Signature Store checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isSignature"
              type="checkbox"
              checked={formData.isSignature}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  isSignature: checked,
                  signatureStoreLocation: checked
                    ? prev.signatureStoreLocation
                    : "",
                  selectedTerritoryIds: [], // Clear territories
                  isStore: false, // Disable Store checkbox
                }));
              }}
              className="h-4 w-4"
            />
            <label htmlFor="isSignature" className="text-sm select-none">
              Signature Store
            </label>
          </div>

          {/* Stockist */}
          <div className="flex items-center gap-2">
            <input
              id="isStockist"
              type="checkbox"
              checked={formData.isStockist}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  isStockist: checked,
                  // keep it mutually exclusive with others
                  isStore: checked ? false : prev.isStore,
                  isSignature: checked ? false : prev.isSignature,
                }));
              }}
              className="h-4 w-4"
            />
            <label htmlFor="isStockist" className="text-sm select-none">
              Stockist
            </label>
          </div>
          {/* signatureStoreLocation for Signature Store */}
          {/* {formData.isSignature && (
          <input
            type="text"
            placeholder="Location"
            value={formData.signatureStoreLocation}
            onChange={(e) =>
              setFormData({ ...formData, signatureStoreLocation: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
        )} */}

          {/* NEW: Territories multiselect (only when Store is checked) */}
          {/* {formData.isStore && (
          <div className="md:col-span-1">
            <label className="block mb-1">Select Territories</label>
            <select
              multiple
              value={formData.selectedTerritoryIds}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                );
                setFormData({ ...formData, selectedTerritoryIds: selected });
              }}
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

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full h-9 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
          >
            Add Investment Opportunity
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        title="Create Brand"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Brand Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />

          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData((s) => ({ ...s, description: e.target.value }))
            }
            className="border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            rows={4}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((s) => ({ ...s, isActive: e.target.checked }))
              }
            />
            <span className="text-sm">Active</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={async () => {
                await addBrand(formData); // from useBrandStore
                fetchBrands(); // refresh dropdown
                setIsBrandModalOpen(false); // close modal
                setFormData({ name: "", description: "", isActive: true });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      {/* Investment Type Modal */}

      <Modal
        isOpen={isInvestmentTypeModalOpen}
        onClose={() => setIsInvestmentTypeModalOpen(false)}
        title="Add Investment Type"
      >
        <div className="space-y-4">
          <AddInvestmentTypeForm
            onSuccess={() => {
              fetchInvestmentTypes();
              setIsInvestmentTypeModalOpen(false);
            }}
          />
        </div>
      </Modal>

      {/* Business Category Modal */}

      <Modal
        isOpen={isBusinessCategoryModalOpen}
        onClose={() => setIsBusinessCategoryModalOpen(false)}
        title="Add Business Category"
      >
        <div className="space-y-4">
          <AddBusinessCategoryForm
            onSuccess={() => {
              fetchBusinessCategories();
              setIsBusinessCategoryModalOpen(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
}
