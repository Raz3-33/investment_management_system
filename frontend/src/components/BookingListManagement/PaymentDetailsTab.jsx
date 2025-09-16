import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useBookingStore } from "../../store/booking.store";
import { InfoItem } from "./PersonalInfoTab";

const approvalOptions = ["Pending", "Approved"];

export default function PaymentDetailsTab({ paymentDetails }) {
  const {
    updatePaymentApproval,
    updateScheduledPaymentApproval,
    fetchBookingById,
    convertBookingToInvestment,
    markTerritoryBooked,
    unmarkTerritoryBooked,
    booking,
  } = useBookingStore((state) => state);

  const [viewProof, setViewProof] = useState(false);

  if (!paymentDetails) return <p>No payment details.</p>;

  const scheduled = useMemo(() => {
    const rows = booking?.paymentScheduledDetails || [];
    return [...rows].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return da - db;
    });
  }, [booking?.paymentScheduledDetails]);

  const expectedScheduled = useMemo(() => {
    const rows = booking?.expectedPaymentScheduledDetails || [];
    return [...rows].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return da - db;
    });
  }, [booking?.expectedPaymentScheduledDetails]);

  // Map for UI selects
  const makeScheduleState = () =>
    Object.fromEntries(
      scheduled.map((s) => [s.id, s.isAmountApproved ? "Approved" : "Pending"])
    );

  const makeExpectedScheduleState = () =>
    Object.fromEntries(
      expectedScheduled.map((s) => [
        s.id,
        s.isAmountApproved ? "Approved" : "Pending",
      ])
    );

  const [scheduledApproval, setScheduledApproval] = useState(
    makeScheduleState()
  );
  const [expectedScheduledApproval, setExpectedScheduledApproval] = useState(
    makeExpectedScheduleState()
  );

  useEffect(() => {
    setScheduledApproval(makeScheduleState());
    setExpectedScheduledApproval(makeExpectedScheduleState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduled.length, expectedScheduled.length]);

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

  const handleExpectedScheduledChange = async (schedId, value) => {
    setExpectedScheduledApproval((prev) => ({ ...prev, [schedId]: value }));
    try {
      await updateScheduledPaymentApproval(schedId, value); // Assuming same function for expected scheduled payments
      if (booking?.id) await fetchBookingById(booking.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expected schedule approval", {
        position: "top-right",
      });
    }
  };

  // ---------- TOKEN approval handler (toggle) ----------
  const handleTokenApproveClick = async (status) => {
    const confirmMsg =
      status === "Approved"
        ? "Confirm that the Token amount has been received and approved?"
        : "Are you sure you want to revoke the Token approval?";
    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    if (!paymentDetails.paymentProof) {
      toast.warning("Please view the payment proof before approving", {
        position: "top-right",
      });
      return;
    }

    try {
      const loadingId = toast.loading(
        status === "Approved"
          ? "Approving token amount..."
          : "Revoking token approval..."
      );
      await updatePaymentApproval(paymentDetails.id, "isTokenApproved", status);
      if (booking?.id) await fetchBookingById(booking.id);

      toast.update(loadingId, {
        render:
          status === "Approved"
            ? "Token amount marked as approved"
            : "Token approval revoked",
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

  // ---------- Convert to Investment ----------
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

  // ---------- Mark as Booked ----------
  const territoryBooked = !!booking?.territory?.isBooked;
  const handleMarkBooked = async (status = "book") => {
    const personalDetailsId =
      booking?.personalDetails?.id || paymentDetails?.personalDetailsId;

    // If personalDetailsId is missing, show a warning and return early
    if (!personalDetailsId) {
      toast.warning("Missing booking personal details id", {
        position: "top-right",
      });
      return;
    }

    try {
      const loadingId = toast.loading(
        status === "book"
          ? "Marking territory as booked..."
          : "Revoking booking..."
      );

      // Checking the status value and calling the appropriate function
      if (status === "book") {
        // Mark territory as booked
        await markTerritoryBooked(personalDetailsId);
      } else if (status === "unbook") {
        // Unmark territory as booked
        await unmarkTerritoryBooked(personalDetailsId);
      } else {
        throw new Error("Invalid status");
      }

      // Fetch the updated booking info after marking/unmarking
      if (booking?.id) await fetchBookingById(booking.id);

      // Show success toast notification
      toast.update(loadingId, {
        render:
          status === "book" ? "Territory marked as Booked" : "Booking revoked",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update booking status";
      toast.dismiss();
      toast.error(msg, { position: "top-right", autoClose: 4000 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Payment Info */}
      <div className="p-4 border rounded-md dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Overall Payment Info</h4>
          <div className="flex items-center gap-2">
            {/* Territory booked badge / button */}
            {territoryBooked ? (
              <button
                type="button"
                onClick={() => handleMarkBooked("unbook")}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 text-red-600 px-3 py-1.5 text-sm font-semibold hover:bg-red-50 active:scale-[0.99] transition
                 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Revoke Booking
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleMarkBooked("book")}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99] transition
                 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Mark as Booked
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
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
            <button
              type="button"
              onClick={() => handleTokenApproveClick("Pending")}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 text-red-600 px-3 py-1.5 text-sm font-semibold hover:bg-red-50 active:scale-[0.99] transition
                         dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Revoke Token Approval
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTokenApproveClick("Approved")}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99] transition
                         dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Confirm Token Received
            </button>
          )}
          {/* Show payment proof link if exists */}
          {paymentDetails.paymentProof && (
            <div className="mt-2">
              <span className="text-gray-500">Payment Proof: </span>
              <a
                href={paymentDetails.paymentProof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Payment Proof
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Schedules */}
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

      <h4 className="font-semibold">Expected Payment Info</h4>
      {/* Expected Schedules */}
      {expectedScheduled.map((row, idx) => {
        const approved = !!row.isAmountApproved;
        return (
          <div
            key={row.id}
            className="p-4 border rounded-md dark:border-gray-700"
          >
            <h4 className="font-semibold mb-2">{`Expected Payment ${
              idx + 1
            }`}</h4>
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

            {/* <div className="mt-2">
              <label
                htmlFor={`expected-sched-${row.id}`}
                className="block text-gray-500 text-sm mb-1"
              >
                Finance Team Approval
              </label>
              <select
                id={`expected-sched-${row.id}`}
                className="border rounded p-1 w-full max-w-xs"
                value={
                  expectedScheduledApproval[row.id] ||
                  (approved ? "Approved" : "Pending")
                }
                onChange={(e) =>
                  handleExpectedScheduledChange(row.id, e.target.value)
                }
              >
                {approvalOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div> */}

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

      {/* Convert to Investment */}
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
