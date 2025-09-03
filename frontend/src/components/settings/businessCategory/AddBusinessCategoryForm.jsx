import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import { useSettingStore } from "../../../store/settingStore";

export default function AddBusinessCategoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errorValidation, setErrorValidation] = useState(""); // Error message state

  const { addBusinessCategory, error, businessCategories } = useSettingStore(
    (state) => state
  );
  

  useEffect(() => {
    if (error) {
      setErrorValidation(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData?.name || !formData?.description) {
      setErrorValidation("All fields are required.");
      return;
    }

    try {
      // Call the store's addBusinessCategory function, which will send data to the backend
      await addBusinessCategory(formData);

      // Reset form data after successful submission
      setFormData({
        name: "",
        description: "",
      });
      setErrorValidation(""); // Clear any previous errors
    } catch (err) {
      setErrorValidation("Failed to add business category: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {errorValidation && (
        <p className="text-red-500 text-sm">{errorValidation}</p>
      )}

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

      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full h-10 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Add Category
        </Button>
      </div>
    </form>
  );
}
