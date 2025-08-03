import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useSalesStore } from "../../store/salesStore";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";

const AddSalesForm = ({ closeModal }) => {
  const { addSales } = useSalesStore((state) => state);
  const { investmentOpportunities, fetchInvestmentOpportunities } = useInvestmentOpportunityStore((state) => state);

  const [formData, setFormData] = useState({
    opportunityId: "", // Track selected opportunity
    amount: "",
    date: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvestmentOpportunities();
  }, [fetchInvestmentOpportunities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date || !formData.opportunityId) {
      setError("Please fill in all the fields.");
      return;
    }

    try {
      await addSales(formData.opportunityId, formData); // Pass form data including opportunityId
      closeModal();
    } catch (err) {
      setError("Error adding sales.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Investment Opportunity Dropdown */}
      <label className="block mb-1">Investment Opportunity</label>
      <select
        value={formData.opportunityId}
        onChange={(e) => setFormData({ ...formData, opportunityId: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Opportunity</option>
        {investmentOpportunities.map((opp) => (
          <option key={opp.id} value={opp.id}>
            {opp.name} - {opp.brandName}
          </option>
        ))}
      </select>

      {/* Sales Amount */}
      <input
        type="number"
        placeholder="Sales Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Sales Date */}
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
          Add Sales
        </Button>
      </div>
    </form>
  );
};

export default AddSalesForm;
