
import { useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  ReceiptText,
  Wallet,
  Gift,
  Crown,
  Download,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import "./Reports.css";

const monthlyData = [
  { month: "May", customers: 18, invoices: 32, collections: 185000 },
  { month: "Jun", customers: 25, invoices: 41, collections: 240000 },
  { month: "Jul", customers: 22, invoices: 38, collections: 215000 },
  { month: "Aug", customers: 31, invoices: 48, collections: 295000 },
  { month: "Sep", customers: 28, invoices: 45, collections: 275000 },
  { month: "Oct", customers: 36, invoices: 56, collections: 340000 },
];

const reportRecords = [
  {
    id: "RPT-001",
    date: "2026-10-20",
    category: "Customer",
    description: "New customer registration",
    customer: "Priya Sharma",
    amount: 0,
    status: "Completed",
  },
  {
    id: "RPT-002",
    date: "2026-10-19",
    category: "Invoice",
    description: "Invoice payment recorded",
    customer: "Rahul Verma",
    amount: 25000,
    status: "Completed",
  },
  {
    id: "RPT-003",
    date: "2026-10-18",
    category: "Referral",
    description: "Customer referral received",
    customer: "Kavita Devi",
    amount: 0,
    status: "Pending",
  },
  {
    id: "RPT-004",
    date: "2026-10-17",
    category: "Rewards",
    description: "Reward points redeemed",
    customer: "Ananya Singh",
    amount: 500,
    status: "Completed",
  },
  {
    id: "RPT-005",
    date: "2026-10-16",
    category: "Membership",
    description: "Gold Elite membership created",
    customer: "Amit Kumar",
    amount: 0,
    status: "Completed",
  },
  {
    id: "RPT-006",
    date: "2026-10-15",
    category: "Invoice",
    description: "Invoice awaiting payment",
    customer: "Neha Kumari",
    amount: 12000,
    status: "Pending",
  },
  {
    id: "RPT-007",
    date: "2026-10-12",
    category: "Customer",
    description: "New customer registration",
    customer: "Pooja Gupta",
    amount: 0,
    status: "Completed",
  },
  {
    id: "RPT-008",
    date: "2026-10-10",
    category: "Referral",
    description: "Referral converted",
    customer: "Rohit Raj",
    amount: 0,
    status: "Completed",
  },
  {
    id: "RPT-009",
    date: "2026-10-08",
    category: "Invoice",
    description: "Partial invoice payment",
    customer: "Kavita Devi",
    amount: 18000,
    status: "Pending",
  },
  {
    id: "RPT-010",
    date: "2026-10-05",
    category: "Rewards",
    description: "Reward points earned",
    customer: "Priya Sharma",
    amount: 250,
    status: "Completed",
  },
  {
    id: "RPT-011",
    date: "2026-09-28",
    category: "Membership",
    description: "Membership renewed",
    customer: "Rahul Verma",
    amount: 0,
    status: "Completed",
  },
  {
    id: "RPT-012",
    date: "2026-09-20",
    category: "Invoice",
    description: "Invoice payment recorded",
    customer: "Ananya Singh",
    amount: 32000,
    status: "Completed",
  },
];

const reportCategories = [
  "All",
  "Customer",
  "Invoice",
  "Referral",
  "Rewards",
  "Membership",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    from: getLocalDate(firstDay),
    to: getLocalDate(today),
  };
};

const categoryIcon = (category) => {
  switch (category) {
    case "Customer":
      return <Users size={17} />;
    case "Invoice":
      return <ReceiptText size={17} />;
    case "Referral":
      return <TrendingUp size={17} />;
    case "Rewards":
      return <Gift size={17} />;
    case "Membership":
      return <Crown size={17} />;
    default:
      return <FileText size={17} />;
  }
};

export default function Reports() {
  const initialRange = useMemo(() => getInitialRange(), []);

  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [period, setPeriod] = useState("thisMonth");
  const [dateError, setDateError] = useState("");

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reportRecords
      .filter((item) => {
        const inDateRange =
          (!dateFrom || item.date >= dateFrom) &&
          (!dateTo || item.date <= dateTo);

        const matchesCategory =
          activeCategory === "All" || item.category === activeCategory;

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        const matchesSearch =
          !term ||
          [
            item.id,
            item.description,
            item.customer,
            item.category,
          ].some((value) => value.toLowerCase().includes(term));

        return (
          inDateRange &&
          matchesCategory &&
          matchesStatus &&
          matchesSearch
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dateFrom, dateTo, activeCategory, statusFilter, search]);

  const stats = useMemo(() => {
    const invoiceRecords = filteredRecords.filter(
      (item) => item.category === "Invoice"
    );

    const collections = invoiceRecords
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + item.amount, 0);

    const outstanding = invoiceRecords
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      records: filteredRecords.length,
      customers: filteredRecords.filter(
        (item) => item.category === "Customer"
      ).length,
      invoices: invoiceRecords.length,
      collections,
      outstanding,
      referrals: filteredRecords.filter(
        (item) => item.category === "Referral"
      ).length,
      rewards: filteredRecords
        .filter((item) => item.category === "Rewards")
        .reduce((sum, item) => sum + item.amount, 0),
      memberships: filteredRecords.filter(
        (item) => item.category === "Membership"
      ).length,
    };
  }, [filteredRecords]);

  const categoryCounts = useMemo(
    () =>
      reportCategories.reduce((counts, category) => {
        counts[category] =
          category === "All"
            ? filteredRecords.length
            : filteredRecords.filter((item) => item.category === category)
                .length;
        return counts;
      }, {}),
    [filteredRecords]
  );

  const chartData = useMemo(() => {
    const selected = monthlyData.map((item) => ({ ...item }));

    if (period === "last3") return selected.slice(-3);
    if (period === "last6") return selected;

    if (period === "thisMonth") {
      return selected.slice(-1);
    }

    return selected;
  }, [period]);

  const maxCollections = Math.max(
    ...chartData.map((item) => item.collections),
    1
  );

  const setPreset = (value) => {
    const today = new Date();
    let from;
    let to = getLocalDate(today);

    if (value === "thisMonth") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (value === "lastMonth") {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = getLocalDate(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (value === "last30") {
      from = new Date(today);
      from.setDate(today.getDate() - 29);
    } else if (value === "last90") {
      from = new Date(today);
      from.setDate(today.getDate() - 89);
    } else {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    setDateFrom(getLocalDate(from));
    setDateTo(to);
    setPeriod(value);
    setDateError("");
  };

  const applyDateRange = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError("The start date must be before or equal to the end date.");
      return;
    }

    setDateError("");
    setPeriod("custom");
  };

  const resetFilters = () => {
    const range = getInitialRange();

    setDateFrom(range.from);
    setDateTo(range.to);
    setActiveCategory("All");
    setSearch("");
    setStatusFilter("All");
    setPeriod("thisMonth");
    setDateError("");
  };

  const exportCsv = () => {
    const headers = [
      "Record ID",
      "Date",
      "Category",
      "Description",
      "Customer",
      "Amount INR",
      "Status",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((item) => [
      item.id,
      item.date,
      item.category,
      item.description,
      item.customer,
      item.amount,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gold-house-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">BUSINESS INTELLIGENCE</span>
          <h1>Reports & Analytics</h1>
          <p>
            Monitor customer activity, collections, referrals and membership
            performance.
          </p>
        </div>

        <button className="report-export-btn" onClick={exportCsv}>
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <section className="reports-filter-panel">
        <div className="reports-filter-title">
          <div className="reports-filter-icon">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2>Report period</h2>
            <p>Choose a date range to filter the activity records below.</p>
          </div>
        </div>

        <div className="reports-filter-controls">
          <label>
            From date
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPeriod("custom");
                setDateError("");
              }}
            />
          </label>

          <label>
            To date
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPeriod("custom");
                setDateError("");
              }}
            />
          </label>

          <label>
            Quick range
            <select
              value={period}
              onChange={(event) => setPreset(event.target.value)}
            >
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="last3">Last 3 months chart</option>
              <option value="last6">Last 6 months chart</option>
              <option value="custom">Custom range</option>
            </select>
          </label>

          <button
            className="report-apply-btn"
            onClick={applyDateRange}
          >
            Apply range
          </button>

          <button
            className="report-reset-btn"
            onClick={resetFilters}
            title="Reset filters"
          >
            <RefreshCw size={15} />
            Reset
          </button>
        </div>

        {dateError && <p className="report-date-error">{dateError}</p>}
      </section>

      <div className="reports-summary-grid">
        <div className="report-summary-card">
          <div className="report-summary-top">
            <span>Customers added</span>
            <div className="report-summary-icon burgundy">
              <Users size={19} />
            </div>
          </div>
          <strong>{stats.customers}</strong>
          <small>Registrations in selected records</small>
          <span className="report-summary-foot">
            <TrendingUp size={13} /> Customer activity
          </span>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-top">
            <span>Invoice records</span>
            <div className="report-summary-icon blue">
              <ReceiptText size={19} />
            </div>
          </div>
          <strong>{stats.invoices}</strong>
          <small>Invoice activity records</small>
          <span className="report-summary-foot">
            <FileText size={13} /> Billing activity
          </span>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-top">
            <span>Recorded collections</span>
            <div className="report-summary-icon green">
              <Wallet size={19} />
            </div>
          </div>
          <strong>{formatCurrency(stats.collections)}</strong>
          <small>Completed invoice records</small>
          <span className="report-summary-foot">
            <ArrowUpRight size={13} /> Recorded payments
          </span>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-top">
            <span>Pending amounts</span>
            <div className="report-summary-icon amber">
              <ReceiptText size={19} />
            </div>
          </div>
          <strong>{formatCurrency(stats.outstanding)}</strong>
          <small>Amounts marked pending</small>
          <span className="report-summary-foot warning">
            <ArrowDownRight size={13} /> Requires follow-up
          </span>
        </div>
      </div>

      <div className="reports-analytics-grid">
        <section className="report-chart-panel">
          <div className="report-panel-heading">
            <div>
              <h2>Collection overview</h2>
              <p>Illustrative monthly collection values</p>
            </div>
            <span className="report-panel-icon">
              <BarChart3 size={18} />
            </span>
          </div>

          <div className="report-chart-legend">
            <span><i className="legend-burgundy" /> Collections</span>
          </div>

          <div className="report-bar-chart">
            {chartData.map((item) => (
              <div className="report-bar-column" key={item.month}>
                <span className="report-bar-value">
                  ₹{(item.collections / 1000).toFixed(0)}k
                </span>
                <div className="report-bar-track">
                  <div
                    className="report-bar"
                    style={{
                      height: `${Math.max(
                        5,
                        (item.collections / maxCollections) * 100
                      )}%`,
                    }}
                    title={`${item.month}: ${formatCurrency(item.collections)}`}
                  />
                </div>
                <span className="report-bar-label">{item.month}</span>
              </div>
            ))}
          </div>

          <p className="report-chart-note">
            Sample chart data only. Connect the invoice collection records to
            show actual business figures.
          </p>
        </section>

        <section className="report-breakdown-panel">
          <div className="report-panel-heading">
            <div>
              <h2>Activity breakdown</h2>
              <p>Records in the selected date range</p>
            </div>
            <span className="report-panel-icon">
              <TrendingUp size={18} />
            </span>
          </div>

          <div className="report-breakdown-list">
            {[
              { label: "Customers", count: stats.customers, color: "burgundy", icon: <Users size={16} /> },
              { label: "Invoices", count: stats.invoices, color: "blue", icon: <ReceiptText size={16} /> },
              { label: "Referrals", count: stats.referrals, color: "green", icon: <TrendingUp size={16} /> },
              { label: "Rewards", count: filteredRecords.filter((item) => item.category === "Rewards").length, color: "rose", icon: <Gift size={16} /> },
              { label: "Memberships", count: stats.memberships, color: "amber", icon: <Crown size={16} /> },
            ].map((item) => {
              const percentage = stats.records
                ? (item.count / stats.records) * 100
                : 0;

              return (
                <div className="report-breakdown-item" key={item.label}>
                  <div className={`report-breakdown-icon ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="report-breakdown-content">
                    <div className="report-breakdown-label">
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <div className="report-breakdown-track">
                      <div
                        className={`report-breakdown-bar ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="report-activity-panel">
        <div className="report-activity-heading">
          <div>
            <h2>Detailed activity report</h2>
            <p>Review the records included in your report.</p>
          </div>
          <span className="report-record-count">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="report-category-tabs">
          {reportCategories.map((item) => (
            <button
              key={item}
              className={activeCategory === item ? "active" : ""}
              onClick={() => setActiveCategory(item)}
            >
              {item === "All" ? <BarChart3 size={14} /> : categoryIcon(item)}
              {item}
              <span>{categoryCounts[item] || 0}</span>
            </button>
          ))}
        </div>

        <div className="report-table-toolbar">
          <div className="report-table-search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description, customer or ID..."
              aria-label="Search report records"
            />
          </div>

          <select
            className="report-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by record status"
          >
            <option value="All">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <button className="report-table-export" onClick={exportCsv}>
            <Download size={15} />
            Export filtered
          </button>
        </div>

        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Date</th>
                <th>Activity</th>
                <th>Customer</th>
                <th>Amount / Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td><span className="report-record-id">{item.id}</span></td>
                  <td><span className="report-record-date">{formatDate(item.date)}</span></td>
                  <td>
                    <div className="report-activity-cell">
                      <span className={`report-activity-icon ${item.category.toLowerCase()}`}>
                        {categoryIcon(item.category)}
                      </span>
                      <div>
                        <strong>{item.description}</strong>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="report-customer-name">{item.customer}</span></td>
                  <td>
                    {item.amount > 0 ? (
                      <strong className="report-amount">
                        {item.category === "Rewards"
                          ? `${item.amount.toLocaleString("en-IN")} points`
                          : formatCurrency(item.amount)}
                      </strong>
                    ) : (
                      <span className="report-no-amount">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`report-status status-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="report-empty">
                      <FileText size={28} />
                      <strong>No report records found</strong>
                      <span>Change the dates or filters to see results.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="report-table-footer">
          Showing {filteredRecords.length} matching records
          <span>
            Period: {dateFrom ? formatDate(dateFrom) : "Any date"} –{" "}
            {dateTo ? formatDate(dateTo) : "Any date"}
          </span>
        </div>
      </section>
    </div>
  );
}
