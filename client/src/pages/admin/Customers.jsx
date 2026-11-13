
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CirclePlus,
  Download,
  Eye,
  Filter,
  Pencil,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import "./Customers.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const customerApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const PAGE_SIZE = 8;

const CATEGORIES = [
  "Gold Buyer",
  "Diamond Buyer",
  "Silver Buyer",
  "Wedding Customer",
  "VIP",
];

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  category: "Gold Buyer",
  city: "",
  status: "Active",
  notes: "",
};

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [
      1,
      "...",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "...",
    current - 1,
    current,
    current + 1,
    "...",
    total,
  ];
}

function mapCustomer(customer) {
  return {
    mongoId: customer._id,
    id:
      customer.externalCustomerId ||
      `GHC-${String(customer._id || "").slice(-6).toUpperCase()}`,
    name: customer.name || "",
    mobile: customer.phone || "",
    email: customer.email || "",
    category: customer.category || "Gold Buyer",
    city: customer.city || "",
    status:
      customer.status === "inactive" ? "Inactive" : "Active",
    notes: customer.notes || "",
    joined: customer.createdAt || "",
    dateOfBirth: customer.dateOfBirth || "",
    gender: customer.gender || "prefer_not_to_say",
  };
}

function getErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const currentPage = Math.min(page, totalPages);
  const startIndex =
    totalCustomers === 0 ? 0 : (currentPage - 1) * PAGE_SIZE;

  const filteredCount = totalCustomers;

  const requestParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      category:
        category === "All categories" ? undefined : category,
      status:
        status === "All statuses"
          ? undefined
          : status.toLowerCase(),
      sort: sortOrder,
    }),
    [page, search, category, status, sortOrder],
  );

  const fetchCustomers = useCallback(
    async (signal) => {
      setLoading(true);
      setLoadError("");

      try {
        const [listResponse, activeResponse] = await Promise.all([
          customerApi.get("/customers", {
            params: requestParams,
            signal,
          }),
          customerApi.get("/customers", {
            params: {
              page: 1,
              limit: 1,
              status: "active",
            },
            signal,
          }),
        ]);

        const listPayload = listResponse.data;
        const activePayload = activeResponse.data;

        if (!listPayload?.success || !Array.isArray(listPayload.data)) {
          throw new Error("The server returned an unexpected customer response.");
        }

        setCustomers(listPayload.data.map(mapCustomer));
        setTotalCustomers(listPayload.pagination?.total ?? 0);
        setTotalPages(
          Math.max(1, listPayload.pagination?.totalPages ?? 1),
        );
        setActiveCount(activePayload.pagination?.total ?? 0);
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        setLoadError(
          getErrorMessage(error, "Unable to load customers."),
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [requestParams],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchCustomers(controller.signal);

    return () => controller.abort();
  }, [fetchCustomers]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function openAddModal() {
    setSelectedCustomer(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModal("form");
  }

  function openEditModal(customer) {
    setSelectedCustomer(customer);

    setForm({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
      category: customer.category || "Gold Buyer",
      city: customer.city || "",
      status: customer.status || "Active",
      notes: customer.notes || "",
    });

    setFormError("");
    setModal("form");
  }

  function openProfile(customer) {
    setSelectedCustomer(customer);
    setModal("profile");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setSelectedCustomer(null);
    setFormError("");
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const email = form.email.trim();
    const city = form.city.trim();
    const notes = form.notes.trim();

    if (!name) {
      setFormError("Please enter the customer's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (!CATEGORIES.includes(form.category)) {
      setFormError("Please select a valid customer category.");
      return;
    }

    const payload = {
      name,
      phone: mobile,
      email,
      category: form.category,
      city,
      notes,
    };

    setSaving(true);

    try {
      if (selectedCustomer) {
        if (!selectedCustomer.mongoId) {
          throw new Error("The customer record is missing its database ID.");
        }

        // Update customer details first.
        const updateResponse = await customerApi.patch(
          `/customers/${selectedCustomer.mongoId}`,
          payload,
        );

        if (!updateResponse.data?.success) {
          throw new Error(
            updateResponse.data?.message || "Customer update failed.",
          );
        }

        // Status has its own protected backend endpoint.
        const desiredStatus = form.status.toLowerCase();

        if (desiredStatus !== selectedCustomer.status.toLowerCase()) {
          const statusResponse = await customerApi.patch(
            `/customers/${selectedCustomer.mongoId}/status`,
            { status: desiredStatus },
          );

          if (!statusResponse.data?.success) {
            throw new Error(
              statusResponse.data?.message ||
                "Customer details were saved, but status could not be updated. Please reopen the record and check its status.",
            );
          }
        }

        setNotice("Customer updated successfully.");
      } else {
        const createResponse = await customerApi.post("/customers", {
          ...payload,
          status: form.status.toLowerCase(),
        });

        if (!createResponse.data?.success) {
          throw new Error(
            createResponse.data?.message || "Customer creation failed.",
          );
        }

        setNotice("Customer added successfully.");
        setPage(1);
      }

      setModal(null);
      setSelectedCustomer(null);
      setForm({ ...emptyForm });

      // Refresh server data after a successful save.
      await fetchCustomers();
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to save the customer."),
      );
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setCategory("All categories");
    setStatus("All statuses");
    setSortOrder("newest");
    setPage(1);
  }

  async function exportCsv() {
    setExporting(true);
    setNotice("");

    try {
      const exportCustomers = [];
      let exportPage = 1;
      let pagesToFetch = 1;

      // Fetch every page matching the current filters.
      do {
        const response = await customerApi.get("/customers", {
          params: {
            ...requestParams,
            page: exportPage,
            limit: 100,
          },
        });

        if (
          !response.data?.success ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error("Unexpected response while exporting customers.");
        }

        exportCustomers.push(
          ...response.data.data.map(mapCustomer),
        );

        pagesToFetch = Math.max(
          1,
          response.data.pagination?.totalPages ?? 1,
        );
        exportPage += 1;
      } while (exportPage <= pagesToFetch);

      const headers = [
        "Customer ID",
        "Name",
        "Mobile",
        "Email",
        "Category",
        "City",
        "Joined",
        "Status",
      ];

      const rows = exportCustomers.map((customer) => [
        customer.id,
        customer.name,
        customer.mobile,
        customer.email,
        customer.category,
        customer.city,
        customer.joined
          ? new Date(customer.joined).toISOString().slice(0, 10)
          : "",
        customer.status,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value ?? "").replace(/"/g, '""')}"`,
            )
            .join(","),
        )
        .join("\r\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "gold-house-customers.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setNotice(
        `Exported ${exportCustomers.length} customer records.`,
      );
    } catch (error) {
      setNotice(
        getErrorMessage(error, "Unable to export customers."),
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="customers-page">
      <div className="customers-page-heading">
        <div>
          <div className="customers-eyebrow">
            <span />
            CUSTOMER RELATIONSHIP MANAGEMENT
          </div>
          <h1>Customers</h1>
          <p>Manage customer records and relationship details.</p>
        </div>

        <button
          type="button"
          className="customers-primary-btn"
          onClick={openAddModal}
        >
          <CirclePlus size={17} />
          Add customer
        </button>
      </div>

      {notice && (
        <div className="customers-notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {loadError && (
        <div className="customers-form-error" role="alert">
          {loadError}
          <button
            type="button"
            className="customers-secondary-btn"
            onClick={() => fetchCustomers()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="customers-demo-warning">
        <span className="customers-warning-dot" />
        <div>
          <strong>Live customer records</strong>
          <span>
            Customer information is loaded from the Gold House CRM
            database. Changes are saved through the backend.
          </span>
        </div>
      </div>

      <div className="customers-summary-grid">
        <article className="customers-summary-card">
          <span className="customers-summary-icon wine">
            <Users size={20} />
          </span>
          <div>
            <p>Total customers</p>
            <strong>
              {loading && totalCustomers === 0
                ? "—"
                : totalCustomers.toLocaleString("en-IN")}
            </strong>
          </div>
        </article>

        <article className="customers-summary-card">
          <span className="customers-summary-icon green">
            <ArrowUpRight size={20} />
          </span>
          <div>
            <p>Active customers</p>
            <strong>
              {loading && totalCustomers === 0
                ? "—"
                : activeCount.toLocaleString("en-IN")}
            </strong>
          </div>
        </article>

        <article className="customers-summary-card">
          <span className="customers-summary-icon gold">
            <Filter size={20} />
          </span>
          <div>
            <p>Matching customers</p>
            <strong>
              {loading && totalCustomers === 0
                ? "—"
                : filteredCount.toLocaleString("en-IN")}
            </strong>
          </div>
        </article>
      </div>

      <section className="customers-table-panel">
        <div className="customers-table-heading">
          <div>
            <h2>Customer directory</h2>
            <p>Search and manage customer profiles.</p>
          </div>

          <button
            className="customers-export-btn"
            type="button"
            onClick={exportCsv}
            disabled={exporting || loading}
          >
            <Download size={15} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <div className="customers-filters">
          <label className="customers-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search name, ID, mobile or city..."
              value={search}
              onChange={(event) =>
                updateFilter(setSearch, event.target.value)
              }
            />
          </label>

          <label className="customers-select-wrap">
            <span className="customers-sr-only">
              Category filter
            </span>
            <select
              value={category}
              onChange={(event) =>
                updateFilter(setCategory, event.target.value)
              }
            >
              <option>All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="customers-select-wrap">
            <span className="customers-sr-only">
              Status filter
            </span>
            <select
              value={status}
              onChange={(event) =>
                updateFilter(setStatus, event.target.value)
              }
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="customers-select-wrap customers-sort-select">
            <SlidersHorizontal size={15} />
            <span className="customers-sr-only">
              Sort by date
            </span>
            <select
              value={sortOrder}
              onChange={(event) =>
                updateFilter(setSortOrder, event.target.value)
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <ChevronDown size={15} />
          </label>

          <button
            type="button"
            className="customers-reset-btn"
            onClick={clearFilters}
          >
            Reset
          </button>
        </div>

        <div className="customers-table-meta">
          <span>
            Showing{" "}
            <strong>
              {totalCustomers === 0 ? 0 : startIndex + 1}–
              {Math.min(
                startIndex + customers.length,
                totalCustomers,
              )}
            </strong>{" "}
            of <strong>{totalCustomers}</strong> results
          </span>
          <span className="customers-meta-preview">
            {loading ? "Loading..." : "Live data"}
          </span>
        </div>

        <div className="customers-table-scroll">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Mobile</th>
                <th>Category</th>
                <th>Joined date</th>
                <th>Status</th>
                <th className="customers-actions-heading">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="customers-empty-results">
                      Loading customer records...
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {customers.map((customer) => (
                    <tr key={customer.mongoId}>
                      <td>
                        <button
                          type="button"
                          className="customers-person-cell"
                          onClick={() => openProfile(customer)}
                        >
                          <span className="customers-avatar">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <strong>{customer.name}</strong>
                            <small>
                              {customer.email || "No email provided"}
                            </small>
                          </span>
                        </button>
                      </td>

                      <td className="customers-id">
                        {customer.id}
                      </td>

                      <td>{customer.mobile}</td>

                      <td>
                        <span className="customers-category">
                          {customer.category}
                        </span>
                      </td>

                      <td>{formatDate(customer.joined)}</td>

                      <td>
                        <span
                          className={`customers-status ${
                            customer.status === "Active"
                              ? "is-active"
                              : "is-inactive"
                          }`}
                        >
                          <span />
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        <div className="customers-row-actions">
                          <button
                            type="button"
                            title="View profile"
                            aria-label={`View ${customer.name}`}
                            onClick={() => openProfile(customer)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Edit customer"
                            aria-label={`Edit ${customer.name}`}
                            onClick={() => openEditModal(customer)}
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && customers.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="customers-empty-results">
                          <Search size={24} />
                          <strong>No customers found</strong>
                          <span>
                            Try changing your search or filters.
                          </span>
                          <button
                            type="button"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="customers-pagination">
          <span className="customers-pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <div className="customers-pagination-controls">
            <button
              type="button"
              aria-label="First page"
              disabled={currentPage === 1 || loading}
              onClick={() => setPage(1)}
            >
              <ArrowLeft size={15} />
              <span>First</span>
            </button>

            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1 || loading}
              onClick={() =>
                setPage((value) => Math.max(1, value - 1))
              }
            >
              <ArrowLeft size={15} />
            </button>

            {getPageNumbers(currentPage, totalPages).map(
              (number, index) =>
                number === "..." ? (
                  <span
                    className="customers-page-ellipsis"
                    key={`dots-${index}`}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    key={number}
                    className={
                      currentPage === number ? "current-page" : ""
                    }
                    aria-label={`Page ${number}`}
                    aria-current={
                      currentPage === number ? "page" : undefined
                    }
                    disabled={loading}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ),
            )}

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setPage((value) =>
                  Math.min(totalPages, value + 1),
                )
              }
            >
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              aria-label="Last page"
              disabled={currentPage === totalPages || loading}
              onClick={() => setPage(totalPages)}
            >
              <span>Last</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {modal === "form" && (
        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-form-title"
          >
            <div className="customers-modal-heading">
              <div>
                <span className="customers-eyebrow">
                  CUSTOMER DIRECTORY
                </span>
                <h2 id="customers-form-title">
                  {selectedCustomer
                    ? "Edit customer"
                    : "Add customer"}
                </h2>
                <p>Enter the customer's basic information.</p>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                aria-label="Close form"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="customers-form"
              onSubmit={handleFormSubmit}
            >
              <label>
                Full name <span>*</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  autoFocus
                  required
                  maxLength={150}
                  disabled={saving}
                />
              </label>

              <label>
                Mobile number <span>*</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      mobile: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  placeholder="10-digit mobile number"
                  required
                  disabled={saving}
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="customer@example.com"
                  maxLength={254}
                  disabled={saving}
                />
              </label>

              <label>
                Category <span>*</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  disabled={saving}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                City / town
                <input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  placeholder="Enter city or town"
                  maxLength={100}
                  disabled={saving}
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  disabled={saving}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>

              <label className="customers-full-field">
                Notes
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Optional customer notes"
                  maxLength={1000}
                  disabled={saving}
                />
              </label>

              {formError && (
                <p className="customers-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="customers-form-actions">
                <button
                  type="button"
                  className="customers-secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customers-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : selectedCustomer
                      ? "Save changes"
                      : "Add customer"}
                  {!saving && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "profile" && selectedCustomer && (
        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="customers-modal customers-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-profile-title"
          >
            <div className="customers-modal-heading">
              <div>
                <span className="customers-eyebrow">
                  CUSTOMER PROFILE
                </span>
                <h2 id="customers-profile-title">
                  Customer details
                </h2>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                aria-label="Close profile"
                onClick={closeModal}
              >
                <X size={19} />
              </button>
            </div>

            <div className="customers-profile-identity">
              <span className="customers-profile-avatar">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </span>

              <div>
                <h3>{selectedCustomer.name}</h3>
                <span>{selectedCustomer.id}</span>
              </div>

              <span
                className={`customers-status ${
                  selectedCustomer.status === "Active"
                    ? "is-active"
                    : "is-inactive"
                }`}
              >
                <span />
                {selectedCustomer.status}
              </span>
            </div>

            <div className="customers-profile-details">
              <div>
                <span>Mobile number</span>
                <strong>{selectedCustomer.mobile}</strong>
              </div>

              <div>
                <span>Email address</span>
                <strong>
                  {selectedCustomer.email || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Customer category</span>
                <strong>{selectedCustomer.category}</strong>
              </div>

              <div>
                <span>City / town</span>
                <strong>
                  {selectedCustomer.city || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Registration date</span>
                <strong>{formatDate(selectedCustomer.joined)}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {selectedCustomer.gender
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (character) =>
                      character.toUpperCase(),
                    )}
                </strong>
              </div>

              <div className="customers-profile-notes">
                <span>Notes</span>
                <strong>
                  {selectedCustomer.notes || "No notes added."}
                </strong>
              </div>
            </div>

            <div className="customers-form-actions">
              <button
                type="button"
                className="customers-secondary-btn"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="customers-primary-btn"
                onClick={() => openEditModal(selectedCustomer)}
              >
                <Pencil size={15} />
                Edit customer
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
