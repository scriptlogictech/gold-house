
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  IndianRupee,
  UsersRound,
  Filter,
  Check,
  Phone,
  CalendarDays,
} from "lucide-react";
import "./Families.css";

const API_CONFIGURED_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const API_BASE_URL = API_CONFIGURED_URL.endsWith("/api/v1")
  ? API_CONFIGURED_URL
  : API_CONFIGURED_URL.endsWith("/api")
    ? `${API_CONFIGURED_URL}/v1`
    : `${API_CONFIGURED_URL}/api/v1`;

const emptyForm = {
  name: "",
  headId: "",
  memberIds: [],
  status: "Active",
  notes: "",
};

const getId = (value) => {
  if (value && typeof value === "object") return String(value._id || value.id || "");
  return value == null ? "" : String(value);
};

const normalizeCustomer = (customer) => ({
  ...customer,
  id: getId(customer._id || customer.id),
  name: customer.name || "Unknown customer",
  phone: customer.phone || customer.mobile || "",
  email: customer.email || "",
});

const normalizeFamily = (family) => ({
  ...family,
  id: getId(family._id || family.id),
  headId: getId(family.headId),
  memberIds: Array.isArray(family.memberIds) ? family.memberIds.map(getId).filter(Boolean) : [],
  status: String(family.status || "active").toLowerCase() === "active" ? "Active" : "Inactive",
  createdAt: family.createdAt ? String(family.createdAt).slice(0, 10) : "",
  notes: family.notes || "",
  // Purchase totals are not available until invoice integration is implemented.
  totalPurchases: null,
});

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || payload.success === false) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(payload.message || "Your session may have expired. Please log in again.");
    }
    throw new Error(payload.message || `Request failed (${response.status}).`);
  }

  return payload;
}

async function fetchAllPages(endpoint) {
  const allItems = [];
  let page = 1;
  let totalPages = 1;

  do {
    const payload = await apiRequest(`${endpoint}?page=${page}&limit=100`);
    const items = Array.isArray(payload.data) ? payload.data : [];
    allItems.push(...items);
    totalPages = Math.max(1, Number(payload.pagination?.totalPages) || 1);
    page += 1;
  } while (page <= totalPages);

  return allItems;
}



const formatDate = (date) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    setLoading(true);
    setPageError("");
    try {
      const [customerRows, familyRows] = await Promise.all([
        fetchAllPages("/customers"),
        fetchAllPages("/families"),
      ]);
      setCustomers(customerRows.map(normalizeCustomer));
      setFamilies(familyRows.map(normalizeFamily));
    } catch (error) {
      setPageError(error.message || "Unable to load family data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [viewingFamily, setViewingFamily] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const customerById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer])),
    [customers]
  );

  const getCustomer = (id) => customerById[id];

  const filteredFamilies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return families
      .filter((family) => {
        const head = getCustomer(family.headId);
        const memberNames = family.memberIds
          .map((id) => getCustomer(id)?.name || "")
          .join(" ");

        const matchesSearch =
          !query ||
          family.name.toLowerCase().includes(query) ||
          family.code.toLowerCase().includes(query) ||
          (head?.name || "").toLowerCase().includes(query) ||
          memberNames.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || family.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortOrder === "name") {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [families, search, statusFilter, sortOrder, customerById]);

  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleFamilies = filteredFamilies.slice(
    startIndex,
    startIndex + pageSize
  );

  const activeFamilies = families.filter((family) => family.status === "Active").length;
  const linkedCustomerIds = new Set(families.flatMap((family) => family.memberIds));
  const totalLinkedCustomers = linkedCustomerIds.size;

  const openAddForm = () => {
    setEditingFamily(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (family) => {
    setEditingFamily(family);
    setForm({
      name: family.name,
      headId: family.headId,
      memberIds: [...family.memberIds],
      status: family.status,
      notes: family.notes || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFamily(null);
    setForm(emptyForm);
    setFormError("");
  };

  const toggleMember = (customerId) => {
    setForm((previous) => {
      const alreadySelected = previous.memberIds.includes(customerId);
      const memberIds = alreadySelected
        ? previous.memberIds.filter((id) => id !== customerId)
        : [...previous.memberIds, customerId];

      return {
        ...previous,
        memberIds,
        headId: alreadySelected && previous.headId === customerId
          ? ""
          : previous.headId,
      };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const name = form.name.trim();

    if (!name) {
      setFormError("Please enter a family name.");
      return;
    }
    if (!form.headId) {
      setFormError("Please select a family head.");
      return;
    }
    if (!form.memberIds.includes(form.headId)) {
      setFormError("The family head must also be included as a family member.");
      return;
    }
    if (form.memberIds.length === 0) {
      setFormError("Please select at least one family member.");
      return;
    }

    const duplicateName = families.some(
      (family) => family.name.toLowerCase() === name.toLowerCase() && family.id !== editingFamily?.id
    );
    if (duplicateName) {
      setFormError("A family with this name already exists.");
      return;
    }

    const memberAssignedElsewhere = form.memberIds.find((memberId) =>
      families.some((family) => family.id !== editingFamily?.id && family.memberIds.includes(memberId))
    );
    if (memberAssignedElsewhere) {
      setFormError(`${getCustomer(memberAssignedElsewhere)?.name || "A selected customer"} already belongs to another family.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        headId: form.headId,
        memberIds: form.memberIds,
        status: form.status.toLowerCase(),
        notes: form.notes.trim(),
      };

      if (editingFamily) {
        await apiRequest(`/families/${editingFamily.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Family updated successfully.");
      } else {
        await apiRequest("/families", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Family created successfully.");
        setCurrentPage(1);
      }

      closeForm();
      await loadData();
    } catch (error) {
      setFormError(error.message || "Unable to save the family.");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Family Code",
        "Family Name",
        "Family Head",
        "Phone",
        "Members",
        "Status",
        "Created Date",
        "Purchases (invoice integration pending)",
      ],
      ...filteredFamilies.map((family) => {
        const head = getCustomer(family.headId);
        return [
          family.code,
          family.name,
          head?.name || "",
          head?.phone || "",
          family.memberIds.length,
          family.status,
          family.createdAt,
          "",
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
    link.download = "gold-house-families.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= safePage - 1 && page <= safePage + 1)
      ) {
        pages.push(page);
      } else if (
        page === safePage - 2 ||
        page === safePage + 2
      ) {
        pages.push("...");
      }
    }

    return pages.filter(
      (item, index) => item !== "..." || pages[index - 1] !== "..."
    );
  };

  return (
    <div className="families-page">
      <div className="families-page-header">
        <div>
          <div className="families-eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</div>
          <h1>Family Management</h1>
          <p>Organize customer families and manage their shared relationships.</p>
        </div>

        <button className="families-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Family
        </button>
      </div>

      {pageError && (
        <div className="families-form-error" role="alert" style={{ marginBottom: 16 }}>
          {pageError}
          <button type="button" className="families-outline-btn" onClick={loadData} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}
      {notice && !pageError && (
        <div role="status" style={{ marginBottom: 16 }}>
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" style={{ marginLeft: 8 }}>×</button>
        </div>
      )}

      <div className="families-stats-grid">
        <div className="families-stat-card">
          <div className="families-stat-icon wine">
            <UsersRound size={21} />
          </div>
          <div>
            <span>Total Families</span>
            <strong>{families.length}</strong>
            <small>All registered families</small>
          </div>
        </div>

        <div className="families-stat-card">
          <div className="families-stat-icon green">
            <Check size={21} />
          </div>
          <div>
            <span>Active Families</span>
            <strong>{activeFamilies}</strong>
            <small>Currently active</small>
          </div>
        </div>

        <div className="families-stat-card">
          <div className="families-stat-icon gold">
            <Users size={21} />
          </div>
          <div>
            <span>Linked Customers</span>
            <strong>{totalLinkedCustomers}</strong>
            <small>Unique linked customers</small>
          </div>
        </div>

        <div className="families-stat-card">
          <div className="families-stat-icon blue">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>Family Purchases</span>
            <strong>—</strong>
            <small>Invoice integration pending</small>
          </div>
        </div>
      </div>

      <section className="families-content-card">
        <div className="families-content-heading">
          <div>
            <h2>Registered Families</h2>
            <p>View, search, and update family information.</p>
          </div>

          <button className="families-outline-btn" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="families-toolbar">
          <div className="families-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              placeholder="Search family, code, head or member..."
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

          <label className="families-select-wrap">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="families-select-wrap sort-select">
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Family name A–Z</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>

        <div className="families-table-wrap">
          <table className="families-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Family Head</th>
                <th>Members</th>
                <th>Created Date</th>
                <th>Purchases</th>
                <th>Status</th>
                <th className="families-actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && visibleFamilies.map((family) => {
                const head = getCustomer(family.headId);

                return (
                  <tr key={family.id}>
                    <td>
                      <div className="families-name-cell">
                        <div className="families-avatar">
                          {family.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{family.name}</strong>
                          <span>{family.code}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="families-person-cell">
                        <strong>{head?.name || "Not assigned"}</strong>
                        <span>{head?.phone || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="families-members-cell">
                        <div className="families-mini-avatars">
                          {family.memberIds.slice(0, 3).map((id) => (
                            <span key={id}>
                              {(getCustomer(id)?.name || "?").charAt(0)}
                            </span>
                          ))}
                        </div>
                        <strong>{family.memberIds.length}</strong>
                      </div>
                    </td>

                    <td>{formatDate(family.createdAt)}</td>
                    <td className="families-money">—</td>

                    <td>
                      <span
                        className={`families-status ${
                          family.status === "Active" ? "is-active" : "is-inactive"
                        }`}
                      >
                        <span />
                        {family.status}
                      </span>
                    </td>

                    <td>
                      <div className="families-row-actions">
                        <button
                          title="View family"
                          aria-label={`View ${family.name}`}
                          onClick={() => setViewingFamily(family)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit family"
                          aria-label={`Edit ${family.name}`}
                          onClick={() => openEditForm(family)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr><td colSpan="7"><div className="families-empty-state">Loading families...</div></td></tr>
              )}

              {!loading && visibleFamilies.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="families-empty-state">
                      <Users size={32} />
                      <strong>No families found</strong>
                      <span>Try changing your search or filters.</span>
                      <button
                        className="families-outline-btn"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
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

        <div className="families-table-footer">
          <span>
            Showing {filteredFamilies.length ? startIndex + 1 : 0}– 
            {Math.min(startIndex + pageSize, filteredFamilies.length)} of{" "}
            {filteredFamilies.length} families
          </span>

          <div className="families-pagination">
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
                <span className="families-page-ellipsis" key={`ellipsis-${index}`}>
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

      {showForm && (
        <div className="families-modal-backdrop" onMouseDown={closeForm}>
          <section
            className="families-modal families-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="families-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="families-modal-header">
              <div>
                <span className="families-modal-eyebrow">FAMILY RECORD</span>
                <h2 id="families-form-title">
                  {editingFamily ? "Edit Family" : "Create New Family"}
                </h2>
                <p>
                  Add family details and select the customers to link.
                </p>
              </div>
              <button
                className="families-modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="families-form-body">
                <label className="families-field">
                  <span>Family Name <b>*</b></span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Sharma Family"
                    maxLength={80}
                    required
                  />
                </label>

                <label className="families-field">
                  <span>Family Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <div className="families-field">
                  <span>Family Members <b>*</b></span>
                  <p className="families-field-hint">
                    Select customers who belong to this family.
                  </p>

                  <div className="families-customer-picker">
                    {customers.map((customer) => {
                      const assignedToAnotherFamily = families.some(
                        (family) =>
                          family.id !== editingFamily?.id &&
                          family.memberIds.includes(customer.id)
                      );
                      const selected = form.memberIds.includes(customer.id);

                      return (
                        <label
                          key={customer.id}
                          className={`families-customer-option ${
                            selected ? "selected" : ""
                          } ${
                            assignedToAnotherFamily ? "unavailable" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={assignedToAnotherFamily}
                            onChange={() => toggleMember(customer.id)}
                          />
                          <span className="families-option-avatar">
                            {customer.name.charAt(0)}
                          </span>
                          <span className="families-option-details">
                            <strong>{customer.name}</strong>
                            <small>{customer.phone}</small>
                          </span>
                          {selected && <Check size={17} />}
                          {assignedToAnotherFamily && (
                            <small className="families-assigned-label">
                              Assigned
                            </small>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="families-field">
                  <span>Family Head <b>*</b></span>
                  <select
                    value={form.headId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        headId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select family head</option>
                    {customers
                      .filter((customer) => form.memberIds.includes(customer.id))
                      .map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.phone}
                        </option>
                      ))}
                  </select>
                  <small>
                    The family head must be one of the selected family members.
                  </small>
                </label>

                <label className="families-field">
                  <span>Notes <small>(Optional)</small></span>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Add any useful information about this family..."
                    rows={3}
                    maxLength={500}
                  />
                </label>

                {formError && (
                  <div className="families-form-error" role="alert">
                    {formError}
                  </div>
                )}
              </div>

              <div className="families-modal-footer">
                <button
                  type="button"
                  className="families-outline-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="families-primary-btn" disabled={saving}>
                  <Check size={17} />
                  {saving ? "Saving..." : editingFamily ? "Save Changes" : "Create Family"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingFamily && (
        <div
          className="families-modal-backdrop"
          onMouseDown={() => setViewingFamily(null)}
        >
          <section
            className="families-modal families-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="families-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="families-modal-header">
              <div>
                <span className="families-modal-eyebrow">
                  {viewingFamily.code}
                </span>
                <h2 id="families-details-title">{viewingFamily.name}</h2>
                <p>Family profile and linked customer details.</p>
              </div>
              <button
                className="families-modal-close"
                onClick={() => setViewingFamily(null)}
                aria-label="Close family details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="families-details-body">
              <div className="families-details-summary">
                <div>
                  <span>Family Members</span>
                  <strong>{viewingFamily.memberIds.length}</strong>
                </div>
                <div>
                  <span>Total Purchases</span>
                  <strong>Not linked</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong
                    className={
                      viewingFamily.status === "Active"
                        ? "families-detail-active"
                        : "families-detail-inactive"
                    }
                  >
                    {viewingFamily.status}
                  </strong>
                </div>
              </div>

              <div className="families-details-section-title">
                <Users size={18} />
                <h3>Family Members</h3>
              </div>

              <div className="families-detail-member-list">
                {viewingFamily.memberIds.map((id) => {
                  const customer = getCustomer(id);
                  if (!customer) return null;

                  const isHead = id === viewingFamily.headId;

                  return (
                    <div className="families-detail-member" key={id}>
                      <div className="families-detail-member-avatar">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="families-detail-member-info">
                        <strong>{customer.name}</strong>
                        <span>{isHead ? "Family Head" : "Family Member"}</span>
                      </div>
                      {isHead && (
                        <span className="families-head-badge">Head</span>
                      )}
                      <div className="families-detail-contact">
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="families-details-meta">
                <div>
                  <CalendarDays size={16} />
                  <span>Created {formatDate(viewingFamily.createdAt)}</span>
                </div>
                {viewingFamily.notes && (
                  <p>
                    <strong>Notes:</strong> {viewingFamily.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="families-modal-footer">
              <button
                className="families-outline-btn"
                onClick={() => setViewingFamily(null)}
              >
                Close
              </button>
              <button
                className="families-primary-btn"
                onClick={() => {
                  const family = viewingFamily;
                  setViewingFamily(null);
                  openEditForm(family);
                }}
              >
                <Pencil size={16} />
                Edit Family
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
