import { useState, useEffect } from "react";
import { useBookingStore } from "../../store/booking.store";
import { InfoItem } from "./PersonalInfoTab";

const approvalOptions = ["Pending", "Approved"];

export default function PaymentDetailsTab({ paymentDetails }) {
  const { updatePaymentApproval, fetchBookingById, booking,convertBookingToInvestment } = useBookingStore(
    (state) => state
  );

  if (!paymentDetails) return <p>No payment details.</p>;

  // Map each approval key to the database boolean field
  const paymentKeyToApprovalKey = {
    payment1: "isAmount1Approved",
    payment2: "isAmount2Approved",
    payment3: "isAmount3Approved",
    payment4: "isAmount4Approved",
  };

  // On mount/update, sync dropdown value from booleans in DB
  const getDropdownState = () => ({
    payment1: paymentDetails.isAmount1Approved ? "Approved" : "Pending",
    payment2: paymentDetails.isAmount2Approved ? "Approved" : "Pending",
    payment3: paymentDetails.isAmount3Approved ? "Approved" : "Pending",
    payment4: paymentDetails.isAmount4Approved ? "Approved" : "Pending",
  });

  const [approvalStatus, setApprovalStatus] = useState(getDropdownState());

  useEffect(() => {
    setApprovalStatus(getDropdownState());
  }, [paymentDetails]);

  const handleApprovalChange = async (paymentKey, value) => {
    setApprovalStatus((prev) => ({ ...prev, [paymentKey]: value }));
    try {
      const approvalField = paymentKeyToApprovalKey[paymentKey];
      await updatePaymentApproval(paymentDetails.id, approvalField, value);
      if (booking?.id) fetchBookingById(booking.id);
    } catch (err) {
      console.error(err);
    }
  };

  const payments = [1, 2, 3, 4].map((num) => ({
    date: paymentDetails[`date${num}`],
    amount: paymentDetails[`amount${num}`],
    approved: paymentDetails[`isAmount${num}Approved`],
    approvalKey: `payment${num}`,
  }));

  // const handleConvertClick = () => {
  //   if (onConvert) {
  //     onConvert();
  //   } else {
  //     console.log("Convert to Investment clicked");
  //   }
  // };


const handleConvertClick = async () => {
  try {
    // booking?.personalDetails?.id or however you hold it.
    const personalDetailsId = booking?.personalDetails?.id || paymentDetails?.personalDetailsId;
    if (!personalDetailsId) {
      alert("Missing booking personal details id");
      return;
    }
    const data = await convertBookingToInvestment(personalDetailsId);
    // optional: refetch booking or navigate to investment view
    // await fetchBookingById(booking.id);
    alert("Converted to Investment successfully");
    console.log("Conversion result:", data);
  } catch (e) {
    alert(e?.response?.data?.message || e.message || "Conversion failed");
  }
};

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md dark:border-gray-700">
        <h4 className="font-semibold mb-4">Overall Payment Info</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InfoItem label="Deal Amount" value={paymentDetails.dealAmount} />
          <InfoItem
            label="Token Received"
            value={paymentDetails.tokenReceived}
          />
          <InfoItem
            label="Token Date"
            value={
              paymentDetails.tokenDate
                ? new Date(paymentDetails.tokenDate).toDateString()
                : "-"
            }
          />
          <InfoItem label="Balance Due" value={paymentDetails.balanceDue} />
          <InfoItem
            label="Mode of Payment"
            value={paymentDetails.modeOfPayment}
          />
          <InfoItem label="Remarks" value={paymentDetails.remarks} />
          <InfoItem
            label="Additional Commitment"
            value={paymentDetails.additionalCommitment}
          />
        </div>
      </div>

      {payments.map(({ date, amount, approved, approvalKey }, idx) => (
        <div
          key={approvalKey}
          className="p-4 border rounded-md dark:border-gray-700"
        >
          <h4 className="font-semibold mb-2">{`Payment ${idx + 1}`}</h4>
          <InfoItem
            label="Date"
            value={date ? new Date(date).toDateString() : "-"}
          />
          <InfoItem label="Amount" value={amount || "-"} />
          <p className="mt-2 text-sm">
            Status:{" "}
            <span
              className={
                approved ? "text-green-600 font-semibold" : "text-gray-600"
              }
            >
              {approved ? "Approved" : "Pending"}
            </span>
          </p>
          <div className="mt-2">
            <label
              htmlFor={approvalKey}
              className="block text-gray-500 text-sm mb-1"
            >
              Finance Team Approval
            </label>
            <select
              id={approvalKey}
              className="border rounded p-1 w-full max-w-xs"
              value={approvalStatus[approvalKey]}
              onChange={(e) =>
                handleApprovalChange(approvalKey, e.target.value)
              }
            >
              {approvalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      {/* Convert button bottom-left */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleConvertClick}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99] transition
                     dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Convert to Investment
        </button>
      </div>
    </div>
  );
}
