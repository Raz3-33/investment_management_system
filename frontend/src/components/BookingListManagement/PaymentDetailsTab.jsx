import { useState, useEffect } from "react";
import { useBookingStore } from "../../store/booking.store";
import { InfoItem } from "./PersonalInfoTab";

const approvalOptions = ["Pending", "Approved"];

export default function PaymentDetailsTab({ paymentDetails }) {
  const { updatePaymentApproval, fetchBookingById, booking } = useBookingStore(
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
      // handle error (optional)
    }
  };

  const payments = [1, 2, 3, 4].map((num) => ({
    date: paymentDetails[`date${num}`],
    amount: paymentDetails[`amount${num}`],
    approved: paymentDetails[`isAmount${num}Approved`],
    approvalKey: `payment${num}`,
  }));

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md dark:border-gray-700">
        <h4 className="font-semibold mb-2">Overall Payment Info</h4>
        <InfoItem label="Deal Amount" value={paymentDetails.dealAmount} />
        <InfoItem label="Token Received" value={paymentDetails.tokenReceived} />
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
    </div>
  );
}
