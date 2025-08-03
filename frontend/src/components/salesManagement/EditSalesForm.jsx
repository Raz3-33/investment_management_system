import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { useSalesStore } from "../../store/salesStore";
import { useInvestmentOpportunityStore } from "../../store/investmentOpportunity.store";

const EditSalesForm = ({ salesId, closeModal }) => {
  const { updateSales, fetchSales, sales } = useSalesStore((state) => state);
  const { investmentOpportunities, fetchInvestmentOpportunities } =
    useInvestmentOpportunityStore((state) => state);

  const [formData, setFormData] = useState({
    opportunityId: "",
    amount: "",
    date: "",
    paymentMode: "",
  });

  const [error, setError] = useState("");

  // Fetch single sales data and opportunities when modal opens
  useEffect(() => {
    fetchSales(salesId);
    fetchInvestmentOpportunities();
  }, [fetchSales, fetchInvestmentOpportunities, salesId]);

  // Populate form when sales data is available
  useEffect(() => {
    if (sales && sales.id === salesId) {
      setFormData({
        opportunityId: sales.opportunityId || "",
        amount: sales.amount || "",
        date: sales.date
          ? new Date(sales.date).toISOString().split("T")[0]
          : "",
        paymentMode: sales.paymentMode || "",
      });
    }
  }, [sales, salesId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.date || !formData.opportunityId) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await updateSales(salesId, formData);
      closeModal();
    } catch (err) {
      setError("Error updating sales.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Opportunity */}
      <select
        value={formData.opportunityId}
        onChange={(e) =>
          setFormData({ ...formData, opportunityId: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Opportunity</option>
        {investmentOpportunities.map((opp) => (
          <option key={opp.id} value={opp.id}>
            {opp.name} - {opp.brandName}
          </option>
        ))}
      </select>

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
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="border px-3 py-2 rounded-md w-full"
      />

      {/* Payment Mode */}
      {/* <select
        value={formData.paymentMode}
        onChange={(e) =>
          setFormData({ ...formData, paymentMode: e.target.value })
        }
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="">Select Payment Mode</option>
        <option value="Cash">Cash</option>
        <option value="Bank">Bank</option>
        <option value="UPI">UPI</option>
      </select> */}
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
