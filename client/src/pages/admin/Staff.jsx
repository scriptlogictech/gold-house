
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Pencil,
  Eye,
  X,
  Download,
  Filter,
} from "lucide-react";
import "./Staff.css";

const initialStaff = [
  {
    id: 1,
    name: "Amit Sharma",
    email: "amit@example.com",
    phone: "9876543210",
    role: "Manager",
    department: "Store Operations",
    status: "Active",
    joined: "2026-01-12",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@example.com",
    phone: "9876543211",
    role: "Sales Staff",
    department: "Sales",
    status: "Active",
    joined: "2026-02-05",
  },
  {
    id: 3,
    name: "Rahul Kumar",
    email: "rahul@example.com",
    phone: "9876543212",
    role: "Accountant",
    department: "Accounts",
    status: "Inactive",
    joined: "2025-11-18",
  },
];

const roles = [
  "Admin",
  "Manager",
  "Sales Staff",
  "Accountant",
  "Customer Relationship Staff",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "Sales Staff",
  department: "Sales",
  status: "Active",
  joined: new Date().toISOString().slice(0, 10),
};

export default function Staff() {
  const [staff, setStaff] = useState(initialStaff);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase();

    return staff
      .filter((person) => {
        const matchesSearch =
          !term ||
          [person.name, person.email, person.phone, person.department]
            .some((value) => value.toLowerCase().includes(term));

        const matchesRole =
          roleFilter === "All" || person.role === roleFilter;

        const matchesStatus =
          statusFilter === "All" || person.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [staff, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleStaff = filteredStaff.slice(
    startIndex,
    startIndex + pageSize
  );

  const activeCount = staff.filter((person) => person.status === "Active").length;
  const inactiveCount = staff.filter(
    (person) => person.status === "Inactive"
  ).length;

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function openAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setModal("form");
  }

  function openEdit(person) {
    setForm({
      name: person.name,
      email: person.email,
      phone: person.phone,
      role: person.role,
      department: person.department,
      status: person.status,
      joined: person.joined,
    });
    setEditingId(person.id);
    setError("");
    setModal("form");
  }

  function openView(person) {
    setModal({ type: "view", person });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !phone || !form.department.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const duplicate = staff.some(
      (person) =>
        person.id !== editingId &&
        (person.email.toLowerCase() === email || person.phone === phone)
    );

    if (duplicate) {
      setError("This email address or phone number is already registered.");
      return;
    }

    const record = {
      ...form,
      name,
      email,
      phone,
      department: form.department.trim(),
    };

    if (editingId !== null) {
      setStaff((previous) =>
        previous.map((person) =>
          person.id === editingId ? { ...person, ...record } : person
        )
      );
    } else {
      setStaff((previous) => [
        ...previous,
        { id: Date.now(), ...record },
      ]);
    }

    setModal(null);
  }

  function toggleStatus(person) {
    setStaff((previous) =>
      previous.map((item) =>
        item.id === person.id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Status",
      "Joined",
    ];

    const rows = filteredStaff.map((person) => [
      person.name,
      person.email,
      person.phone,
      person.role,
      person.department,
      person.status,
      person.joined,
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gold-house-staff.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="staff-page">
      <div className="staff-page-heading">
        <div>
          <span className="staff-eyebrow">TEAM ADMINISTRATION</span>
          <h1>Staff & Roles</h1>
          <p>Manage staff records and assign their workspace roles.</p>
        </div>

        <div className="staff-heading-actions">
          <button className="staff-btn staff-btn-secondary" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="staff-btn staff-btn-primary" onClick={openAdd}>
            <Plus size={17} />
            Add Staff
          </button>
        </div>
      </div>

      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-icon">
            <Users size={20} />
          </div>
          <div>
            <span>Total Staff</span>
            <strong>{staff.length}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-green">
            <UserCheck size={20} />
          </div>
          <div>
            <span>Active Staff</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-amber">
            <UserX size={20} />
          </div>
          <div>
            <span>Inactive Staff</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon staff-stat-purple">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Defined Roles</span>
            <strong>{roles.length}</strong>
          </div>
        </div>
      </div>

      <section className="staff-panel">
        <div className="staff-panel-heading">
          <div>
            <h2>Staff directory</h2>
            <p>View and manage your team members.</p>
          </div>
          <span className="staff-record-count">
            {filteredStaff.length} records
          </span>
        </div>

        <div className="staff-filters">
          <label className="staff-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) =>
                updateFilter(setSearch, event.target.value)
              }
              placeholder="Search name, email, phone..."
            />
          </label>

          <label className="staff-select-wrap">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(event) =>
                updateFilter(setRoleFilter, event.target.value)
              }
            >
              <option value="All">All roles</option>
              {roles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <select
            className="staff-select"
            value={statusFilter}
            onChange={(event) =>
              updateFilter(setStatusFilter, event.target.value)
            }
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="staff-actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStaff.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="staff-person">
                      <span className="staff-person-avatar">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <span>{person.email}</span>
                        <small>{person.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="staff-role-chip">{person.role}</span>
                  </td>
                  <td>{person.department}</td>
                  <td>
                    {person.joined
                      ? new Date(`${person.joined}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`staff-status ${
                        person.status === "Active"
                          ? "staff-status-active"
                          : "staff-status-inactive"
                      }`}
                    >
                      <span />
                      {person.status}
                    </span>
                  </td>
                  <td>
                    <div className="staff-row-actions">
                      <button
                        type="button"
                        title="View staff"
                        aria-label={`View ${person.name}`}
                        onClick={() => openView(person)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Edit staff"
                        aria-label={`Edit ${person.name}`}
                        onClick={() => openEdit(person)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        title={
                          person.status === "Active"
                            ? "Deactivate staff"
                            : "Activate staff"
                        }
                        aria-label={`Toggle status for ${person.name}`}
                        onClick={() => toggleStatus(person)}
                      >
                        {person.status === "Active" ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleStaff.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="staff-empty">
                      <Users size={30} />
                      <strong>No staff found</strong>
                      <span>Try changing your search or filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="staff-pagination">
          <span>
            Showing {filteredStaff.length ? startIndex + 1 : 0}–
            {Math.min(startIndex + pageSize, filteredStaff.length)} of{" "}
            {filteredStaff.length}
          </span>

          <div className="staff-pagination-controls">
            <select
              aria-label="Rows per page"
              className="staff-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (number) =>
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - currentPage) <= 1
              )
              .reduce((items, number, index, visiblePages) => {
                if (index > 0 && number - visiblePages[index - 1] > 1) {
                  items.push("ellipsis-" + number);
                }
                items.push(number);
                return items;
              }, [])
              .map((item) =>
                typeof item === "string" ? (
                  <span className="staff-page-ellipsis" key={item}>
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    className={item === currentPage ? "is-current" : ""}
                    onClick={() => setPage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modal === "form" && (
        <div
          className="staff-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="staff-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-form-title"
          >
            <div className="staff-modal-heading">
              <div>
                <span className="staff-eyebrow">
                  TEAM ADMINISTRATION
                </span>
                <h2 id="staff-form-title">
                  {editingId !== null ? "Edit staff member" : "Add staff member"}
                </h2>
              </div>
              <button
                type="button"
                className="staff-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="staff-form-grid">
                <label>
                  Full name *
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </label>

                <label>
                  Email address *
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="name@example.com"
                  />
                </label>

                <label>
                  Mobile number *
                  <input
                    required
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    placeholder="10-digit mobile number"
                  />
                </label>

                <label>
                  Role *
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Department *
                  <input
                    required
                    value={form.department}
                    onChange={(event) =>
                      setForm({ ...form, department: event.target.value })
                    }
                    placeholder="e.g. Sales"
                  />
                </label>

                <label>
                  Joining date
                  <input
                    type="date"
                    value={form.joined}
                    onChange={(event) =>
                      setForm({ ...form, joined: event.target.value })
                    }
                  />
                </label>

                <label>
                  Account status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {error && <p className="staff-form-error">{error}</p>}

              <div className="staff-modal-actions">
                <button
                  type="button"
                  className="staff-btn staff-btn-secondary"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="staff-btn staff-btn-primary">
                  {editingId !== null ? "Save changes" : "Add staff"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal?.type === "view" && (
        <div
          className="staff-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="staff-modal staff-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-view-title"
          >
            <div className="staff-modal-heading">
              <div>
                <span className="staff-eyebrow">STAFF PROFILE</span>
                <h2 id="staff-view-title">Staff details</h2>
              </div>
              <button
                type="button"
                className="staff-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="staff-profile-summary">
              <span className="staff-profile-avatar">
                {modal.person.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h3>{modal.person.name}</h3>
                <span>{modal.person.role}</span>
              </div>
            </div>

            <div className="staff-details-grid">
              <div>
                <span>Email</span>
                <strong>{modal.person.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{modal.person.phone}</strong>
              </div>
              <div>
                <span>Department</span>
                <strong>{modal.person.department}</strong>
              </div>
              <div>
                <span>Joining date</span>
                <strong>{modal.person.joined || "—"}</strong>
              </div>
              <div>
                <span>Account status</span>
                <strong>{modal.person.status}</strong>
              </div>
            </div>

            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-btn staff-btn-secondary"
                onClick={() => setModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="staff-btn staff-btn-primary"
                onClick={() => openEdit(modal.person)}
              >
                <Pencil size={15} />
                Edit staff
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
