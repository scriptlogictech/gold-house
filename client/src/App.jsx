
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/public/Home";

function ComingSoon({ title }) {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeContent: "center",
        padding: "32px 20px",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ color: "#3024b9", letterSpacing: "2px", fontSize: "11px" }}>
        GOLD HOUSE DSS
      </p>

      <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
        {title}
      </h1>

      <p style={{ color: "#77736e" }}>
        This page will be implemented in the next development phase.
      </p>

      <a href="/" style={{ color: "#3024b9" }}>
        ← Back to homepage
      </a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public website */}
        <Route path="/" element={<Home />} />

        <Route
          path="/collections"
          element={<ComingSoon title="Explore Collections" />}
        />

        <Route
          path="/products/:id"
          element={<ComingSoon title="Jewellery Details" />}
        />

        <Route
          path="/wishlist"
          element={<ComingSoon title="Your Wishlist" />}
        />

        <Route
          path="/about"
          element={<ComingSoon title="Our Story" />}
        />

        <Route
          path="/contact"
          element={<ComingSoon title="Contact Gold House DSS" />}
        />

        {/* Staff CRM */}
        <Route
          path="/admin/login"
          element={<ComingSoon title="Staff Login" />}
        />

        <Route
          path="/admin/dashboard"
          element={<ComingSoon title="CRM Dashboard" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
