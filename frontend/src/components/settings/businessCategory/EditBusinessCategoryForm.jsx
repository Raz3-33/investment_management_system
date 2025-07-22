import { useState, useEffect } from "react";

import Button from "../../ui/Button";
import { useSettingStore } from "../../../store/settingStore";

export default function EditBusinessCategoryForm({ categoryId, closeModal }) {
  const { businessCategories, updateBusinessCategory } = useSettingStore(
    (state) => state
  );

  const category = businessCategories.find(
    (category) => category.id === categoryId
  );

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
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
      await updateBusinessCategory(categoryId, formData);
      closeModal(); // Close modal after successful update
    } catch (err) {
      setError("Failed to update business category: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Category Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
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
          Update Category
        </Button>
      </div>
    </form>
  );
}
