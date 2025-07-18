// Tab.js
export default function Tab({ id, label, icon, onClick, isActive }) {
  return (
    <li role="presentation" className="me-2">
      <button
        onClick={() => onClick(id)}
        className={`inline-block p-4 border-b-2 rounded-t-lg ${
          isActive
            ? "border-blue-600 text-blue-600"
            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
        }`}
        role="tab"
        aria-controls={id}
        aria-selected={isActive}
      >
        <svg
          className="w-4 h-4 me-2 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d={icon} />
        </svg>
        {label}
      </button>
    </li>
  );
}
