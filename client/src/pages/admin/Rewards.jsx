
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
  Gift,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Filter,
  CalendarDays,
  History,
  CircleDollarSign,
} from "lucide-react";
import "./Rewards.css";

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

const initialTransactions = [
  {
    id: "RWD-001",
    customerId: "C001",
    date: "2026-10-02",
    type: "Earned",
    points: 850,
    reason: "Purchase reward",
    reference: "INV-2026-001",
    notes: "Points earned on jewellery purchase",
  },
  {
    id: "RWD-002",
    customerId: "C001",
    date: "2026-10-05",
    type: "Redeemed",
    points: 200,
    reason: "Reward redemption",
    reference: "",
    notes: "Redeemed at store",
  },
  {
    id: "RWD-003",
    customerId: "C002",
    date: "2026-10-04",
    type: "Earned",
    points: 320,
    reason: "Purchase reward",
    reference: "INV-2026-002",
    notes: "",
  },
  {
    id: "RWD-004",
    customerId: "C004",
    date: "2026-10-06",
    type: "Earned",
    points: 680,
    reason: "Purchase reward",
    reference: "INV-2026-003",
    notes: "",
  },
  {
    id: "RWD-005",
    customerId: "C006",
    date: "2026-10-08",
    type: "Earned",
    points: 540,
    reason: "Purchase reward",
    reference: "INV-2026-004",
    notes: "",
  },
  {
    id: "RWD-006",
    customerId: "C006",
    date: "2026-10-10",
    type: "Redeemed",
    points: 100,
    reason: "Reward redemption",
    reference: "",
    notes: "Used points for a store reward",
  },
  {
    id: "RWD-007",
    customerId: "C008",
    date: "2026-10-10",
    type: "Earned",
    points: 85,
    reason: "Purchase reward",
    reference: "INV-2026-005",
    notes: "",
  },
  {
    id: "RWD-008",
    customerId: "C010",
    date: "2026-10-12",
    type: "Earned",
    points: 470,
    reason: "Purchase reward",
    reference: "INV-2026-006",
    notes: "",
  },
  {
    id: "RWD-009",
    customerId: "C003",
    date: "2026-10-14",
    type: "Adjustment",
    points: 50,
    reason: "Manual adjustment",
    reference: "",
    notes: "Sample adjustment",
  },
  {
    id: "RWD-010",
    customerId: "C012",
    date: "2026-10-16",
    type: "Earned",
    points: 265,
    reason: "Purchase reward",
    reference: "INV-2026-008",
    notes: "",
  },
];

const transactionTypes = ["Earned", "Redeemed", "Adjustment"];

const emptyForm = {
  customerId: "",
  date: new Date().toISOString().slice(0, 10),
  type: "Earned",
  points: "",
  reason: "",
  reference: "",
  notes: "",
};

const formatPoints = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatDate = (date) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const getSignedPoints = (transaction) => {
  const points = Number(transaction.points) || 0;

  if (transaction.type === "Redeemed") return -points;
  return points;
};

const getTypeClass = (type) => type.toLowerCase();

export default function Rewards() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer])),
    []
  );

  const getCustomer = (id) => customerMap[id];

  const customerBalances = useMemo(() => {
    const balances = {};

    customers.forEach((customer) => {
      balances[customer.id] = 0;
    });

    transactions.forEach((transaction) => {
      balances[transaction.customerId] =
        (balances[transaction.customerId] || 0) +
        getSignedPoints(transaction);
    });

    return balances;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const customer = getCustomer(transaction.customerId);

        const matchesSearch =
          !query ||
          transaction.id.toLowerCase().includes(query) ||
          (customer?.name || "").toLowerCase().includes(query) ||
          (customer?.phone || "").includes(query) ||
          transaction.reason.toLowerCase().includes(query) ||
          (transaction.reference || "").toLowerCase().includes(query);

        const matchesType =
          typeFilter === "All" || transaction.type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.date) - new Date(b.date);
        }

        if (sortOrder === "highest") {
          return Number(b.points) - Number(a.points);
        }

        return new Date(b.date) - new Date(a.date);
      });
  }, [transactions, search, typeFilter, sortOrder, customerMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  const totalEarned = transactions
    .filter((transaction) => transaction.type === "Earned")
    .reduce((sum, transaction) => sum + Number(transaction.points), 0);

  const totalRedeemed = transactions
    .filter((transaction) => transaction.type === "Redeemed")
    .reduce((sum, transaction) => sum + Number(transaction.points), 0);

  const totalBalance = Object.values(customerBalances).reduce(
    (sum, balance) => sum + balance,
    0
  );

  const customersWithPoints = Object.values(customerBalances).filter(
    (balance) => balance > 0
  ).length;

  const openAddForm = () => {
    setEditingTransaction(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (transaction) => {
    setEditingTransaction(transaction);
    setForm({
      customerId: transaction.customerId,
      date: transaction.date,
      type: transaction.type,
      points: String(transaction.points),
      reason: transaction.reason,
      reference: transaction.reference || "",
      notes: transaction.notes || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setFormError("");

    const points = Number(form.points);

    if (!form.customerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (!form.date) {
      setFormError("Please select a transaction date.");
      return;
    }

    if (!Number.isInteger(points) || points <= 0) {
      setFormError("Points must be a whole number greater than zero.");
      return;
    }

    if (!form.reason.trim()) {
      setFormError("Please enter a reason for this transaction.");
      return;
    }

    if (!transactionTypes.includes(form.type)) {
      setFormError("Please select a valid transaction type.");
      return;
    }

    const otherTransactions = transactions.filter(
      (transaction) => transaction.id !== editingTransaction?.id
    );

    const balanceBeforeTransaction = otherTransactions
      .filter((transaction) => transaction.customerId === form.customerId)
      .reduce((sum, transaction) => sum + getSignedPoints(transaction), 0);

    const signedPoints =
      form.type === "Redeemed" ? -points : points;

    const resultingBalance = balanceBeforeTransaction + signedPoints;

    if (resultingBalance < 0) {
      setFormError(
        `Insufficient points. This customer has ${formatPoints(
          balanceBeforeTransaction
        )} points available before this transaction.`
      );
      return;
    }

    const transactionData = {
      customerId: form.customerId,
      date: form.date,
      type: form.type,
      points,
      reason: form.reason.trim(),
      reference: form.reference.trim(),
      notes: form.notes.trim(),
    };

    if (editingTransaction) {
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === editingTransaction.id
            ? { ...transaction, ...transactionData }
            : transaction
        )
      );
    } else {
      const nextNumber =
        Math.max(
          0,
          ...transactions.map((transaction) => {
            const match = transaction.id.match(/RWD-(\d+)/);
            return match ? Number(match[1]) : 0;
          })
        ) + 1;

      const newTransaction = {
        id: `RWD-${String(nextNumber).padStart(3, "0")}`,
        ...transactionData,
      };

      setTransactions((previous) => [newTransaction, ...previous]);
      setCurrentPage(1);
    }

    closeForm();
  };

  const exportCsv = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Transaction ID",
        "Customer",
        "Phone",
        "Date",
        "Type",
        "Points",
        "Signed Points",
        "Balance After Transaction",
        "Reason",
        "Reference",
        "Notes",
      ],
      ...filteredTransactions.map((transaction) => {
        const customer = getCustomer(transaction.customerId);

        const balanceAfter = transactions
          .filter(
            (item) =>
              item.customerId === transaction.customerId &&
              (item.date < transaction.date ||
                (item.date === transaction.date &&
                  item.id <= transaction.id))
          )
          .reduce((sum, item) => sum + getSignedPoints(item), 0);

        return [
          transaction.id,
          customer?.name || "",
          customer?.phone || "",
          transaction.date,
          transaction.type,
          transaction.points,
          getSignedPoints(transaction),
          balanceAfter,
          transaction.reason,
          transaction.reference,
          transaction.notes,
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
    link.download = "gold-house-reward-transactions.csv";
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

  return (
    <div className="rewards-page">
      <div className="rewards-page-header">
        <div>
          <div className="rewards-eyebrow">
            CUSTOMER RELATIONSHIP MANAGEMENT
          </div>
          <h1>Reward Points</h1>
          <p>Track loyalty points, redemptions, adjustments, and customer balances.</p>
        </div>

        <button className="rewards-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="rewards-stats-grid">
        <div className="rewards-stat-card">
          <div className="rewards-stat-icon wine">
            <Gift size={21} />
          </div>
          <div>
            <span>Total Points Earned</span>
            <strong>{formatPoints(totalEarned)}</strong>
            <small>Earned through transactions</small>
          </div>
        </div>

        <div className="rewards-stat-card">
          <div className="rewards-stat-icon gold">
            <TrendingDown size={21} />
          </div>
          <div>
            <span>Total Points Redeemed</span>
            <strong>{formatPoints(totalRedeemed)}</strong>
            <small>Used by customers</small>
          </div>
        </div>

        <div className="rewards-stat-card">
          <div className="rewards-stat-icon green">
            <Wallet size={21} />
          </div>
          <div>
            <span>Outstanding Points</span>
            <strong>{formatPoints(totalBalance)}</strong>
            <small>Combined customer balances</small>
          </div>
        </div>

        <div className="rewards-stat-card">
          <div className="rewards-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Customers with Points</span>
            <strong>{customersWithPoints}</strong>
            <small>Customers with a positive balance</small>
          </div>
        </div>
      </div>

      <section className="rewards-content-card">
        <div className="rewards-content-heading">
          <div>
            <h2>Reward Transactions</h2>
            <p>Review each loyalty points transaction and customer balance.</p>
          </div>

          <button className="rewards-outline-btn" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="rewards-toolbar">
          <div className="rewards-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              placeholder="Search transaction, customer, or reference..."
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

          <label className="rewards-select-wrap">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All transaction types</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>

          <label className="rewards-select-wrap">
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest points</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>

        <div className="rewards-table-wrap">
          <table className="rewards-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Points</th>
                <th>Current Balance</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleTransactions.map((transaction) => {
                const customer = getCustomer(transaction.customerId);
                const signedPoints = getSignedPoints(transaction);
                const balance = customerBalances[transaction.customerId] || 0;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <strong className="rewards-transaction-id">
                        {transaction.id}
                      </strong>
                    </td>

                    <td>
                      <div className="rewards-customer-cell">
                        <span className="rewards-avatar">
                          {(customer?.name || "?").charAt(0)}
                        </span>
                        <div>
                          <strong>{customer?.name || "Unknown customer"}</strong>
                          <span>{customer?.phone || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(transaction.date)}</td>

                    <td>
                      <span
                        className={`rewards-type ${getTypeClass(
                          transaction.type
                        )}`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          signedPoints < 0
                            ? "rewards-points-negative"
                            : "rewards-points-positive"
                        }
                      >
                        {signedPoints > 0 ? "+" : ""}
                        {formatPoints(signedPoints)}
                      </strong>
                    </td>

                    <td>
                      <strong className="rewards-balance">
                        {formatPoints(balance)} pts
                      </strong>
                    </td>

                    <td>
                      <span className="rewards-reason">{transaction.reason}</span>
                    </td>

                    <td>
                      <div className="rewards-row-actions">
                        <button
                          title="View transaction"
                          aria-label={`View ${transaction.id}`}
                          onClick={() => setViewingTransaction(transaction)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit transaction"
                          aria-label={`Edit ${transaction.id}`}
                          onClick={() => openEditForm(transaction)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleTransactions.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="rewards-empty-state">
                      <Gift size={32} />
                      <strong>No reward transactions found</strong>
                      <span>Try changing your search or transaction type.</span>
                      <button
                        className="rewards-outline-btn"
                        onClick={() => {
                          setSearch("");
                          setTypeFilter("All");
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

        <div className="rewards-table-footer">
          <span>
            Showing {filteredTransactions.length ? startIndex + 1 : 0}–
            {Math.min(startIndex + pageSize, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </span>

          <div className="rewards-pagination">
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
                <span className="rewards-ellipsis" key={`ellipsis-${index}`}>
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
          className="rewards-modal-backdrop"
          onMouseDown={closeForm}
        >
          <section
            className="rewards-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rewards-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="rewards-modal-header">
              <div>
                <span className="rewards-modal-eyebrow">LOYALTY LEDGER</span>
                <h2 id="rewards-form-title">
                  {editingTransaction ? "Edit Transaction" : "Add Reward Transaction"}
                </h2>
                <p>Record points earned, redeemed, or adjusted.</p>
              </div>

              <button
                className="rewards-close-btn"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="rewards-form-body">
                <label className="rewards-field">
                  <span>Customer <b>*</b></span>
                  <select
                    value={form.customerId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        customerId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.phone}
                      </option>
                    ))}
                  </select>

                  {form.customerId && (
                    <small>
                      Current balance:{" "}
                      {formatPoints(
                        customerBalances[form.customerId] || 0
                      )}{" "}
                      points
                    </small>
                  )}
                </label>

                <div className="rewards-form-two-columns">
                  <label className="rewards-field">
                    <span>Transaction Date <b>*</b></span>
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

                  <label className="rewards-field">
                    <span>Transaction Type <b>*</b></span>
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          type: event.target.value,
                        }))
                      }
                    >
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="rewards-field">
                  <span>Points <b>*</b></span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.points}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        points: event.target.value,
                      }))
                    }
                    placeholder="Enter number of points"
                    required
                  />
                  <small>
                    {form.type === "Redeemed"
                      ? "Redeemed points will be deducted from the customer balance."
                      : form.type === "Adjustment"
                        ? "Positive adjustments add points; use Redeemed to deduct points."
                        : "Earned points will be added to the customer balance."}
                  </small>
                </label>

                <label className="rewards-field">
                  <span>Reason <b>*</b></span>
                  <input
                    value={form.reason}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        reason: event.target.value,
                      }))
                    }
                    maxLength={120}
                    placeholder="e.g. Purchase reward"
                    required
                  />
                </label>

                <label className="rewards-field">
                  <span>Reference <small>(Optional)</small></span>
                  <input
                    value={form.reference}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        reference: event.target.value,
                      }))
                    }
                    maxLength={100}
                    placeholder="e.g. Invoice number"
                  />
                </label>

                <label className="rewards-field">
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
                    placeholder="Add notes about this transaction..."
                  />
                </label>

                {formError && (
                  <div className="rewards-form-error" role="alert">
                    {formError}
                  </div>
                )}
              </div>

              <div className="rewards-modal-footer">
                <button
                  type="button"
                  className="rewards-outline-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="rewards-primary-btn">
                  {editingTransaction ? "Save Changes" : "Save Transaction"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingTransaction && (
        <div
          className="rewards-modal-backdrop"
          onMouseDown={() => setViewingTransaction(null)}
        >
          <section
            className="rewards-modal rewards-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rewards-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="rewards-modal-header">
              <div>
                <span className="rewards-modal-eyebrow">
                  {viewingTransaction.id}
                </span>
                <h2 id="rewards-detail-title">Transaction Details</h2>
                <p>Customer loyalty points record.</p>
              </div>

              <button
                className="rewards-close-btn"
                onClick={() => setViewingTransaction(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rewards-detail-body">
              <div className="rewards-detail-points-card">
                <span>Transaction Points</span>
                <strong
                  className={
                    getSignedPoints(viewingTransaction) < 0
                      ? "rewards-points-negative"
                      : "rewards-points-positive"
                  }
                >
                  {getSignedPoints(viewingTransaction) > 0 ? "+" : ""}
                  {formatPoints(getSignedPoints(viewingTransaction))}
                </strong>
                <small>{viewingTransaction.type}</small>
              </div>

              <div className="rewards-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {getCustomer(viewingTransaction.customerId)?.name || "Unknown"}
                  </strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>
                    {getCustomer(viewingTransaction.customerId)?.phone || "—"}
                  </strong>
                </div>
                <div>
                  <span>Transaction Date</span>
                  <strong>{formatDate(viewingTransaction.date)}</strong>
                </div>
                <div>
                  <span>Current Points Balance</span>
                  <strong>
                    {formatPoints(
                      customerBalances[viewingTransaction.customerId] || 0
                    )}
                  </strong>
                </div>
                <div>
                  <span>Reason</span>
                  <strong>{viewingTransaction.reason}</strong>
                </div>
                <div>
                  <span>Reference</span>
                  <strong>{viewingTransaction.reference || "—"}</strong>
                </div>
              </div>

              {viewingTransaction.notes && (
                <div className="rewards-detail-notes">
                  <strong>Notes</strong>
                  <p>{viewingTransaction.notes}</p>
                </div>
              )}
            </div>

            <div className="rewards-modal-footer">
              <button
                className="rewards-outline-btn"
                onClick={() => setViewingTransaction(null)}
              >
                Close
              </button>
              <button
                className="rewards-primary-btn"
                onClick={() => {
                  const transaction = viewingTransaction;
                  setViewingTransaction(null);
                  openEditForm(transaction);
                }}
              >
                <Pencil size={16} />
                Edit Transaction
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
