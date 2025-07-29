// App.js

import Branch from "../../components/settings/branch/Branch";
import Tabs from "../../components/ui/tab/Tabs";
import BusinessCategoryManagement from "./BusinessCategoryManagement";
import InvestmentTypeManagement from "./InvestmentTypeManagement";

const tabs = [
  {
    id: "branch",
    label: "Branch",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* <!-- Left node --> */}
        <circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.5" />
        {/* <!-- Right node --> */}
        <circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="1.5" />
        {/* <!-- Bottom node --> */}
        <circle
          cx="12"
          cy="18"
          r="2"
          stroke="currentColor"
          stroke-width="1.5"
        />

        {/* <!-- Connections --> */}
        <path
          d="M6 6V10C6 13 9 15 12 15C15 15 18 13 18 10V6"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
    ),
    content: <Branch />,
  },
  {
    id: "businessCategory",
    label: "Business Category",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* <!-- Box or container --> */}
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          stroke-width="1.5"
        />

        {/* <!-- Category tags --> */}
        <path
          d="M7 8H17"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M7 12H14"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M7 16H12"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    ),
    content: <BusinessCategoryManagement />,
  },
  {
    id: "investmentType",
    label: "Investment Type",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* <!-- Coin --> */}
        <circle cx="18" cy="6" r="3" stroke="currentColor" stroke-width="1.5" />

        {/* <!-- Stacked bars --> */}
        <rect x="4" y="14" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="10" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="14" y="12" width="3" height="8" rx="1" fill="currentColor" />

        {/* <!-- Coin dollar sign (optional, stylistic) --> */}
        <path
          d="M18 5.25V6.75M17.25 6C17.25 6.41421 17.5858 6.75 18 6.75C18.4142 6.75 18.75 6.41421 18.75 6C18.75 5.58579 18.4142 5.25 18 5.25"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
        />
      </svg>
    ),
    content: <InvestmentTypeManagement />,
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* <!-- Profile circle --> */}
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" />

        {/* <!-- Body shape --> */}
        <path
          d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        {/* <!-- Address book lines --> */}
        <line
          x1="20"
          y1="4"
          x2="20"
          y2="6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <line
          x1="20"
          y1="9"
          x2="20"
          y2="11"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <line
          x1="20"
          y1="14"
          x2="20"
          y2="16"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    ),
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
