import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useInvestorStore } from "../../store/investorStore";

export default function AddInvestorForm({ closeModal }) {
  const { addInvestor, error } = useInvestorStore((state) => state);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    address: "",
    pan: "",
    aadhaar: "",
    gstNumber: "",
    phone: "",
    referredBy: "",
    status: "Pending", // Default status is 'Pending'
  });

  const [errorValidation, setErrorValidation] = useState("");

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.name || !formData.email || !formData.type) {
      setErrorValidation("Name, Email, and Type are required.");
      return;
    }

    // Optional: Validate if pan is a valid PAN number format (India specific)
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.pan && !panPattern.test(formData.pan)) {
      setErrorValidation("Invalid PAN number format.");
      return;
    }

    // Optional: Validate if aadhaar is a valid Aadhaar number format (India specific)
    const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
    if (formData.aadhaar && !aadhaarPattern.test(formData.aadhaar)) {
      setErrorValidation("Invalid Aadhaar number format.");
      return;
    }

    try {
      await addInvestor(formData);
      setFormData({
        name: "",
        email: "",
        type: "",
        address: "",
        pan: "",
        aadhaar: "",
        gstNumber: "",
        phone: "",
        referredBy: "",
        status: "Pending",
      });
      closeModal(); // Close the modal after successful form submission
    } catch (err) {
      setErrorValidation("Failed to add investor: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

      {/* Input fields */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

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

      <textarea
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="text"
        placeholder="PAN"
        value={formData.pan}
        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="text"
        placeholder="Aadhaar (Optional)"
        value={formData.aadhaar}
        onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="text"
        placeholder="GST Number (Optional)"
        value={formData.gstNumber}
        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="text"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <input
        type="text"
        placeholder="Referred By (Optional)"
        value={formData.referredBy}
        onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      <div className="flex justify-center">
        <Button type="submit" className="w-40 h-12 bg-blue-600 text-white">
          Add Investor
        </Button>
      </div>
    </form>
  );
}
