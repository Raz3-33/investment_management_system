// helper: summarize payments
export function summarizePayments(pd) {
    if (!pd) {
      return {
        hasPaymentDetails: false,
        approvedAmount: 0,
        pendingAmount: null,
        pendingItems: [],
        approvedItems: [],
        dealAmount: 0,
        tokenReceived: 0,
      };
    }
  console.log(pd,"pdpdpdpdpdpdpdpdpdpdpd");
  
    const dealAmount = Number(pd.dealAmount || 0);
    const tokenReceived = Number(pd.tokenReceived || 0);
  
    // Build schedule array from up to 4 items
    const items = [1, 2, 3, 4].map((i) => {
      const amount = Number(pd[`amount${i}`] || 0);
      const dueDate = pd[`date${i}`] || null;
      const approved = Boolean(pd[`isAmount${i}Approved`]);
      return { key: `amount${i}`, index: i, amount, dueDate, approved };
    });
  
    const approvedItems = items.filter((x) => x.amount > 0 && x.approved);
    const pendingItems = items.filter((x) => x.amount > 0 && !x.approved);
  
    const approvedAmountFromSchedules = approvedItems.reduce(
      (sum, x) => sum + (Number.isFinite(x.amount) ? x.amount : 0),
      0
    );
  
    // Prefer explicit balanceDue if present and finite
    let pendingAmount;
    if (pd.balanceDue != null && pd.balanceDue !== "") {
      const bd = Number(pd.balanceDue);
      pendingAmount = Number.isFinite(bd) ? bd : null;
    } else {
      // Fallback: dealAmount - (tokenReceived + approved scheduled amounts)
      const calc = dealAmount - (tokenReceived + approvedAmountFromSchedules);
      pendingAmount = Number.isFinite(calc) ? Math.max(calc, 0) : null;
    }
  
    const approvedAmount = tokenReceived + approvedAmountFromSchedules;
  
    return {
      hasPaymentDetails: true,
      approvedAmount,
      pendingAmount,
      pendingItems,
      approvedItems,
      dealAmount,
      tokenReceived,
    };
  }