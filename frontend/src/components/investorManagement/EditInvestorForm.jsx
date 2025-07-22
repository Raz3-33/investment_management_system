import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestorStore } from "../../store/investorStore";

export default function EditInvestorForm({ investorId, closeModal }) {
  const { investors, updateInvestor } = useInvestorStore((state) => state);
  const investor = investors.find((inv) => inv.id === investorId);

  const [formData, setFormData] = useState({
    name: investor?.name || "",
    email: investor?.email || "",
    type: investor?.type || "",
    address: investor?.address || "",
    pan: investor?.pan || "",
    aadhaar: investor?.aadhaar || "",
    gstNumber: investor?.gstNumber || "",
    phone: investor?.phone || "",
    referredBy: investor?.referredBy || "",
    status: investor?.status || "Pending", // Default status
  });

  const [errorValidation, setErrorValidation] = useState("");

  useEffect(() => {
    if (errorValidation) {
      setErrorValidation(errorValidation);
    }
  }, [errorValidation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.name || !formData.email || !formData.type) {
      setErrorValidation("Name, Email, and Type are required.");
      return;
    }

    // Optional: Validate PAN format (India-specific)
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.pan && !panPattern.test(formData.pan)) {
      setErrorValidation("Invalid PAN number format.");
      return;
    }

    // Optional: Validate Aadhaar format (India-specific)
    const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
    if (formData.aadhaar && !aadhaarPattern.test(formData.aadhaar)) {
      setErrorValidation("Invalid Aadhaar number format.");
      return;
    }

    // Optional: Validate if phone number is in the correct format
    const phonePattern = /^[0-9]{10}$/; // Assuming a 10-digit phone number (India)
    if (formData.phone && !phonePattern.test(formData.phone)) {
      setErrorValidation("Invalid phone number format.");
      return;
    }

    try {
      await updateInvestor(investorId, formData);
      closeModal(); // Close the modal after successful update
    } catch (err) {
      setErrorValidation("Failed to update investor: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

      {/* Name */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Type */}
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Type</option>
        <option value="Individual">Individual</option>
        <option value="HNI">HNI</option>
        <option value="NRI">NRI</option>
        <option value="Company">Company</option>
      </select>

      {/* Address */}
      <textarea
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* PAN */}
      <input
        type="text"
        placeholder="PAN"
        value={formData.pan}
        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Aadhaar */}
      <input
        type="text"
        placeholder="Aadhaar"
        value={formData.aadhaar}
        onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* GST Number */}
      <input
        type="text"
        placeholder="GST Number (Optional)"
        value={formData.gstNumber}
        onChange={(e) =>
          setFormData({ ...formData, gstNumber: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Phone */}
      <input
        type="text"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Referred By */}
      <input
        type="text"
        placeholder="Referred By (Optional)"
        value={formData.referredBy}
        onChange={(e) =>
          setFormData({ ...formData, referredBy: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      />

      <div className="flex justify-center">
        <Button type="submit" className="w-40 h-12 bg-blue-600 text-white">
          Update Investor
        </Button>
      </div>
    </form>
  );
}
