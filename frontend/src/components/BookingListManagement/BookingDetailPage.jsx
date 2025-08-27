import { useEffect } from "react";
import { useBookingStore } from "../../store/booking.store";
import Tabs from "../ui/tab/Tabs";
import PersonalInfoTab from "./PersonalInfoTab";
import OfficeDetailsTab from "./OfficeDetailsTab";
import PaymentDetailsTab from "./PaymentDetailsTab";
import DocumentsTab from "./DocumentsTab";
import { useParams } from "react-router-dom";

export default function BookingDetailPage({ closeModal }) {
  const { bookingId } = useParams();
  const { booking, loading, fetchBookingById } = useBookingStore((state) => (state));

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }
    // eslint-disable-next-line
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Loading booking details...
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Info", svg: "👤 ", content: <PersonalInfoTab booking={booking} /> },
    { id: "office", label: "Office Details", svg: "🏢 ", content: <OfficeDetailsTab officeDetails={booking.officeDetails} /> },
    { id: "payment", label: "Payment Details", svg: "💰 ", content: <PaymentDetailsTab paymentDetails={booking.paymentDetails} /> },
    { id: "documents", label: "Documents", svg: "📑 ", content: <DocumentsTab booking={booking} /> },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Booking Details - {booking.fullName}</h2>
      <Tabs tabs={tabs} />
      <div className="mt-4 flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
