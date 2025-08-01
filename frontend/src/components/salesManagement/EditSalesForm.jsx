import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useSalesStore } from "../../store/salesStore"; // Assuming you have this store to manage sales

const EditSalesForm = ({ salesId, closeModal }) => {
  const { sales, updateSales } = useSalesStore((state) => state); // Use store for fetching and updating sales

  // Find the sales entry to edit based on salesId
  const salesToEdit = sales.find((sale) => sale.id === salesId);

  // Initialize the form data with the existing sales data
  const [formData, setFormData] = useState({
    amount: salesToEdit?.amount || "",
    date: salesToEdit?.date || "",
  });

  const [error, setError] = useState(""); // State to hold error messages

  useEffect(() => {
    if (salesToEdit) {
      setFormData({
        amount: salesToEdit.amount,
        date: new Date(salesToEdit.date).toISOString().split("T")[0], // Format date to match input[type="date"]
      });
    }
  }, [salesToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.date) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await updateSales(salesId, formData); // Update sales via the store
      closeModal(); // Close modal after successful update
    } catch (err) {
      setError("Error updating sales.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Amount */}
      <input
        type="number"
        placeholder="Sales Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Date */}
      <input
        type="date"
        placeholder="Date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full h-10 md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
        >
          Update Sales
        </Button>
      </div>
    </form>
  );
};

export default EditSalesForm;
