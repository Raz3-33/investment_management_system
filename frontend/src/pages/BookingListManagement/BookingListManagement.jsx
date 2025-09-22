import { useState, useMemo, useEffect, useCallback } from "react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
import { useBookingStore } from "../../store/booking.store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const columns = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "territory", label: "Territory" },
  { key: "oppurtunity", label: "Opportunity" },
  { key: "isPaymentCompleted", label: "Payment Status" },
  { key: "actions", label: "Actions", isAction: true },
];

export default function BookingListManagement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const navigate = useNavigate();

  const {
    bookings,
    bookingUpdate,
    bookingDelete,
    fetchBookings,
    loading,
    deleteBooking,
    addBooking,
    error,
  } = useBookingStore((state) => state);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, bookingUpdate, bookingDelete, addBooking]);

  // NEW: pretty confirm via react-toastify
  const confirmDelete = useCallback(
    (id, displayName = "") => {
      const toastId = toast(
        ({ closeToast }) => (
          <div className="flex flex-col gap-3">
            <div className="text-left">
              <p className="font-semibold">Delete booking?</p>
              <p className="text-sm text-gray-600">
                {displayName ? `This will permanently remove ${displayName}` : "This will permanently remove this booking"}
                , including all associated records (payments, schedules, office details, etc.).
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={closeToast}
                className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // show a loading toast while deleting
                  toast.dismiss(toastId);
                  const p = deleteBooking(id);
                  toast.promise(p, {
                    pending: "Deleting booking…",
                    success: "Booking deleted",
                    error: (e) =>
                      e?.response?.data?.message ||
                      e?.message ||
                      "Failed to delete booking",
                  });
                }}
                className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          className: "max-w-md",
        }
      );
    },
    [deleteBooking]
  );

  const filteredRows = useMemo(() => {
    // FIX: removed stale setIsModalOpen reference
    const q = search.toLowerCase();
    return bookings.filter(
      (row) =>
        (row?.fullName?.toLowerCase() || "").includes(q) ||
        (row?.email?.toLowerCase() || "").includes(q) ||
        (row?.phoneNumber?.toLowerCase() || "").includes(q)
    );
  }, [search, bookings]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <main className="grow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search full name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={paginatedRows}
              renderActions={(row) => (
                <>
                  <Button
                    variant="primary"
                    aria-label="View"
                    onClick={() => navigate(`/booking_details_management/${row.id}`)}
                  >
                    {/* eye icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M2 12c2.2-4.2 6-7 10-7s7.8 2.8 10 7c-2.2 4.2-6 7-10 7s-7.8-2.8-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Button>

                  {/* CHANGED: use confirmDelete */}
                  <Button
                    variant="danger"
                    onClick={() => confirmDelete(row.id, row.fullName)}
                  >
                    Delete
                  </Button>
                </>
              )}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </main>
  );
}
