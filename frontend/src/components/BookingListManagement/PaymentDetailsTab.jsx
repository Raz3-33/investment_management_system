import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

import { useBookingStore } from "../../store/booking.store";
import { InfoItem } from "./PersonalInfoTab";

const approvalOptions = ["Pending", "Approved"];

export default function PaymentDetailsTab({ paymentDetails }) {
  const {
    updatePaymentApproval, // keeps token approval
    updateScheduledPaymentApproval, // NEW: per-schedule approval
    fetchBookingById,
    booking,
    convertBookingToInvestment,
    loading,
  } = useBookingStore((state) => state);

  if (!paymentDetails) return <p>No payment details.</p>;

  const scheduled = useMemo(() => {
    // Prefer booking.paymentScheduledDetails if present
    const rows = booking?.paymentScheduledDetails || [];
    // Sort by date asc, fallback by created order if needed
    return [...rows].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return da - db;
    });
  }, [booking?.paymentScheduledDetails]);

  // --- TOKEN approval mapping (unchanged) ---
  const paymentKeyToApprovalKey = {
    token: "isTokenApproved",
  };

  // Build initial dropdown states for schedules
  const makeScheduleState = () =>
    Object.fromEntries(
      scheduled.map((s) => [s.id, s.isAmountApproved ? "Approved" : "Pending"])
    );

  const [scheduledApproval, setScheduledApproval] = useState(
    makeScheduleState()
  );

  useEffect(() => {
    setScheduledApproval(makeScheduleState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduled.length]);

  const handleScheduledChange = async (schedId, value) => {
    setScheduledApproval((prev) => ({ ...prev, [schedId]: value }));
    try {
      await updateScheduledPaymentApproval(schedId, value);
      if (booking?.id) await fetchBookingById(booking.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update schedule approval", {
        position: "top-right",
      });
    }
  };

  // --- TOKEN approval confirm handler (unchanged logic) ---
  const handleTokenApproveClick = async () => {
    const ok = window.confirm(
      "Confirm that the Token amount has been received and approved?"
    );
    if (!ok) return;

    try {
      const loadingId = toast.loading("Approving token amount...");
      await updatePaymentApproval(
        paymentDetails.id,
        paymentKeyToApprovalKey.token, // "isTokenApproved"
        "Approved"
      );
      if (booking?.id) await fetchBookingById(booking.id);

      toast.update(loadingId, {
        render: "Token amount marked as approved",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Token approval failed";
      toast.dismiss();
      toast.error(msg, { position: "top-right", autoClose: 4000 });
    }
  };

  const handleConvertClick = async () => {
    try {
      const personalDetailsId =
        booking?.personalDetails?.id || paymentDetails?.personalDetailsId;
      if (!personalDetailsId) {
        toast.warning("Missing booking personal details id", {
          position: "top-right",
        });
        return;
      }

      const loadingId = toast.loading("Converting booking to investment...");
      const data = await convertBookingToInvestment(personalDetailsId);

      toast.update(loadingId, {
        render: "Converted to Investment successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        delay: 0,
      });

      console.log("Conversion result:", data);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Conversion failed";
      toast.dismiss();
      toast.error(msg, { position: "top-right", autoClose: 5000 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Payment Info */}
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

        {/* Token approval status/action */}
        <div className="mt-4 p-3 rounded-md border bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
          <p className="text-sm font-medium mb-2">Token Approval</p>
          {paymentDetails.isTokenApproved ? (
            <p className="text-green-600 font-semibold">
              Token amount received is approved
            </p>
          ) : (
            <button
              type="button"
              onClick={handleTokenApproveClick}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99] transition
                         dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Confirm Token Received
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Schedules from backend */}
      {scheduled.map((row, idx) => {
        const approved = !!row.isAmountApproved;
        return (
          <div
            key={row.id}
            className="p-4 border rounded-md dark:border-gray-700"
          >
            <h4 className="font-semibold mb-2">{`Payment ${idx + 1}`}</h4>
            <InfoItem
              label="Date"
              value={row.date ? new Date(row.date).toDateString() : "-"}
            />
            <InfoItem label="Amount" value={row.amount ?? "-"} />
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
                htmlFor={`sched-${row.id}`}
                className="block text-gray-500 text-sm mb-1"
              >
                Finance Team Approval
              </label>
              <select
                id={`sched-${row.id}`}
                className="border rounded p-1 w-full max-w-xs"
                value={
                  scheduledApproval[row.id] ||
                  (approved ? "Approved" : "Pending")
                }
                onChange={(e) => handleScheduledChange(row.id, e.target.value)}
              >
                {approvalOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {row.paymentProof ? (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Payment Proof: </span>
                <a
                  href={row.paymentProof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </div>
            ) : null}
          </div>
        );
      })}

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
