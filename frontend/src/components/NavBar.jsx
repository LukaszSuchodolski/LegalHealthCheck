import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  const linkStyle = ({ isActive }) => ({
    fontWeight: isActive ? 700 : 400,
    textDecoration: "none",
    padding: "6px 8px",
  });

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <Link to="/" style={{ fontWeight: 800, textDecoration: "none" }}>
        LegalHealthCheck
      </Link>
      <NavLink to="/" style={linkStyle} end>
        Home
      </NavLink>
      <NavLink to="/checkup" style={linkStyle}>
        Checkup
      </NavLink>
      <NavLink to="/documents" style={linkStyle}>
        Documents
      </NavLink>
      <NavLink to="/results" style={linkStyle}>
        Results
      </NavLink>
    </nav>
  );
}
