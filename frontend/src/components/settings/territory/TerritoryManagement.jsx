import { useState, useMemo, useEffect } from "react";
import DataTable from "../../ui/table/DataTable";
import Button from "../../ui/Button";
import PaginationControls from "../../ui/PaginationContrls";
import Modal from "../../ui/Modal/Modal";
import ToastNotification from "../../ui/ToastNotification.jsx";
import { useTerritoryStore } from "../../../store/territoryStore";
import { useInvestmentOpportunityStore } from "../../../store/investmentOpportunity.store.js";
import axios from "axios"; // For fetching pincode info

const columns = [
  { key: "opportunity", label: "Opportunity" },
  { key: "assignmentType", label: "Assignment Type" },
  { key: "locationInfo", label: "Location / Pincode" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function TerritoryManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    opportunityId: "",
    assignmentType: "", // Manually / Automatically / User
    locations: [], // for multiple manual locations
    pincodes: [], // for multiple pincodes { code, city }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLocationImage, setNewLocationImage] = useState(null);
  const [newPincodeImage, setNewPincodeImage] = useState(null);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMessage, setToastMessage] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPincode, setNewPincode] = useState("");

  const {
    territories,
    territoryAdded,
    territoryUpdated,
    territoryDeleted,
    fetchTerritories,
    addTerritory,
    updateTerritory,
    deleteTerritory,
    loading,
  } = useTerritoryStore((s) => s);

  // Opportunities
  const { investmentOpportunities, fetchInvestmentOpportunities } =
    useInvestmentOpportunityStore((state) => state);

  useEffect(() => {
    fetchTerritories();
    fetchInvestmentOpportunities(); // fetch dropdown data
  }, [
    fetchTerritories,
    fetchInvestmentOpportunities,
    territoryAdded,
    territoryUpdated,
    territoryDeleted,
  ]);

  useEffect(() => {
    if (territoryAdded) {
      setToastType("success");
      setToastMessage(`Territory added: ${territoryAdded.name}`);
      setShowToast(true);
    }
    if (territoryUpdated) {
      setToastType("success");
      setToastMessage(`Territory updated: ${territoryUpdated.name}`);
      setShowToast(true);
    }
    if (territoryDeleted) {
      setToastType("error");
      setToastMessage(`Territory deleted: ${territoryDeleted}`);
      setShowToast(true);
    }
  }, [territoryAdded, territoryUpdated, territoryDeleted]);

  // 📌 Fetch city/place by Pincode
  const fetchCityByPincode = async (pincode) => {
    try {
      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = res.data[0];
      if (data.Status === "Success") {
        const place = data.PostOffice[0].District;
        setFormData((prev) => ({ ...prev, city: place }));
      } else {
        setFormData((prev) => ({ ...prev, city: "Invalid Pincode" }));
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, city: "Error fetching" }));
    }
  };

  // Add Location (Manually)
  const addLocation = (name, imageFile) => {
    if (name.trim() && !formData.locations.some((loc) => loc.name === name)) {
      setFormData((prev) => ({
        ...prev,
        locations: [...prev.locations, { name, image: imageFile }],
      }));
    }
  };

  // Remove Location
  const removeLocation = (name) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l.name !== name),
    }));
  };

  // Add Pincode (Automatically)
  const addPincode = async (code, imageFile) => {
    if (code.length === 6 && !formData.pincodes.some((p) => p.code === code)) {
      try {
        const res = await axios.get(
          `https://api.postalpincode.in/pincode/${code}`
        );
        const data = res.data[0];
        if (data.Status === "Success") {
          const city = data.PostOffice[0].District;
          setFormData((prev) => ({
            ...prev,
            pincodes: [...prev.pincodes, { code, city, image: imageFile }],
          }));
        }
      } catch (err) {
        console.error("Invalid pincode", err);
      }
    }
  };

  // Remove Pincode
  const removePincode = (code) => {
    setFormData((prev) => ({
      ...prev,
      pincodes: prev.pincodes.filter((p) => p.code !== code),
    }));
  };

  // Validation
  const validate = (data) => {
    const e = {};
    if (!data.opportunityId) e.opportunityId = "Select an Opportunity.";
    if (!data.assignmentType) e.assignmentType = "Select assignment type.";

    if (data.assignmentType === "Manually" && data.locations.length === 0) {
      e.locations = "At least one location is required.";
    }
    if (data.assignmentType === "Automatically" && data.pincodes.length === 0) {
      e.pincodes = "At least one pincode is required.";
    }
    return e;
  };

  const handleCreateOrUpdate = async () => {
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    try {
      // Prepare payload - exclude any non-serializable props if necessary
      // Here assuming backend accepts image info as is or you handle uploads separately
      const payload = { ...formData };

      if (editMode) {
        await updateTerritory(editingId, payload);
      } else {
        await addTerritory(payload);
      }

      setFormData({
        name: "",
        region: "",
        opportunityId: "",
        assignmentType: "",
        locations: [],
        pincodes: [],
        city: "",
      });
      setIsModalOpen(false);
      setEditMode(false);
    } catch (err) {
      setToastType("error");
      setToastMessage(
        err?.message || "Something went wrong. Please try again."
      );
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTerritory(id);
    } catch {
      setToastType("error");
      setToastMessage("Failed to delete the territory.");
      setShowToast(true);
    }
  };

  const displayRows = useMemo(() => {
    if (!Array.isArray(territories)) return [];

    return territories.map((t) => {
      const opportunity = investmentOpportunities.find(
        (o) => o.id === t.investmentOpportunityId
      );

      let locationInfo = "";
      if (t.assignmentType === "MANUALLY") {
        locationInfo = t.location || "-";
      } else if (t.assignmentType === "AUTOMATICALLY") {
        locationInfo = t.pincode ? `${t.pincode} (${t.city || "-"})` : "-";
      }

      return {
        id: t.id,
        opportunity: opportunity ? opportunity.name : "N/A",
        assignmentType: t.assignmentType,
        locationInfo,
      };
    });
  }, [territories, investmentOpportunities]);

  const totalPages = Math.ceil(displayRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayRows.slice(start, start + rowsPerPage);
  }, [displayRows, currentPage, rowsPerPage]);

  const handleEdit = (row) => {
    setEditMode(true);
    setEditingId(row.id);
    setIsModalOpen(true);
    setFormData(row);
    setErrors({});
  };

  //Assignment options based on selected Opportunity
  const selectedOpportunity = investmentOpportunities.find(
    (o) => o.id === formData.opportunityId
  );

  let assignmentOptions = [];
  if (selectedOpportunity) {
    if (selectedOpportunity.isMasterFranchise) {
      assignmentOptions = ["Manually", "Automatically"];
    } else if (
      !selectedOpportunity.isMasterFranchise &&
      selectedOpportunity.isSignature
    ) {
      assignmentOptions = ["User"];
    }
  }

  return (
    <main className="grow">
      {/* Toast */}
      <ToastNotification
        type={toastType}
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="p-4">
        {/* Search + Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search name or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <Button
            className="w-40 h-11"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setFormData({
                name: "",
                region: "",
                opportunityId: "",
                assignmentType: "",
                locations: [],
                pincodes: [],
                city: "",
              });

              setErrors({});
              setIsModalOpen(true);
            }}
          >
            Create Territory
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={displayRows.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
              )}
              renderActions={(row) => (
                <>
                  <Button variant="primary" onClick={() => handleEdit(row)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(row.id)}>
                    Delete
                  </Button>
                </>
              )}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Modal */}
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Territory" : "Create Territory"}
      >
        <div className="space-y-4">
          {/* Opportunity Dropdown */}
          <div>
            <select
              value={formData.opportunityId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opportunityId: e.target.value,
                  assignmentType: "",
                })
              }
              className={`border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white ${
                errors.opportunityId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Opportunity</option>
              {investmentOpportunities.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
            {errors.opportunityId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.opportunityId}
              </p>
            )}
          </div>

          {/* Assignment Type */}
          {assignmentOptions.length > 0 && (
            <div>
              <select
                value={formData.assignmentType}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentType: e.target.value })
                }
                className={`border px-3 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white ${
                  errors.assignmentType ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Assignment Type</option>
                {assignmentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.assignmentType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assignmentType}
                </p>
              )}
            </div>
          )}

          {/* Conditional Fields */}
          {formData.assignmentType === "Manually" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="Enter Location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="border px-3 py-2 rounded-md flex-1 min-w-0 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewLocationImage(e.target.files[0] || null)
                  }
                  className="border rounded-md p-1 flex-1 min-w-0 dark:bg-gray-800 dark:text-white"
                />
                {newLocation.trim() && newLocationImage && (
                  <Button
                    className="whitespace-nowrap"
                    onClick={() => {
                      addLocation(newLocation, newLocationImage);
                      setNewLocation("");
                      setNewLocationImage(null);
                    }}
                  >
                    Add
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.locations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-500 text-white rounded-full flex items-center gap-2"
                  >
                    {loc.image && (
                      <img
                        src={URL.createObjectURL(loc.image)}
                        alt="location"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {loc.name}
                    <button
                      onClick={() => removeLocation(loc.name)}
                      className="text-sm"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.assignmentType === "Automatically" && (
            <div>
              <div className="w-full max-w-full">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="border px-3 py-2 rounded-md flex-1 min-w-0 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewPincodeImage(e.target.files[0] || null)
                    }
                    className="border rounded-md p-1 flex-1 min-w-0 dark:bg-gray-800 dark:text-white"
                  />
                  {newPincode.trim() && newPincodeImage && (
                    <Button
                      className="whitespace-nowrap"
                      onClick={() => {
                        addPincode(newPincode, newPincodeImage);
                        setNewPincode("");
                        setNewPincodeImage(null);
                      }}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pincodes.map((pin, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-500 text-white rounded-full flex items-center gap-2"
                  >
                    {pin.image && (
                      <img
                        src={URL.createObjectURL(pin.image)}
                        alt="pincode"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {pin.code} ({pin.city})
                    <button
                      onClick={() => removePincode(pin.code)}
                      className="text-sm"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleCreateOrUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
