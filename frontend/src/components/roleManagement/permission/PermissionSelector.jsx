const defaultActions = ["View", "Update", "Delete", "Approve"];

export default function PermissionSelector({
  module,
  permissions,
  onChange,
  actions = defaultActions,
}) {
  const keys = actions.map((a) => `${module}:${a.toLowerCase()}`);
  const allSelected = keys.every((k) => permissions.includes(k));
  const someSelected = !allSelected && keys.some((k) => permissions.includes(k));

  const handleCheckboxChange = (action) => {
    const key = `${module}:${action.toLowerCase()}`;
    const updated = permissions.includes(key)
      ? permissions.filter((p) => p !== key)
      : [...permissions, key];
    onChange(updated);
  };

  const toggleAll = () => {
    if (allSelected) {
      // remove all for this module
      onChange(permissions.filter((p) => !keys.includes(p)));
    } else {
      // add all for this module
      const merged = new Set([...permissions, ...keys]);
      onChange([...merged]);
    }
  };

  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-white">
          {module}
        </h3>
        <button
          type="button"
          onClick={toggleAll}
          className={`text-xs px-2 py-1 rounded border ${
            allSelected
              ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
              : someSelected
              ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
              : "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300"
          }`}
          aria-pressed={allSelected}
        >
          {allSelected ? "Unselect all" : "Select all"}
        </button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {actions.map((action) => {
            const key = `${module}:${action.toLowerCase()}`;
            return (
              <label
                key={key}
                className="flex items-center gap-2 text-sm dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(key)}
                  onChange={() => handleCheckboxChange(action)}
                  className="accent-violet-500 h-4 w-4"
                />
                {action}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
