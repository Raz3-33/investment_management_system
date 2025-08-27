export default function DocumentsTab({ booking }) {
  const documents = [
    { key: "aadharFront", label: "Aadhar Front", type: "image" },
    { key: "aadharBack", label: "Aadhar Back", type: "image" },
    { key: "panCard", label: "PAN Card", type: "image" },
    { key: "companyPan", label: "Company PAN", type: "image" },
    { key: "gstNumber", label: "GST Number", type: "text" },
    { key: "addressProof", label: "Address Proof", type: "pdf" },
    { key: "attachedImage", label: "Attached Image", type: "image" },
  ];

  const handleApprove = (key) => {
    alert(`${documents.find((d) => d.key === key).label} approved!`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <div key={doc.key} className="flex flex-col gap-2">
          <p className="text-gray-500 text-sm">{doc.label}</p>
          {doc.type === "text" ? (
            <p className="font-medium">{booking[doc.key] || "-"}</p>
          ) : booking[doc.key] ? (
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
              <button
                type="button"
                className="ml-2 px-2 py-1 border rounded bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleApprove(doc.key)}
              >
                Approve
              </button>
            </div>
          ) : (
            <p>-</p>
          )}
        </div>
      ))}
    </div>
  );
}
