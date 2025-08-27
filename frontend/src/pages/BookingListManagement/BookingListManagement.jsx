import { useState, useMemo, useEffect } from "react";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/table/DataTable";
import PaginationControls from "../../components/ui/PaginationContrls";
// import Modal from "../../components/ui/Modal/Modal.jsx";
import { useBookingStore } from "../../store/booking.store";
import { useNavigate } from "react-router-dom";
// import AddBookingForm from "../../components/bookingManagement/AddBookingForm";
// import EditBookingForm from "../../components/bookingManagement/EditBookingForm";

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
  const [rowsPerPage] = useState(5);
  const navigate = useNavigate();
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [editMode, setEditMode] = useState(false);
  //   const [editingBookingId, setEditingBookingId] = useState(null);

  const {
    bookings,
    bookingUpdate,
    bookingDelete,
    fetchBookings,
    loading,
    deleteBooking,
    addBooking,
  } = useBookingStore((state) => state);

  // Fetch bookings when component mounts or changes occur
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, bookingUpdate, bookingDelete, addBooking]);

  const handleDelete = async (id) => {
    await deleteBooking(id);
  };

  const filteredRows = useMemo(() => {
    if (addBooking) {
      setIsModalOpen(false);
    }
    return bookings.filter(
      (row) =>
        (row?.fullName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row?.phoneNumber?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [search, bookings, addBooking]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <main className="grow">
      <div className="p-4">
        {/* Search + Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search full name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          {/* <Button
            className="w-40 h-12"
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setIsModalOpen(true);
            }}
          >
            Add Booking
          </Button> */}
        </div>

        {/* Table */}
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
                    onClick={() => {
                      navigate(`/booking_details_management/${row.id}`);
                    }}
                  >
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

                  <Button variant="danger" onClick={() => handleDelete(row.id)}>
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

      {/* Modal */}
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Booking" : "Add Booking"}
      >
        <div className="space-y-4">
          {editMode ? (
            <EditBookingForm
              bookingId={editingBookingId}
              closeModal={() => setIsModalOpen(false)}
            />
          ) : (
            <AddBookingForm />
          )}
        </div>
      </Modal> */}
    </main>
  );
}
