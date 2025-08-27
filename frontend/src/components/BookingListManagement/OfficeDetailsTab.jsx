import { InfoItem } from "./PersonalInfoTab";

export default function OfficeDetailsTab({ officeDetails }) {
  if (!officeDetails) return <p>No office details.</p>;

  return (
    <div className="p-4 border rounded-md dark:border-gray-700">
      <InfoItem
        label="Office Branch"
        value={officeDetails.officeBranch?.name || "-"}
      />
      <InfoItem
        label="Lead Success Coordinator"
        value={officeDetails.leadSuccessCoordinator?.name || "-"}
      />
      <InfoItem
        label="Partner Relationship Executive"
        value={officeDetails.partnerRelationshipExecutive?.name || "-"}
      />
      <InfoItem
        label="Sales Onboarding Manager"
        value={officeDetails.salesOnboardingManager?.name || "-"}
      />
      <InfoItem label="Lead Source" value={officeDetails.leadSource || "-"} />
    </div>
  );
}

