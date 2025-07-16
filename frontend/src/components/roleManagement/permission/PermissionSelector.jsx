const defaultActions = ["View", "Update", "Delete", "Approve"];

export default function PermissionSelector({
  module,
  permissions,
  onChange,
  actions = defaultActions,
}) {
  const handleCheckboxChange = (action) => {
    const key = `${module}:${action.toLowerCase()}`;
    const updated = permissions.includes(key)
      ? permissions.filter((p) => p !== key)
      : [...permissions, key];
    onChange(updated);
  };

  return (
    <div className="border p-4 rounded-md mb-3">
      <h3 className="font-semibold mb-2 text-sm text-gray-800 dark:text-white">
        {module}
      </h3>
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
                className="accent-violet-400"
              />
              {action}
            </label>
          );
        })}
      </div>
    </div>
  );
}
