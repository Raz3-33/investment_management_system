// App.js

import Branch from "../../components/settings/branch/Branch";
import Tabs from "../../components/ui/tab/Tabs";

const tabs = [
  {
    id: "branch",
    label: "Branch",
    icon: "M7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm10-6a3 3 0 1 0-2.83-2H9.83A3.001 3.001 0 0 0 7 11a3 3 0 0 0 2.83 2h4.34A3.001 3.001 0 0 0 17 11Zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z", // Example SVG Path
    content: <Branch />,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Z",
    content: <div>This is the Dashboard tab content.</div>,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152Z",
    content: <div>This is the Settings tab content.</div>,
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: "M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Z",
    content: <div>This is the Contacts tab content.</div>,
  },
];

export default function Settings() {
  return (
    <div className="App">
      <Tabs tabs={tabs} />
    </div>
  );
}
