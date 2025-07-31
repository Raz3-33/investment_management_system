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
    status: "Pending",
  });

  const [errorValidation, setErrorValidation] = useState("");

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.type) {
      setErrorValidation("Name, Email, and Type are required.");
      return;
    }

    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.pan && !panPattern.test(formData.pan)) {
      setErrorValidation("Invalid PAN number format.");
      return;
    }

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
      closeModal();
    } catch (err) {
      setErrorValidation("Failed to add investor: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorValidation && <p className="text-red-500 text-sm">{errorValidation}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            placeholder="Investor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1">Type</label>
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
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* PAN */}
        <div>
          <label className="block mb-1">PAN</label>
          <input
            type="text"
            placeholder="ABCDE1234F"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Aadhaar */}
        <div>
          <label className="block mb-1">Aadhaar <span className="text-gray-500 text-sm">(Optional)</span></label>
          <input
            type="text"
            placeholder="12-digit Aadhaar"
            value={formData.aadhaar}
            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* GST Number */}
        <div>
          <label className="block mb-1">GST Number <span className="text-gray-500 text-sm">(Optional)</span></label>
          <input
            type="text"
            placeholder="GST Number"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Referred By */}
        <div>
          <label className="block mb-1">Referred By <span className="text-gray-500 text-sm">(Optional)</span></label>
          <input
            type="text"
            placeholder="Referral"
            value={formData.referredBy}
            onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        {/* Address (full width) */}
        <div className="md:col-span-2">
          <label className="block mb-1">Address</label>
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border px-3 py-2 rounded-md w-full resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" className="w-full md:w-40 h-12 bg-blue-600 text-white hover:bg-blue-700 transition duration-300">
          Add Investor
        </Button>
      </div>
    </form>
  );
}