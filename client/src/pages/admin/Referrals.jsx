
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Users,
  Gift,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Filter,
  CalendarDays,
} from "lucide-react";
import "./Referrals.css";

const customers = [
  { id: "C001", name: "Aarav Sharma", phone: "9876543210" },
  { id: "C002", name: "Priya Sharma", phone: "9876543211" },
  { id: "C003", name: "Rohan Sharma", phone: "9876543212" },
  { id: "C004", name: "Meera Verma", phone: "9876543213" },
  { id: "C005", name: "Amit Verma", phone: "9876543214" },
  { id: "C006", name: "Neha Gupta", phone: "9876543215" },
  { id: "C007", name: "Rahul Gupta", phone: "9876543216" },
  { id: "C008", name: "Ananya Singh", phone: "9876543217" },
  { id: "C009", name: "Vikram Singh", phone: "9876543218" },
  { id: "C010", name: "Kavita Patel", phone: "9876543219" },
  { id: "C011", name: "Arjun Patel", phone: "9876543220" },
  { id: "C012", name: "Sneha Das", phone: "9876543221" },
];

const initialReferrals = [
  {
    id: "REF-001",
    referrerId: "C001",
    referredId: "C004",
    date: "2026-10-02",
    status: "Rewarded",
    points: 500,
    notes: "Gold jewellery purchase completed",
  },
  {
    id: "REF-002",
    referrerId: "C002",
    referredId: "C006",
    date: "2026-10-04",
    status: "Converted",
    points: 300,
    notes: "First purchase completed; reward pending",
  },
  {
    id: "REF-003",
    referrerId: "C004",
    referredId: "C008",
    date: "2026-10-07",
    status: "Pending",
    points: 0,
    notes: "",
  },
  {
    id: "REF-004",
    referrerId: "C006",
    referredId: "C010",
    date: "2026-10-09",
    status: "Rewarded",
    points: 500,
    notes: "Referral reward issued",
  },
  {
    id: "REF-005",
    referrerId: "C008",
    referredId: "C012",
    date: "2026-10-11",
    status: "Pending",
    points: 0,
    notes: "Customer contacted the store",
  },
  {
    id: "REF-006",
    referrerId: "C010",
    referredId: "C003",
    date: "2026-10-13",
    status: "Rejected",
    points: 0,
    notes: "Duplicate referral record",
  },
  {
    id: "REF-007",
    referrerId: "C001",
    referredId: "C009",
    date: "2026-10-15",
    status: "Converted",
    points: 250,
    notes: "Purchase verified",
  },
];

const emptyForm = {
  referrerId: "",
  referredId: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Pending",
  points: "0",
  notes: "",
};

const statusOptions = ["Pending", "Converted", "Rewarded", "Rejected"];

const formatDate = (date) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatPoints = (points) =>
  new Intl.NumberFormat("en-IN").format(Number(points) || 0);

export default function Referrals() {
  const [referrals, setReferrals] = useState(initialReferrals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showForm, setShowForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  const [viewingReferral, setViewingReferral] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer])),
    []
  );

  const getCustomer = (id) => customerMap[id];

  const filteredReferrals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return referrals
      .filter((referral) => {
        const referrer = getCustomer(referral.referrerId);
        const referred = getCustomer(referral.referredId);

        const matchesSearch =
          !query ||
          referral.id.toLowerCase().includes(query) ||
          (referrer?.name || "").toLowerCase().includes(query) ||
          (referred?.name || "").toLowerCase().includes(query) ||
          (referrer?.phone || "").includes(query) ||
          (referred?.phone || "").includes(query);

        const matchesStatus =
          statusFilter === "All" || referral.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortOrder === "points") {
          return b.points - a.points;
        }
        return new Date(b.date) - new Date(a.date);
      });
  }, [referrals, search, statusFilter, sortOrder, customerMap]);

  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleReferrals = filteredReferrals.slice(
    startIndex,
    startIndex + pageSize
  );

  const pendingCount = referrals.filter((item) => item.status === "Pending").length;
  const convertedCount = referrals.filter(
    (item) => item.status === "Converted" || item.status === "Rewarded"
  ).length;
  const rewardedCount = referrals.filter(
    (item) => item.status === "Rewarded"
  ).length;
  const totalRewardPoints = referrals
    .filter((item) => item.status === "Rewarded")
    .reduce((sum, item) => sum + Number(item.points || 0), 0);

  const openAddForm = () => {
    setEditingReferral(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (referral) => {
    setEditingReferral(referral);
    setForm({
      referrerId: referral.referrerId,
      referredId: referral.referredId,
      date: referral.date,
      status: referral.status,
      points: String(referral.points),
      notes: referral.notes || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReferral(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.referrerId || !form.referredId) {
      setFormError("Select both the referring and referred customers.");
      return;
    }

    if (form.referrerId === form.referredId) {
      setFormError("A customer cannot refer themselves.");
      return;
    }

    if (!form.date) {
      setFormError("Please select a referral date.");
      return;
    }

    const duplicate = referrals.some(
      (item) =>
        item.id !== editingReferral?.id &&
        item.referrerId === form.referrerId &&
        item.referredId === form.referredId
    );

    if (duplicate) {
      setFormError(
        "This customer referral already exists. Please check the records."
      );
      return;
    }

    const points = Number(form.points);

    if (!Number.isInteger(points) || points < 0) {
      setFormError("Reward points must be a non-negative whole number.");
      return;
    }

    if (form.status === "Rewarded" && points <= 0) {
      setFormError("Enter reward points greater than zero for a rewarded referral.");
      return;
    }

    if (editingReferral) {
      setReferrals((previous) =>
        previous.map((item) =>
          item.id === editingReferral.id
            ? {
                ...item,
                ...form,
                points,
                notes: form.notes.trim(),
              }
            : item
        )
      );
    } else {
      const nextNumber =
        Math.max(
          0,
          ...referrals.map(
            (item) => Number(item.id.replace("REF-", "")) || 0
          )
        ) + 1;

      const newReferral = {
        id: `REF-${String(nextNumber).padStart(3, "0")}`,
        ...form,
        points,
        notes: form.notes.trim(),
      };

      setReferrals((previous) => [newReferral, ...previous]);
      setCurrentPage(1);
    }

    closeForm();
  };

  const exportCsv = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Referral ID",
        "Referring Customer",
        "Referrer Phone",
        "Referred Customer",
        "Referred Phone",
        "Referral Date",
        "Status",
        "Reward Points",
        "Notes",
      ],
      ...filteredReferrals.map((item) => {
        const referrer = getCustomer(item.referrerId);
        const referred = getCustomer(item.referredId);

        return [
          item.id,
          referrer?.name || "",
          referrer?.phone || "",
          referred?.name || "",
          referred?.phone || "",
          item.date,
          item.status,
          item.points,
          item.notes,
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
    link.download = "gold-house-referrals.csv";
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
      } else if (page === safePage - 2 || page === safePage + 2) {
        pages.push("...");
      }
    }

    return pages.filter(
      (item, index) => item !== "..." || pages[index - 1] !== "..."
    );
  };

  const statusClass = (status) =>
    status.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="referrals-page">
      <div className="referrals-page-header">
        <div>
          <div className="referrals-eyebrow">
            CUSTOMER RELATIONSHIP MANAGEMENT
          </div>
          <h1>Referral Management</h1>
          <p>Track customer referrals, conversions, and loyalty rewards.</p>
        </div>

        <button className="referrals-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Referral
        </button>
      </div>

      <div className="referrals-stats-grid">
        <div className="referrals-stat-card">
          <div className="referrals-stat-icon wine">
            <Users size={21} />
          </div>
          <div>
            <span>Total Referrals</span>
            <strong>{referrals.length}</strong>
            <small>All recorded referrals</small>
          </div>
        </div>

        <div className="referrals-stat-card">
          <div className="referrals-stat-icon gold">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending Referrals</span>
            <strong>{pendingCount}</strong>
            <small>Awaiting follow-up</small>
          </div>
        </div>

        <div className="referrals-stat-card">
          <div className="referrals-stat-icon green">
            <TrendingUp size={21} />
          </div>
          <div>
            <span>Converted Referrals</span>
            <strong>{convertedCount}</strong>
            <small>Converted or rewarded</small>
          </div>
        </div>

        <div className="referrals-stat-card">
          <div className="referrals-stat-icon blue">
            <Gift size={21} />
          </div>
          <div>
            <span>Points Rewarded</span>
            <strong>{formatPoints(totalRewardPoints)}</strong>
            <small>{rewardedCount} rewarded referrals</small>
          </div>
        </div>
      </div>

      <section className="referrals-content-card">
        <div className="referrals-content-heading">
          <div>
            <h2>Referral Records</h2>
            <p>Manage customer recommendations and their current status.</p>
          </div>

          <button className="referrals-outline-btn" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="referrals-toolbar">
          <div className="referrals-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              placeholder="Search referral ID or customer..."
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

          <label className="referrals-select-wrap">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="referrals-select-wrap">
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="points">Highest points</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>

        <div className="referrals-table-wrap">
          <table className="referrals-table">
            <thead>
              <tr>
                <th>Referral ID</th>
                <th>Referring Customer</th>
                <th>Referred Customer</th>
                <th>Referral Date</th>
                <th>Reward Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleReferrals.map((item) => {
                const referrer = getCustomer(item.referrerId);
                const referred = getCustomer(item.referredId);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong className="referrals-id">{item.id}</strong>
                    </td>

                    <td>
                      <div className="referrals-person">
                        <span className="referrals-avatar">
                          {(referrer?.name || "?").charAt(0)}
                        </span>
                        <div>
                          <strong>{referrer?.name || "Unknown customer"}</strong>
                          <span>{referrer?.phone || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="referrals-person">
                        <span className="referrals-avatar referred-avatar">
                          {(referred?.name || "?").charAt(0)}
                        </span>
                        <div>
                          <strong>{referred?.name || "Unknown customer"}</strong>
                          <span>{referred?.phone || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(item.date)}</td>

                    <td>
                      <strong className="referrals-points">
                        {formatPoints(item.points)} pts
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`referrals-status ${statusClass(item.status)}`}
                      >
                        <span />
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="referrals-row-actions">
                        <button
                          title="View referral"
                          aria-label={`View ${item.id}`}
                          onClick={() => setViewingReferral(item)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit referral"
                          aria-label={`Edit ${item.id}`}
                          onClick={() => openEditForm(item)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleReferrals.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="referrals-empty-state">
                      <Users size={32} />
                      <strong>No referrals found</strong>
                      <span>Try a different search or status filter.</span>
                      <button
                        className="referrals-outline-btn"
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

        <div className="referrals-table-footer">
          <span>
            Showing {filteredReferrals.length ? startIndex + 1 : 0}–
            {Math.min(startIndex + pageSize, filteredReferrals.length)} of{" "}
            {filteredReferrals.length} referrals
          </span>

          <div className="referrals-pagination">
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
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
            >
              <ChevronLeft size={17} />
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  className="referrals-ellipsis"
                  key={`ellipsis-${index}`}
                >
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
        <div
          className="referrals-modal-backdrop"
          onMouseDown={closeForm}
        >
          <section
            className="referrals-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="referrals-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="referrals-modal-header">
              <div>
                <span className="referrals-modal-eyebrow">REFERRAL RECORD</span>
                <h2 id="referrals-form-title">
                  {editingReferral ? "Edit Referral" : "Add Referral"}
                </h2>
                <p>Enter the referring and referred customer details.</p>
              </div>
              <button
                className="referrals-close-btn"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="referrals-form-body">
                <label className="referrals-field">
                  <span>Referring Customer <b>*</b></span>
                  <select
                    value={form.referrerId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        referrerId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select referring customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.phone}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="referrals-field">
                  <span>Referred Customer <b>*</b></span>
                  <select
                    value={form.referredId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        referredId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select referred customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.phone}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="referrals-form-two-columns">
                  <label className="referrals-field">
                    <span>Referral Date <b>*</b></span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          date: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="referrals-field">
                    <span>Status <b>*</b></span>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          status: event.target.value,
                          points:
                            event.target.value === "Rewarded"
                              ? Number(previous.points) > 0
                                ? previous.points
                                : "500"
                              : previous.points,
                        }))
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="referrals-field">
                  <span>Reward Points</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.points}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        points: event.target.value,
                      }))
                    }
                    placeholder="Enter points"
                  />
                  <small>
                    Points are recorded for this referral; this demo does not
                    issue actual customer rewards.
                  </small>
                </label>

                <label className="referrals-field">
                  <span>Notes <small>(Optional)</small></span>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="Add follow-up notes..."
                  />
                </label>

                {formError && (
                  <div className="referrals-form-error" role="alert">
                    {formError}
                  </div>
                )}
              </div>

              <div className="referrals-modal-footer">
                <button
                  type="button"
                  className="referrals-outline-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="referrals-primary-btn">
                  {editingReferral ? "Save Changes" : "Create Referral"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingReferral && (
        <div
          className="referrals-modal-backdrop"
          onMouseDown={() => setViewingReferral(null)}
        >
          <section
            className="referrals-modal referrals-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="referrals-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="referrals-modal-header">
              <div>
                <span className="referrals-modal-eyebrow">
                  {viewingReferral.id}
                </span>
                <h2 id="referrals-detail-title">Referral Details</h2>
                <p>Referral status and customer information.</p>
              </div>
              <button
                className="referrals-close-btn"
                onClick={() => setViewingReferral(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="referrals-detail-body">
              <div className="referrals-detail-status-row">
                <span
                  className={`referrals-status ${statusClass(
                    viewingReferral.status
                  )}`}
                >
                  <span />
                  {viewingReferral.status}
                </span>
                <strong>{formatPoints(viewingReferral.points)} reward points</strong>
              </div>

              <div className="referrals-detail-person">
                <span className="referrals-detail-icon">
                  <Users size={19} />
                </span>
                <div>
                  <small>Referring Customer</small>
                  <strong>
                    {getCustomer(viewingReferral.referrerId)?.name || "Unknown"}
                  </strong>
                  <span>
                    {getCustomer(viewingReferral.referrerId)?.phone || "—"}
                  </span>
                </div>
              </div>

              <div className="referrals-detail-person">
                <span className="referrals-detail-icon referred">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <small>Referred Customer</small>
                  <strong>
                    {getCustomer(viewingReferral.referredId)?.name || "Unknown"}
                  </strong>
                  <span>
                    {getCustomer(viewingReferral.referredId)?.phone || "—"}
                  </span>
                </div>
              </div>

              <div className="referrals-detail-date">
                <CalendarDays size={17} />
                <span>Referral date: {formatDate(viewingReferral.date)}</span>
              </div>

              {viewingReferral.notes && (
                <div className="referrals-detail-notes">
                  <strong>Notes</strong>
                  <p>{viewingReferral.notes}</p>
                </div>
              )}
            </div>

            <div className="referrals-modal-footer">
              <button
                className="referrals-outline-btn"
                onClick={() => setViewingReferral(null)}
              >
                Close
              </button>
              <button
                className="referrals-primary-btn"
                onClick={() => {
                  const referral = viewingReferral;
                  setViewingReferral(null);
                  openEditForm(referral);
                }}
              >
                <Pencil size={16} />
                Edit Referral
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
