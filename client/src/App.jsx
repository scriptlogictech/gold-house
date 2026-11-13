
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/public/Home";
import Collections from "./pages/public/Collections";
import ProductDetails from "./pages/public/ProductDetails";
import Contact from "./pages/public/Contact";
import About from "./pages/public/About";

import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./features/dashboard/Dashboard";
import Customers from "./pages/admin/Customers";
import Families from "./pages/admin/Families";
import Referrals from "./pages/admin/Referrals";
import Invoices from "./pages/admin/Invoices";
import Rewards from "./pages/admin/Rewards";
import Memberships from "./pages/admin/Memberships";
import Notifications from "./pages/admin/Notifications";
import Reports from "./pages/admin/Reports";
import Staff from "./pages/admin/Staff";
import Products from "./pages/admin/Products";
import Login from "./pages/admin/Login";

import { AuthProvider } from "./context/AuthContext";

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
      <p style={{ color: "#6b1020", letterSpacing: "2px", fontSize: "11px" }}>
        GOLD HOUSE DSS
      </p>

      <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
        {title}
      </h1>

      <p style={{ color: "#77736e" }}>
        This page will be implemented in the next development phase.
      </p>

      <a href="/" style={{ color: "#6b1020" }}>
        ← Back to homepage
      </a>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public jewellery website */}
      <Route path="/" element={<Home />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/wishlist"
        element={<ComingSoon title="Your Wishlist" />}
      />

      {/* Staff login */}
      <Route path="/admin/login" element={<Login />} />

      {/* All authenticated CRM routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="families" element={<Families />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />

          {/* Staff management is admin-only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="staff" element={<Staff />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
