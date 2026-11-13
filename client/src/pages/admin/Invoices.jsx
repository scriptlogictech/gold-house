import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  ReceiptText,
  IndianRupee,
  CircleCheck,
  Clock3,
  Wallet,
  Filter,
  RefreshCw,
} from "lucide-react";
import "./Invoices.css";

// Set VITE_API_URL to your backend API root, for example:
// VITE_API_URL=http://localhost:5000/api/v1
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const formatCurrency = (rupees) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(rupees) || 0);

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

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.invoices)) return payload.invoices;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.data?.invoices)) return payload.data.invoices;
  if (Array.isArray(payload?.data?.customers)) return payload.data.customers;
  return [];
};

const getId = (value) =>
  typeof value === "string" ? value : value?._id || value?.id || "";

const getCustomerName = (customer) =>
  typeof customer === "object" && customer
    ? customer.name || customer.fullName || "Unknown customer"
    : "Unknown customer";

const getInvoiceAmount = (invoice) =>
  Number(invoice.totalAmountPaise ?? invoice.totalAmount ?? 0) /
  (invoice.totalAmountPaise !== undefined ? 100 : 1);

const getEligibleAmount = (invoice) =>
  Number(invoice.eligibleAmountPaise ?? invoice.eligibleAmount ?? 0) /
  (invoice.eligibleAmountPaise !== undefined ? 100 : 1);

const getInvoiceDescription = (invoice) => {
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  if (!items.length) return "Purchase invoice";
  const first = items[0]?.description || items[0]?.sku || "Item";
  return items.length > 1 ? `${first} + ${items.length - 1} more` : first;
};

const statusLabel = (status) => {
  const labels = {
    pending: "Pending",
    posted: "Posted",
    returned: "Returned",
    cancelled: "Cancelled",
  };
  return labels[String(status || "").toLowerCase()] || status || "Unknown";
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async ({ isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [invoiceResponse, customerResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/invoices?limit=1000&page=1`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_BASE_URL}/customers?limit=1000&page=1`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
      ]);

      const invoicePayload = await invoiceResponse.json().catch(() => ({}));
      const customerPayload = await customerResponse.json().catch(() => ({}));

      if (!invoiceResponse.ok) {
        throw new Error(
          invoicePayload.message ||
            invoicePayload.error ||
            `Unable to load invoices (${invoiceResponse.status}).`
        );
      }

      if (!customerResponse.ok) {
        throw new Error(
          customerPayload.message ||
            customerPayload.error ||
            `Unable to load customers (${customerResponse.status}).`
        );
      }

      setInvoices(unwrapList(invoicePayload));
      setCustomers(unwrapList(customerPayload));
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerMap = useMemo(
    () =>
      Object.fromEntries(
        customers.map((customer) => [getId(customer), customer])
      ),
    [customers]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        const customer =
          typeof invoice.customer === "object" && invoice.customer
            ? invoice.customer
            : customerMap[getId(invoice.customer)];
        const invoiceNumber = String(
          invoice.invoiceNumber || invoice.id || ""
        );
        const description = getInvoiceDescription(invoice);
        const phone = String(customer?.phone || "");
        const customerName = getCustomerName(customer);
        const status = String(invoice.status || "").toLowerCase();
        const source = String(invoice.source || "");

        const matchesSearch =
          !query ||
          invoiceNumber.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          customerName.toLowerCase().includes(query) ||
          phone.includes(query) ||
          source.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || status === statusFilter.toLowerCase();
        const matchesSource = sourceFilter === "All" || source === sourceFilter;

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.invoiceDate || a.createdAt) -
            new Date(b.invoiceDate || b.createdAt);
        }
        if (sortOrder === "highest") {
          return getInvoiceAmount(b) - getInvoiceAmount(a);
        }
        return (
          new Date(b.invoiceDate || b.createdAt) -
          new Date(a.invoiceDate || a.createdAt)
        );
      });
  }, [invoices, search, statusFilter, sourceFilter, sortOrder, customerMap]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + pageSize
  );

  const totalBilled = invoices.reduce(
    (sum, invoice) => sum + getInvoiceAmount(invoice),
    0
  );
  const totalEligible = invoices.reduce(
    (sum, invoice) => sum + getEligibleAmount(invoice),
    0
  );
  const postedCount = invoices.filter(
    (invoice) => String(invoice.status).toLowerCase() === "posted"
  ).length;
  const pendingCount = invoices.filter(
    (invoice) => String(invoice.status).toLowerCase() === "pending"
  ).length;

  const getCustomerForInvoice = (invoice) =>
    typeof invoice.customer === "object" && invoice.customer
      ? invoice.customer
      : customerMap[getId(invoice.customer)];

  const exportCsv = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Invoice Number",
        "Customer",
        "Phone",
        "Invoice Date",
        "Source",
        "Total Amount (INR)",
        "Eligible Amount (INR)",
        "Status",
      ],
      ...filteredInvoices.map((invoice) => {
        const customer = getCustomerForInvoice(invoice);
        return [
          invoice.invoiceNumber || invoice.id,
          getCustomerName(customer),
          customer?.phone || "",
          invoice.invoiceDate || "",
          invoice.source || "",
          getInvoiceAmount(invoice),
          getEligibleAmount(invoice),
          statusLabel(invoice.status),
        ];
      }),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gold-house-invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const sources = useMemo(
    () => [...new Set(invoices.map((invoice) => invoice.source).filter(Boolean))],
    [invoices]
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= safePage - 1 && page <= safePage + 1)
      ) {
        pages.push(page);
      } else if (page === safePage - 2 || page === safePage + 2) {
        pages.push("...");
      }
    }
    return pages.filter(
      (item, index) => item !== "..." || pages[index - 1] !== "..."
    );
  };

  return (
    <div className="invoices-page">
      <div className="invoices-page-header">
        <div>
          <div className="invoices-eyebrow">
            CUSTOMER RELATIONSHIP MANAGEMENT
          </div>
          <h1>Invoice Management</h1>
          <p>Review imported invoices and purchase records from the database.</p>
        </div>
        <button
          className="invoices-outline-btn"
          onClick={() => loadData({ isRefresh: true })}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "invoices-spinning" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="invoices-stats-grid">
        <div className="invoices-stat-card">
          <div className="invoices-stat-icon wine">
            <ReceiptText size={21} />
          </div>
          <div>
            <span>Total Invoices</span>
            <strong>{loading ? "—" : invoices.length}</strong>
            <small>Records returned by the API</small>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-icon blue">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>Total Billed</span>
            <strong>{loading ? "—" : formatCurrency(totalBilled)}</strong>
            <small>Sum of invoice totals</small>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-icon green">
            <CircleCheck size={21} />
          </div>
          <div>
            <span>Posted Invoices</span>
            <strong>{loading ? "—" : postedCount}</strong>
            <small>Invoices marked posted</small>
          </div>
        </div>
        <div className="invoices-stat-card">
          <div className="invoices-stat-icon gold">
            <Wallet size={21} />
          </div>
          <div>
            <span>Eligible Purchase Value</span>
            <strong>{loading ? "—" : formatCurrency(totalEligible)}</strong>
            <small>{pendingCount} pending invoices</small>
          </div>
        </div>
      </div>

      <section className="invoices-content-card">
        <div className="invoices-content-heading">
          <div>
            <h2>Invoice Records</h2>
            <p>Invoice records currently stored in Gold House DSS.</p>
          </div>
          <button
            className="invoices-outline-btn"
            onClick={exportCsv}
            disabled={loading || filteredInvoices.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="invoices-form-error" role="alert">
            <strong>Could not load invoice data.</strong>
            <p>{error}</p>
            <small>
              Check that the backend is running, VITE_API_URL points to the
              /api/v1 endpoint, and your staff/admin session is authenticated.
            </small>
            <button
              className="invoices-outline-btn"
              onClick={() => loadData({ isRefresh: true })}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        )}

        <div className="invoices-toolbar">
          <div className="invoices-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              placeholder="Search invoice, customer, item, or source..."
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <label className="invoices-select-wrap">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All invoice statuses</option>
              <option value="pending">Pending</option>
              <option value="posted">Posted</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="invoices-select-wrap">
            <select
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All billing sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="invoices-select-wrap">
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>

        <div className="invoices-table-wrap">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Purchase</th>
                <th>Total Amount</th>
                <th>Eligible Amount</th>
                <th>Invoice Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                !error &&
                visibleInvoices.map((invoice) => {
                  const customer = getCustomerForInvoice(invoice);
                  const status = String(invoice.status || "unknown").toLowerCase();
                  const invoiceId = getId(invoice);
                  return (
                    <tr key={invoiceId || invoice.invoiceNumber}>
                      <td>
                        <strong className="invoices-number">
                          {invoice.invoiceNumber || invoiceId || "—"}
                        </strong>
                      </td>
                      <td>
                        <div className="invoices-customer-cell">
                          <span className="invoices-avatar">
                            {getCustomerName(customer).charAt(0)}
                          </span>
                          <div>
                            <strong>{getCustomerName(customer)}</strong>
                            <span>{customer?.phone || "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(invoice.invoiceDate)}</td>
                      <td>
                        <span className="invoices-description">
                          {getInvoiceDescription(invoice)}
                        </span>
                      </td>
                      <td>
                        <strong className="invoices-amount">
                          {formatCurrency(getInvoiceAmount(invoice))}
                        </strong>
                      </td>
                      <td>
                        <strong className="invoices-balance-clear">
                          {formatCurrency(getEligibleAmount(invoice))}
                        </strong>
                      </td>
                      <td>
                        <span className={`invoices-status ${status}`}>
                          <span />
                          {statusLabel(invoice.status)}
                        </span>
                      </td>
                      <td>
                        <div className="invoices-row-actions">
                          <button
                            title="View invoice"
                            aria-label={`View ${invoice.invoiceNumber || invoiceId}`}
                            onClick={() => setViewingInvoice(invoice)}
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {loading && (
                <tr>
                  <td colSpan="8">
                    <div className="invoices-empty-state">
                      <Clock3 size={30} />
                      <strong>Loading invoices...</strong>
                      <span>Fetching records from the Gold House DSS API.</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && visibleInvoices.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="invoices-empty-state">
                      <ReceiptText size={32} />
                      <strong>
                        {invoices.length === 0
                          ? "No invoices in the database yet"
                          : "No invoices found"}
                      </strong>
                      <span>
                        {invoices.length === 0
                          ? "Invoices will appear here after a billing import is confirmed."
                          : "Try changing your search or filters."}
                      </span>
                      <button
                        className="invoices-outline-btn"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                          setSourceFilter("All");
                          setCurrentPage(1);
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="invoices-table-footer">
          <span>
            Showing {filteredInvoices.length ? startIndex + 1 : 0}–
            {Math.min(startIndex + pageSize, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} invoices
          </span>
          <div className="invoices-pagination">
            <label>
              Rows
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <button
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft size={17} />
            </button>
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span className="invoices-ellipsis" key={`ellipsis-${index}`}>
                  …
                </span>
              ) : (
                <button
                  key={page}
                  className={safePage === page ? "current-page" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              aria-label="Next page"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {viewingInvoice && (
        <div
          className="invoices-modal-backdrop"
          onMouseDown={() => setViewingInvoice(null)}
        >
          <section
            className="invoices-modal invoices-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoices-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="invoices-modal-header">
              <div>
                <span className="invoices-modal-eyebrow">
                  {viewingInvoice.invoiceNumber || getId(viewingInvoice)}
                </span>
                <h2 id="invoices-detail-title">Invoice Details</h2>
                <p>Details loaded from the Gold House DSS database.</p>
              </div>
              <button
                className="invoices-close-btn"
                onClick={() => setViewingInvoice(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="invoices-detail-body">
              <div className="invoices-detail-top">
                <div className="invoices-detail-logo">
                  <ReceiptText size={22} />
                </div>
                <div>
                  <h3>GOLD HOUSE</h3>
                  <span>Invoice Record</span>
                </div>
                <span
                  className={`invoices-status ${String(
                    viewingInvoice.status || "unknown"
                  ).toLowerCase()}`}
                >
                  <span />
                  {statusLabel(viewingInvoice.status)}
                </span>
              </div>

              <div className="invoices-detail-divider" />

              <div className="invoices-detail-grid">
                <div>
                  <span>Invoice Number</span>
                  <strong>{viewingInvoice.invoiceNumber || getId(viewingInvoice) || "—"}</strong>
                </div>
                <div>
                  <span>Invoice Date</span>
                  <strong>{formatDate(viewingInvoice.invoiceDate)}</strong>
                </div>
                <div>
                  <span>Customer</span>
                  <strong>{getCustomerName(getCustomerForInvoice(viewingInvoice))}</strong>
                </div>
                <div>
                  <span>Contact Number</span>
                  <strong>{getCustomerForInvoice(viewingInvoice)?.phone || "—"}</strong>
                </div>
                <div>
                  <span>Billing Source</span>
                  <strong>{viewingInvoice.source || "—"}</strong>
                </div>
                <div>
                  <span>Source Invoice ID</span>
                  <strong>{viewingInvoice.sourceInvoiceId || "—"}</strong>
                </div>
              </div>

              <div className="invoices-detail-purchase">
                <div className="invoices-detail-purchase-heading">
                  <span>Purchase description</span>
                  <span>Amount</span>
                </div>
                {(viewingInvoice.lineItems || []).length ? (
                  viewingInvoice.lineItems.map((item, index) => (
                    <div
                      className="invoices-detail-purchase-row"
                      key={`${item.sku || item.description || "item"}-${index}`}
                    >
                      <strong>{item.description || item.sku || "Item"}</strong>
                      <strong>
                        {formatCurrency(
                          Number(item.amountPaise ?? item.amount ?? 0) /
                            (item.amountPaise !== undefined ? 100 : 1)
                        )}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div className="invoices-detail-purchase-row">
                    <strong>No line-item details provided</strong>
                    <strong>{formatCurrency(getInvoiceAmount(viewingInvoice))}</strong>
                  </div>
                )}
              </div>

              <div className="invoices-detail-payment">
                <div>
                  <span>Total Amount</span>
                  <strong>{formatCurrency(getInvoiceAmount(viewingInvoice))}</strong>
                </div>
                <div>
                  <span>Eligible Amount</span>
                  <strong className="invoices-paid-amount">
                    {formatCurrency(getEligibleAmount(viewingInvoice))}
                  </strong>
                </div>
                <div>
                  <span>Invoice Status</span>
                  <strong>{statusLabel(viewingInvoice.status)}</strong>
                </div>
                <div>
                  <span>Currency</span>
                  <strong>{viewingInvoice.currency || "INR"}</strong>
                </div>
              </div>

              <p className="invoices-demo-note">
                Payment collected, payment method, and balance due are not
                available in the current invoice API model. They are not
                estimated or shown as sample values.
              </p>
            </div>

            <div className="invoices-modal-footer">
              <button
                className="invoices-outline-btn"
                onClick={() => setViewingInvoice(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
