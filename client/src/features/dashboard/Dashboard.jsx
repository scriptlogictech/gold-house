
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  FileSpreadsheet,
  House,
  RefreshCw,
  ReceiptText,
  Users,
  UserRound,
} from "lucide-react";

import crmApi from "../../services/crmApi";
import "./Dashboard.css";

const formatCurrency = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((Number(paise) || 0) / 100);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getName = (customer) =>
  customer?.name || "Unknown customer";

const getInvoiceAmountPaise = (invoice) =>
  Number(invoice?.totalAmountPaise) || 0;

const getInvoiceStatus = (status) =>
  String(status || "unknown").toLowerCase();

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Unable to load dashboard information.";

export default function Dashboard() {
  const [data, setData] = useState({
    customers: [],
    families: [],
    invoices: [],
    customerCount: 0,
    familyCount: 0,
    invoiceCount: 0,
    loading: true,
    error: "",
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setData((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));
    }

    try {
      const [customerResponse, familyResponse, invoiceResponse] =
        await Promise.all([
          crmApi.get("/customers", {
            params: { page: 1, limit: 5, sort: "newest" },
          }),
          crmApi.get("/families", {
            params: { page: 1, limit: 1 },
          }),
          crmApi.get("/invoices", {
            params: { page: 1, limit: 100 },
          }),
        ]);

      const customers = customerResponse.data?.data || [];
      const families = familyResponse.data?.data || [];
      const invoices = invoiceResponse.data?.data || [];

      setData({
        customers,
        families,
        invoices,
        customerCount:
          Number(customerResponse.data?.pagination?.total) || 0,
        familyCount:
          Number(familyResponse.data?.pagination?.total) || 0,
        invoiceCount:
          Number(invoiceResponse.data?.pagination?.total) || 0,
        loading: false,
        error: "",
      });
    } catch (error) {
      setData((previous) => ({
        ...previous,
        loading: false,
        error: getErrorMessage(error),
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const invoiceSummary = useMemo(() => {
    return data.invoices.reduce(
      (summary, invoice) => {
        summary.billedPaise += getInvoiceAmountPaise(invoice);

        if (getInvoiceStatus(invoice.status) === "posted") {
          summary.posted += 1;
        }

        if (getInvoiceStatus(invoice.status) === "pending") {
          summary.pending += 1;
        }

        return summary;
      },
      {
        billedPaise: 0,
        posted: 0,
        pending: 0,
      }
    );
  }, [data.invoices]);

  const stats = [
    {
      label: "Total Customers",
      value: data.customerCount.toLocaleString("en-IN"),
      description: "Registered customer records",
      icon: Users,
      tone: "wine",
      path: "/admin/customers",
    },
    {
      label: "Total Families",
      value: data.familyCount.toLocaleString("en-IN"),
      description: "Registered family groups",
      icon: House,
      tone: "blue",
      path: "/admin/families",
    },
    {
      label: "Total Invoices",
      value: data.invoiceCount.toLocaleString("en-IN"),
      description: `${invoiceSummary.posted} posted in latest 100`,
      icon: ReceiptText,
      tone: "gold",
      path: "/admin/invoices",
    },
    {
      label: "Invoice Value",
      value: formatCurrency(invoiceSummary.billedPaise),
      description: "Latest 100 invoice records",
      icon: FileSpreadsheet,
      tone: "green",
      path: "/admin/invoices",
    },
  ];

  return (
    <div className="crm-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            <span />
            YOUR BUSINESS AT A GLANCE
          </span>

          <h1>Dashboard</h1>

          <p>
            An overview of customer relationships, family groups,
            and invoice activity at Gold House DSS.
          </p>
        </div>

        <div className="dashboard-date">
          <CalendarDays size={17} />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </section>

      {data.error && (
        <div className="dashboard-demo-notice" role="alert">
          <CircleAlert size={18} />

          <div>
            <strong>Dashboard data could not be loaded</strong>
            <span>{data.error}</span>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Relationship overview</h2>
            <p>Live figures retrieved from Gold House DSS.</p>
          </div>

          <button
            type="button"
            className="invoices-outline-btn"
            onClick={() => loadDashboard(true)}
            disabled={refreshing || data.loading}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "invoices-spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="dashboard-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                to={stat.path}
                className={`dashboard-stat-card tone-${stat.tone}`}
                key={stat.label}
              >
                <div className="dashboard-stat-top">
                  <span className="dashboard-stat-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                </div>

                <p className="dashboard-stat-label">{stat.label}</p>

                <div className="dashboard-stat-value">
                  {data.loading ? "—" : stat.value}
                </div>

                <div className="dashboard-stat-bottom">
                  <span>{stat.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="dashboard-middle-grid">
        <article className="dashboard-panel dashboard-activity-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Invoice overview</h2>
              <p>Summary of the latest 100 invoice records</p>
            </div>
          </div>

          <div className="dashboard-live-summary">
            <div>
              <span>Total invoice records</span>
              <strong>
                {data.loading ? "—" : data.invoiceCount}
              </strong>
            </div>

            <div>
              <span>Posted invoices</span>
              <strong>
                {data.loading ? "—" : invoiceSummary.posted}
              </strong>
            </div>

            <div>
              <span>Pending invoices</span>
              <strong>
                {data.loading ? "—" : invoiceSummary.pending}
              </strong>
            </div>

            <div>
              <span>Latest 100 invoice value</span>
              <strong>
                {data.loading
                  ? "—"
                  : formatCurrency(invoiceSummary.billedPaise)}
              </strong>
            </div>
          </div>

          <p className="dashboard-chart-footnote">
            Invoice value is calculated from the latest 100 records
            returned by the API, not the entire invoice database.
          </p>

          <Link to="/admin/invoices" className="dashboard-view-all">
            Open invoice management <ArrowRight size={15} />
          </Link>
        </article>

        <article className="dashboard-panel dashboard-quick-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Quick actions</h2>
              <p>Common staff workflows</p>
            </div>
          </div>

          <div className="dashboard-quick-list">
            <Link to="/admin/customers" className="dashboard-quick-action">
              <span className="quick-icon quick-icon-wine">
                <UserRound size={19} />
              </span>

              <span>
                <strong>Customer management</strong>
                <small>View and manage customers</small>
              </span>

              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/invoices" className="dashboard-quick-action">
              <span className="quick-icon quick-icon-gold">
                <FileSpreadsheet size={19} />
              </span>

              <span>
                <strong>Invoice management</strong>
                <small>Review invoice records</small>
              </span>

              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/families" className="dashboard-quick-action">
              <span className="quick-icon quick-icon-green">
                <House size={19} />
              </span>

              <span>
                <strong>Family memberships</strong>
                <small>Explore family groups</small>
              </span>

              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="dashboard-quick-note">
            <CircleAlert size={15} />
            <span>
              Reward rates and membership thresholds will be configured
              only after owner approval.
            </span>
          </div>
        </article>
      </section>

      <section className="dashboard-panel dashboard-customers-panel">
        <div className="dashboard-panel-header dashboard-customers-heading">
          <div>
            <h2>Recently added customers</h2>
            <p>Latest customer records from the database</p>
          </div>

          <Link to="/admin/customers" className="dashboard-view-all">
            View all customers <ArrowRight size={15} />
          </Link>
        </div>

        <div className="dashboard-table-scroll">
          <table className="dashboard-customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Category</th>
                <th>City</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {data.loading ? (
                <tr>
                  <td colSpan={6}>Loading customer records...</td>
                </tr>
              ) : data.customers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                data.customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className="dashboard-customer-name">
                        <span className="customer-avatar">
                          {getName(customer).charAt(0).toUpperCase()}
                        </span>
                        <span>{getName(customer)}</span>
                      </div>
                    </td>

                    <td>{customer.phone || "—"}</td>
                    <td>
                      <span className="customer-category-tag">
                        {customer.category || "—"}
                      </span>
                    </td>
                    <td>{customer.city || "—"}</td>
                    <td>
                      <span
                        className={`customer-status ${
                          customer.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        <span />
                        {customer.status || "Unknown"}
                      </span>
                    </td>
                    <td>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
