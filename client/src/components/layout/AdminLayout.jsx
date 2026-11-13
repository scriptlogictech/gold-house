
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Award,
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  Crown,
  Gem,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  Share2,
  Users,
  X,
} from "lucide-react";

import { crmNavigation } from "../../data/crmMockData";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const iconMap = {
  LayoutDashboard,
  Users,
  House,
  Share2,
  ReceiptText,
  Award,
  Crown,
  Bell,
  ChartNoAxesCombined,
  ShieldCheck,
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, isAdmin } = useAuth();

  const visibleNavigation = crmNavigation.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => item.path !== "/admin/staff" || isAdmin
    ),
  }));

  const allItems = visibleNavigation.flatMap(
    (section) => section.items
  );

  const currentPage =
    allItems.find((item) => item.path === location.pathname) || {
      label: "CRM Workspace",
      path: "/admin/dashboard",
    };

  const displayName = user?.name || "CRM User";
  const roleLabel =
    user?.role === "admin" ? "Administrator" : "Staff Member";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setProfileOpen(false);

      await logout();

      navigate("/admin/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="crm-app">
      {sidebarOpen && (
        <button
          type="button"
          className="crm-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`crm-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="crm-brand">
          <div className="crm-brand-mark">
            <Gem size={23} strokeWidth={1.5} />
          </div>

          <div className="crm-brand-copy">
            <span className="crm-brand-name">GOLD HOUSE</span>
            <span className="crm-brand-subtitle">
              DSS · CUSTOMER CRM
            </span>
          </div>

          <button
            type="button"
            className="crm-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="crm-workspace-label">
          <span className="crm-status-dot" />
          STAFF WORKSPACE
        </div>

        <nav className="crm-navigation" aria-label="CRM navigation">
          {visibleNavigation.map((section) => (
            <div className="crm-nav-section" key={section.label}>
              <p className="crm-nav-heading">{section.label}</p>

              {section.items.map((item) => {
                const Icon = iconMap[item.icon];

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `crm-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {Icon && <Icon size={18} strokeWidth={1.7} />}

                    <span>{item.label}</span>

                    {item.label === "Customers" && (
                      <span className="crm-nav-tag">CRM</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="crm-sidebar-bottom">
          <div className="crm-help-card">
            <div className="crm-help-icon">
              <Gem size={19} />
            </div>

            <strong>Gold House DSS</strong>

            <p>
              Customer relationships, thoughtfully managed.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="crm-nav-link crm-settings-link"
              onClick={() => navigate("/admin/staff")}
            >
              <Settings size={18} strokeWidth={1.7} />
              <span>Settings & access</span>
            </button>
          )}

          <div className="crm-sidebar-footer">
            <span>GOLD HOUSE DSS</span>
            <span>Version 1.0</span>
          </div>
        </div>
      </aside>

      <div className="crm-main">
        <header className="crm-topbar">
          <div className="crm-topbar-left">
            <button
              type="button"
              className="crm-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="crm-page-context">
              <div className="crm-breadcrumb">
                <span>Gold House DSS</span>
                <span>/</span>
                <strong>{currentPage.label}</strong>
              </div>

              <span className="crm-context-caption">
                Customer Loyalty & Relationship Management
              </span>
            </div>
          </div>

          <div className="crm-topbar-actions">
            <span className="crm-preview-badge">
              <span />
              Authenticated
            </span>

            <button
              type="button"
              className="crm-topbar-icon"
              aria-label="Notifications"
              onClick={() => navigate("/admin/notifications")}
            >
              <Bell size={19} />
              <span className="crm-notification-dot" />
            </button>

            <div className="crm-profile-wrap">
              <button
                type="button"
                className="crm-profile-button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                <span className="crm-avatar">{avatarLetter}</span>

                <span className="crm-profile-copy">
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </span>

                <ChevronDown size={15} />
              </button>

              {profileOpen && (
                <div className="crm-profile-menu">
                  <div className="crm-profile-menu-info">
                    <strong>{displayName}</strong>
                    <span>{user?.email}</span>
                    <span>{roleLabel}</span>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin/staff");
                      }}
                    >
                      <Settings size={16} />
                      Staff & access
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="crm-page-content">
          <Outlet />
        </main>

        <footer className="crm-main-footer">
          <span>GOLD HOUSE DSS</span>
          <span>Staff CRM · Secure workspace</span>
        </footer>
      </div>
    </div>
  );
}
