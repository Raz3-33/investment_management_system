import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import { useSettingStore } from "../../../store/settingStore";


export default function EditInvestmentTypeForm({ typeId, closeModal }) {
  const { investmentTypes, updateInvestmentType } = useSettingStore(
    (state) => state
  );

  const type = investmentTypes.find((type) => type.id === typeId);

  const [formData, setFormData] = useState({
    name: type?.name || "",
    description: type?.description || "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData?.name || !formData?.description) {
      setError("All fields are required.");
      return;
    }

    try {
      await updateInvestmentType(typeId, formData);
      closeModal(); // Close modal after successful update
    } catch (err) {
      setError("Failed to update investment type: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Investment Type Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update Investment Type
        </Button>
      </div>
    </form>
  );
}
