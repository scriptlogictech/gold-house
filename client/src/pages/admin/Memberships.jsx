
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  Crown,
  Users,
  CalendarDays,
  Award,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock3,
  Ban,
} from "lucide-react";
import "./Memberships.css";

const initialMemberships = [
  {
    id: "MEM-1001",
    customer: "Priya Sharma",
    phone: "9876543210",
    plan: "Gold Elite",
    startDate: "2026-01-15",
    expiryDate: "2027-01-14",
    points: 1250,
    status: "Active",
    benefits: "Priority service, exclusive offers",
  },
  {
    id: "MEM-1002",
    customer: "Ananya Singh",
    phone: "9876543211",
    plan: "Silver",
    startDate: "2025-11-01",
    expiryDate: "2026-10-31",
    points: 480,
    status: "Active",
    benefits: "Special member offers",
  },
  {
    id: "MEM-1003",
    customer: "Neha Kumari",
    phone: "9876543212",
    plan: "Diamond Privilege",
    startDate: "2025-04-01",
    expiryDate: "2026-03-31",
    points: 2850,
    status: "Expired",
    benefits: "Priority service, premium offers",
  },
  {
    id: "MEM-1004",
    customer: "Rahul Verma",
    phone: "9876543213",
    plan: "Gold Elite",
    startDate: "2026-08-10",
    expiryDate: "2027-08-09",
    points: 920,
    status: "Active",
    benefits: "Priority service, exclusive offers",
  },
  {
    id: "MEM-1005",
    customer: "Kavita Devi",
    phone: "9876543214",
    plan: "Silver",
    startDate: "2026-02-12",
    expiryDate: "2027-02-11",
    points: 350,
    status: "Active",
    benefits: "Special member offers",
  },
  {
    id: "MEM-1006",
    customer: "Amit Kumar",
    phone: "9876543215",
    plan: "Gold Elite",
    startDate: "2026-06-20",
    expiryDate: "2027-06-19",
    points: 1750,
    status: "Suspended",
    benefits: "Priority service, exclusive offers",
  },
  {
    id: "MEM-1007",
    customer: "Pooja Gupta",
    phone: "9876543216",
    plan: "Diamond Privilege",
    startDate: "2026-09-01",
    expiryDate: "2027-08-31",
    points: 3100,
    status: "Active",
    benefits: "Priority service, premium offers",
  },
  {
    id: "MEM-1008",
    customer: "Rohit Raj",
    phone: "9876543217",
    plan: "Silver",
    startDate: "2025-08-01",
    expiryDate: "2026-07-31",
    points: 200,
    status: "Expired",
    benefits: "Special member offers",
  },
];

const emptyForm = {
  customer: "",
  phone: "",
  plan: "Silver",
  startDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  points: "0",
  status: "Active",
  benefits: "Special member offers",
};

const planBenefits = {
  Silver: "Special member offers",
  "Gold Elite": "Priority service, exclusive offers",
  "Diamond Privilege": "Priority service, premium offers",
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExpiryStatus = (membership) => {
  if (membership.status === "Suspended") return "Suspended";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${membership.expiryDate}T00:00:00`);

  if (!membership.expiryDate || expiry < today) return "Expired";

  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 30) return "Expiring Soon";
  return "Active";
};

export default function Memberships() {
  const [memberships, setMemberships] = useState(initialMemberships);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modal, setModal] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const enrichedMemberships = useMemo(
    () =>
      memberships.map((membership) => ({
        ...membership,
        effectiveStatus: getExpiryStatus(membership),
      })),
    [memberships]
  );

  const stats = useMemo(() => {
    const active = enrichedMemberships.filter(
      (item) => item.effectiveStatus === "Active"
    ).length;
    const expiring = enrichedMemberships.filter(
      (item) => item.effectiveStatus === "Expiring Soon"
    ).length;
    const expired = enrichedMemberships.filter(
      (item) => item.effectiveStatus === "Expired"
    ).length;

    return {
      total: memberships.length,
      active,
      expiring,
      expired,
    };
  }, [memberships, enrichedMemberships]);

  const filteredMemberships = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = enrichedMemberships.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.id,
          item.customer,
          item.phone,
          item.plan,
        ].some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || item.effectiveStatus === statusFilter;

      const matchesPlan = planFilter === "All" || item.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "customer") return a.customer.localeCompare(b.customer);
      if (sortBy === "expiry") return a.expiryDate.localeCompare(b.expiryDate);
      if (sortBy === "points") return b.points - a.points;
      return b.startDate.localeCompare(a.startDate);
    });

    return result;
  }, [enrichedMemberships, search, statusFilter, planFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMemberships.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleMemberships = filteredMemberships.slice(
    startIndex,
    startIndex + pageSize
  );

  const updateField = (field, value) => {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "plan") {
        updated.benefits = planBenefits[value];
      }

      return updated;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      startDate: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setModal("form");
  };

  const openEdit = (membership) => {
    setEditingId(membership.id);
    setForm({
      customer: membership.customer,
      phone: membership.phone,
      plan: membership.plan,
      startDate: membership.startDate,
      expiryDate: membership.expiryDate,
      points: String(membership.points),
      status: membership.status,
      benefits: membership.benefits,
    });
    setError("");
    setModal("form");
  };

  const saveMembership = (event) => {
    event.preventDefault();
    setError("");

    const customer = form.customer.trim();
    const phone = form.phone.replace(/\D/g, "");

    if (!customer) {
      setError("Please enter the customer name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!form.startDate || !form.expiryDate) {
      setError("Please select both membership dates.");
      return;
    }

    if (form.expiryDate < form.startDate) {
      setError("Expiry date must be after the start date.");
      return;
    }

    const duplicatePhone = memberships.some(
      (item) => item.phone === phone && item.id !== editingId
    );

    if (duplicatePhone) {
      setError("A membership with this phone number already exists.");
      return;
    }

    const points = Number(form.points);

    if (!Number.isInteger(points) || points < 0) {
      setError("Reward points must be a non-negative whole number.");
      return;
    }

    if (editingId) {
      setMemberships((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                customer,
                phone,
                points,
              }
            : item
        )
      );
    } else {
      const newMembership = {
        ...form,
        id: `MEM-${Date.now().toString().slice(-6)}`,
        customer,
        phone,
        points,
      };

      setMemberships((previous) => [newMembership, ...previous]);
      setPage(1);
    }

    setModal(null);
    setEditingId(null);
    setForm(emptyForm);
  };

  const exportCsv = () => {
    const headers = [
      "Membership ID",
      "Customer",
      "Phone",
      "Plan",
      "Start Date",
      "Expiry Date",
      "Reward Points",
      "Status",
      "Benefits",
    ];

    const rows = filteredMemberships.map((item) => [
      item.id,
      item.customer,
      item.phone,
      item.plan,
      item.startDate,
      item.expiryDate,
      item.points,
      item.effectiveStatus,
      item.benefits,
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gold-house-memberships.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const statusIcon = (status) => {
    if (status === "Active") return <CheckCircle2 size={14} />;
    if (status === "Expiring Soon") return <Clock3 size={14} />;
    if (status === "Suspended") return <Ban size={14} />;
    return <Clock3 size={14} />;
  };

  return (
    <div className="memberships-page">
      <div className="memberships-heading">
        <div>
          <span className="memberships-eyebrow">CUSTOMER RELATIONSHIPS</span>
          <h1>Memberships</h1>
          <p>Manage customer tiers, membership validity and member benefits.</p>
        </div>

        <button className="membership-primary-btn" onClick={openCreate}>
          <Plus size={17} />
          Add Membership
        </button>
      </div>

      <div className="membership-stats">
        <div className="membership-stat-card">
          <div className="membership-stat-icon burgundy">
            <Users size={20} />
          </div>
          <div>
            <span>Total Memberships</span>
            <strong>{stats.total}</strong>
            <small>All registered plans</small>
          </div>
        </div>

        <div className="membership-stat-card">
          <div className="membership-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Active Members</span>
            <strong>{stats.active}</strong>
            <small>Currently valid</small>
          </div>
        </div>

        <div className="membership-stat-card">
          <div className="membership-stat-icon amber">
            <CalendarDays size={20} />
          </div>
          <div>
            <span>Expiring Soon</span>
            <strong>{stats.expiring}</strong>
            <small>Within 30 days</small>
          </div>
        </div>

        <div className="membership-stat-card">
          <div className="membership-stat-icon rose">
            <Award size={20} />
          </div>
          <div>
            <span>Expired Members</span>
            <strong>{stats.expired}</strong>
            <small>Renewal opportunity</small>
          </div>
        </div>
      </div>

      <section className="membership-panel">
        <div className="membership-toolbar">
          <div className="membership-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search customer, phone, membership ID..."
            />
            {search && (
              <button
                className="membership-clear-search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="membership-toolbar-actions">
            <label className="membership-filter">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring soon</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>
            </label>

            <select
              className="membership-select"
              value={planFilter}
              onChange={(event) => {
                setPlanFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by membership plan"
            >
              <option value="All">All plans</option>
              <option value="Silver">Silver</option>
              <option value="Gold Elite">Gold Elite</option>
              <option value="Diamond Privilege">Diamond Privilege</option>
            </select>

            <select
              className="membership-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort memberships"
            >
              <option value="newest">Newest first</option>
              <option value="customer">Customer name</option>
              <option value="expiry">Expiry date</option>
              <option value="points">Most points</option>
            </select>

            <button className="membership-export-btn" onClick={exportCsv}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="membership-table-wrap">
          <table className="membership-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Membership ID</th>
                <th>Plan</th>
                <th>Validity</th>
                <th>Points</th>
                <th>Status</th>
                <th className="membership-action-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMemberships.map((membership) => (
                <tr key={membership.id}>
                  <td>
                    <div className="membership-member-cell">
                      <div className="membership-avatar">
                        {membership.customer
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <strong>{membership.customer}</strong>
                        <span>{membership.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="membership-id">{membership.id}</span>
                  </td>
                  <td>
                    <span className={`membership-plan plan-${membership.plan.split(" ")[0].toLowerCase()}`}>
                      <Crown size={14} />
                      {membership.plan}
                    </span>
                  </td>
                  <td>
                    <div className="membership-validity">
                      <strong>{formatDate(membership.startDate)}</strong>
                      <span>to {formatDate(membership.expiryDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="membership-points">
                      {membership.points.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`membership-status status-${membership.effectiveStatus
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {statusIcon(membership.effectiveStatus)}
                      {membership.effectiveStatus}
                    </span>
                  </td>
                  <td>
                    <div className="membership-row-actions">
                      <button
                        onClick={() => {
                          setSelectedMembership(membership);
                          setModal("details");
                        }}
                        aria-label={`View ${membership.customer}`}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(membership)}
                        aria-label={`Edit ${membership.customer}`}
                        title="Edit membership"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleMemberships.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="membership-empty">
                      <Crown size={30} />
                      <strong>No memberships found</strong>
                      <span>Try changing your search or filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="membership-pagination">
          <span>
            Showing{" "}
            {filteredMemberships.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, filteredMemberships.length)} of{" "}
            {filteredMemberships.length} memberships
          </span>

          <div className="membership-pagination-controls">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="membership-page-number">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {modal === "form" && (
        <div className="membership-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}>
          <section className="membership-modal">
            <div className="membership-modal-heading">
              <div>
                <span className="memberships-eyebrow">MEMBER RECORD</span>
                <h2>{editingId ? "Edit Membership" : "Add Membership"}</h2>
              </div>
              <button onClick={() => setModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveMembership}>
              <div className="membership-form-grid">
                <label>
                  Customer name *
                  <input
                    value={form.customer}
                    onChange={(event) => updateField("customer", event.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Mobile number *
                  <input
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    required
                  />
                </label>

                <label>
                  Membership plan *
                  <select
                    value={form.plan}
                    onChange={(event) => updateField("plan", event.target.value)}
                  >
                    <option value="Silver">Silver</option>
                    <option value="Gold Elite">Gold Elite</option>
                    <option value="Diamond Privilege">Diamond Privilege</option>
                  </select>
                </label>

                <label>
                  Status *
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                </label>

                <label>
                  Start date *
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    required
                  />
                </label>

                <label>
                  Expiry date *
                  <input
                    type="date"
                    value={form.expiryDate}
                    min={form.startDate}
                    onChange={(event) => updateField("expiryDate", event.target.value)}
                    required
                  />
                </label>

                <label>
                  Reward points
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.points}
                    onChange={(event) => updateField("points", event.target.value)}
                  />
                </label>

                <label>
                  Member benefits
                  <input
                    value={form.benefits}
                    onChange={(event) => updateField("benefits", event.target.value)}
                    placeholder="Describe benefits"
                  />
                </label>
              </div>

              {error && <p className="membership-form-error">{error}</p>}

              <div className="membership-modal-footer">
                <button
                  type="button"
                  className="membership-secondary-btn"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="membership-primary-btn">
                  {editingId ? "Save Changes" : "Create Membership"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "details" && selectedMembership && (
        <div className="membership-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}>
          <section className="membership-modal membership-details-modal">
            <div className="membership-modal-heading">
              <div>
                <span className="memberships-eyebrow">MEMBERSHIP PROFILE</span>
                <h2>{selectedMembership.customer}</h2>
              </div>
              <button onClick={() => setModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="membership-detail-plan">
              <div className="membership-detail-crown">
                <Crown size={24} />
              </div>
              <div>
                <span>Membership plan</span>
                <strong>{selectedMembership.plan}</strong>
                <small>{selectedMembership.id}</small>
              </div>
              <span className={`membership-status status-${selectedMembership.effectiveStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                {selectedMembership.effectiveStatus}
              </span>
            </div>

            <div className="membership-detail-grid">
              <div>
                <span>Mobile number</span>
                <strong>{selectedMembership.phone}</strong>
              </div>
              <div>
                <span>Reward points</span>
                <strong>{selectedMembership.points.toLocaleString("en-IN")}</strong>
              </div>
              <div>
                <span>Start date</span>
                <strong>{formatDate(selectedMembership.startDate)}</strong>
              </div>
              <div>
                <span>Expiry date</span>
                <strong>{formatDate(selectedMembership.expiryDate)}</strong>
              </div>
              <div className="membership-detail-benefits">
                <span>Member benefits</span>
                <strong>{selectedMembership.benefits || "No benefits specified"}</strong>
              </div>
            </div>

            <div className="membership-modal-footer">
              <button
                className="membership-secondary-btn"
                onClick={() => setModal(null)}
              >
                Close
              </button>
              <button
                className="membership-primary-btn"
                onClick={() => openEdit(selectedMembership)}
              >
                <Pencil size={15} />
                Edit Membership
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
