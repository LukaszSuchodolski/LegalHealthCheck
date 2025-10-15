/* eslint-disable react/prop-types */
// src/components/Loader.jsx

export default function Loader({ label = "Ładowanie...", size = 16 }) {
  return (
    <div className="flex items-center gap-2 p-6" role="status" aria-live="polite" aria-busy="true">
      <span
        style={{
          width: size,
          height: size,
          border: "2px solid #cbd5e1",
          borderTopColor: "#0f172a",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 1s linear infinite",
        }}
      />
      <span>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

