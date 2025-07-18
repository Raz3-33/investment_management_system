// TabPanel.js
export default function TabPanel({ id, isActive, children }) {
  return (
    <div
      className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${isActive ? '' : 'hidden'}`}
      role="tabpanel"
      aria-labelledby={`${id}-tab`}
    >
      {children}
    </div>
  );
}
