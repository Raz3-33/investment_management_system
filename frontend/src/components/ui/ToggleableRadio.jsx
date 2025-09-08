import React from "react";

export default function ToggleableRadio({
  name,
  value,
  selected,          // current selected value for this group (string | null)
  onChange,          // (nextValue: string | null) => void
  label,
  disabled = false,
  className = "",
}) {
  const isChecked = selected === value;

  const handleClick = () => {
    // If clicking the same selected radio -> clear selection (uncheck)
    if (isChecked) onChange(null);
  };

  const handleKeyDown = (e) => {
    // Space on selected clears too (keyboard accessibility)
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      if (isChecked) onChange(null);
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={() => onChange(value)} // normal select path
        onClick={handleClick}            // toggle off if already selected
        onKeyDown={handleKeyDown}
        className="h-4 w-4"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
