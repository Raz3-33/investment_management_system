export default function PersonalInfoTab({ booking }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InfoItem label="Full Name" value={booking.fullName} />
      <InfoItem label="Email" value={booking.email} />
      <InfoItem label="Phone" value={booking.phoneNumber} />
      <InfoItem label="Alt Phone" value={booking.altPhoneNumber} />
      <InfoItem label="Territory" value={booking.territory?.city ? booking.territory?.city : booking.territory?.location} />
      <InfoItem label="Opportunity" value={booking.oppurtunity} />
      <InfoItem label="State" value={booking.state} />
      <InfoItem label="District" value={booking.district} />
      <InfoItem label="City" value={booking.city} />
      <InfoItem label="Street Address" value={booking.streetAddress} />
      <InfoItem label="Pincode" value={booking.pincode} />
      <InfoItem label="Payment Status" value={booking.isPaymentCompleted ? "Completed ✅" : "Pending ❌"} />
    </div>
  );
}

export function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
