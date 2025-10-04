import React from "react";

export default function Loader({ label = "Ładowanie..." }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <div aria-busy="true" aria-live="polite">{label}</div>
    </div>
  );
}
