import { useBookingStore } from "../../store/booking.store";
import { useState } from "react";

export default function DocumentsTab({ booking }) {
  const { updateDocumentApproval, fetchBookingById } = useBookingStore((s) => s);
  const [busyKey, setBusyKey] = useState(null);

  const documents = [
    { key: "aadharFront", label: "Aadhar Front", type: "image", approvedKey: "aadharFrontIsApproved" },
    { key: "aadharBack", label: "Aadhar Back", type: "image", approvedKey: "aadharBackIsApproved" },
    { key: "panCard", label: "PAN Card", type: "image", approvedKey: "panCardIsApproved" },
    { key: "companyPan", label: "Company PAN", type: "image", approvedKey: "companyPanIsApproved" },
    { key: "gstNumber", label: "GST Number", type: "text" }, // no approval boolean
    { key: "addressProof", label: "Address Proof", type: "pdf", approvedKey: "addressProofIsApproved" },
    { key: "attachedImage", label: "Attached Image", type: "image", approvedKey: "attachedImageIsApproved" },
  ];

  const handleApprove = async (doc) => {
    try {
      setBusyKey(doc.key);
      const personalDetailsId = booking?.id; // booking is BookingFormPersonalDetails
      await updateDocumentApproval(personalDetailsId, doc.key, "Approved");
      // Refresh (optional) so UI reflects new booleans
      await fetchBookingById(personalDetailsId);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to approve");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {documents.map((doc) => {
        const approved = doc.approvedKey ? booking?.[doc.approvedKey] : undefined;
        const hasFile = !!booking?.[doc.key];

        return (
          <div key={doc.key} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">{doc.label}</p>
              {doc.approvedKey !== undefined && (
                <span
                  className={
                    approved
                      ? "text-xs px-2 py-0.5 rounded bg-green-100 text-green-700"
                      : "text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                  }
                >
                  {approved ? "Approved" : "Pending"}
                </span>
              )}
            </div>

            {doc.type === "text" ? (
              <p className="font-medium">{booking?.[doc.key] || "-"}</p>
            ) : hasFile ? (
              <div className="flex items-center gap-2">
                {doc.type === "image" && (
                  <a href={booking[doc.key]} target="_blank" rel="noopener noreferrer">
                    <img
                      src={booking[doc.key]}
                      alt={doc.label}
                      className="w-20 h-20 object-cover border rounded"
                    />
                  </a>
                )}
                {doc.type === "pdf" && (
                  <a
                    href={booking[doc.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 underline"
                  >
                    <span className="material-icons-outlined mr-1">picture_as_pdf</span>
                    View PDF
                  </a>
                )}

                {/* Approve button (skip for gstNumber) */}
                {doc.approvedKey && (
                  <button
                    type="button"
                    disabled={busyKey === doc.key || approved === true}
                    className={`ml-2 px-2 py-1 border rounded text-white ${
                      approved ? "bg-green-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                    onClick={() => handleApprove(doc)}
                  >
                    {approved ? "Approved" : busyKey === doc.key ? "Approving..." : "Approve"}
                  </button>
                )}
              </div>
            ) : (
              <p>-</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
