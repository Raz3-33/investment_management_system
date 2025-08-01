import {
  createSalesService,
  getSalesService,
  getAllSalesService,
  updateSalesService,
  deleteSalesService,
} from "../services/sales.service.js";

// Create sales entry
export const createSales = async (req, res) => {
  const { opportunityId, amount, date } = req.body;

  // Convert amount to float
  const parsedAmount = parseFloat(amount);

  // Validate that amount is a valid number
  if (isNaN(parsedAmount)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid amount provided." });
  }

  try {
    const sales = await createSalesService({
      opportunityId,
      amount: parsedAmount, // Pass the valid float amount
      date,
    });
    res.status(201).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales by opportunity
export const getSales = async (req, res) => {
  const { opportunityId } = req.params;

  try {
    const sales = await getSalesService(opportunityId);
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sales (new controller method)
export const getAllSales = async (req, res) => {
  try {
    // Fetch all sales along with associated opportunity details
    const sales = await getAllSalesService(); // Modify service to include opportunity details

    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update sales entry
export const updateSales = async (req, res) => {
  const { salesId } = req.params;
  const { amount, date } = req.body;

  try {
    const updatedSales = await updateSalesService(salesId, { amount, date });
    res.status(200).json({ success: true, data: updatedSales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete sales entry
export const deleteSales = async (req, res) => {
  const { salesId } = req.params;

  try {
    await deleteSalesService(salesId);
    res
      .status(200)
      .json({ success: true, message: "Sales deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
