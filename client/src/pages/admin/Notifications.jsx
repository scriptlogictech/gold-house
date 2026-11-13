
import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  CheckCheck,
  Check,
  Trash2,
  Eye,
  X,
  Filter,
  Clock3,
  AlertTriangle,
  Gift,
  Users,
  ReceiptText,
  Crown,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: "NOT-1001",
    title: "Membership expiring soon",
    message:
      "Priya Sharma's Gold Elite membership is approaching its expiry date. Contact the customer about renewal.",
    category: "Membership",
    priority: "High",
    customer: "Priya Sharma",
    createdAt: "2026-10-20T10:30:00",
    read: false,
  },
  {
    id: "NOT-1002",
    title: "Customer follow-up pending",
    message:
      "Follow up with Rahul Verma regarding his recent jewellery enquiry.",
    category: "Follow-up",
    priority: "High",
    customer: "Rahul Verma",
    createdAt: "2026-10-20T09:15:00",
    read: false,
  },
  {
    id: "NOT-1003",
    title: "Reward points updated",
    message:
      "A reward transaction was recorded for Ananya Singh. Review the reward ledger if required.",
    category: "Rewards",
    priority: "Medium",
    customer: "Ananya Singh",
    createdAt: "2026-10-19T16:45:00",
    read: false,
  },
  {
    id: "NOT-1004",
    title: "Invoice payment reminder",
    message:
      "Invoice INV-2026-004 requires a payment follow-up. Check the outstanding balance with the customer.",
    category: "Invoice",
    priority: "High",
    customer: "Neha Kumari",
    createdAt: "2026-10-19T14:20:00",
    read: true,
  },
  {
    id: "NOT-1005",
    title: "New referral recorded",
    message:
      "A new customer referral has been recorded. Review the referral record and its current status.",
    category: "Referral",
    priority: "Medium",
    customer: "Kavita Devi",
    createdAt: "2026-10-19T11:00:00",
    read: false,
  },
  {
    id: "NOT-1006",
    title: "Membership renewal required",
    message:
      "A customer's membership has expired. Review the customer record and follow up about renewal.",
    category: "Membership",
    priority: "Medium",
    customer: "Rohit Raj",
    createdAt: "2026-10-18T12:10:00",
    read: true,
  },
  {
    id: "NOT-1007",
    title: "Customer enquiry received",
    message:
      "A new jewellery enquiry needs to be reviewed and assigned to the appropriate staff member.",
    category: "Follow-up",
    priority: "Low",
    customer: "Pooja Gupta",
    createdAt: "2026-10-18T10:05:00",
    read: true,
  },
  {
    id: "NOT-1008",
    title: "Referral status needs review",
    message:
      "Check the progress of an outstanding referral and update its status after verification.",
    category: "Referral",
    priority: "Low",
    customer: "Amit Kumar",
    createdAt: "2026-10-17T15:30:00",
    read: true,
  },
  {
    id: "NOT-1009",
    title: "Reward redemption recorded",
    message:
      "A reward redemption was recorded. Verify the transaction details in the rewards module.",
    category: "Rewards",
    priority: "Low",
    customer: "Ananya Singh",
    createdAt: "2026-10-17T11:25:00",
    read: true,
  },
  {
    id: "NOT-1010",
    title: "Invoice follow-up pending",
    message:
      "Review an outstanding invoice and contact the customer about the pending amount.",
    category: "Invoice",
    priority: "Medium",
    customer: "Rahul Verma",
    createdAt: "2026-10-16T13:40:00",
    read: true,
  },
];

const categories = [
  "All",
  "Membership",
  "Follow-up",
  "Rewards",
  "Invoice",
  "Referral",
  "System",
];

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  const difference = Date.now() - timestamp;

  if (!Number.isFinite(timestamp)) return "";

  const minutes = Math.max(0, Math.floor(difference / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const categoryIcon = (category) => {
  switch (category) {
    case "Membership":
      return <Crown size={18} />;
    case "Follow-up":
      return <MessageSquare size={18} />;
    case "Rewards":
      return <Gift size={18} />;
    case "Invoice":
      return <ReceiptText size={18} />;
    case "Referral":
      return <Users size={18} />;
    default:
      return <Bell size={18} />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const stats = useMemo(() => {
    const unread = notifications.filter((item) => !item.read).length;
    const highPriority = notifications.filter(
      (item) => item.priority === "High" && !item.read
    ).length;

    const today = new Date();
    const todayCount = notifications.filter((item) => {
      const date = new Date(item.createdAt);
      return date.toDateString() === today.toDateString();
    }).length;

    return {
      total: notifications.length,
      unread,
      highPriority,
      today: todayCount,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = notifications.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.id,
          item.title,
          item.message,
          item.customer,
          item.category,
        ].some((value) => String(value || "").toLowerCase().includes(term));

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesRead =
        readFilter === "All" ||
        (readFilter === "Unread" && !item.read) ||
        (readFilter === "Read" && item.read);

      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRead &&
        matchesPriority
      );
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "priority") {
        const rank = { High: 3, Medium: 2, Low: 1 };
        return rank[b.priority] - rank[a.priority];
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [
    notifications,
    search,
    category,
    readFilter,
    priorityFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + pageSize
  );

  const updateFilters = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );

    setSelectedNotification((previous) =>
      previous?.id === id ? { ...previous, read: true } : previous
    );
  };

  const toggleReadStatus = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );

    setSelectedNotification((previous) =>
      previous?.id === id ? { ...previous, read: !previous.read } : previous
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );

    setSelectedNotification((previous) =>
      previous ? { ...previous, read: true } : previous
    );
  };

  const openDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetails(true);

    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
      setShowDetails(false);
    }

    setConfirmDelete(null);
  };

  const exportCsv = () => {
    const headers = [
      "Notification ID",
      "Title",
      "Message",
      "Category",
      "Priority",
      "Customer",
      "Created At",
      "Read Status",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredNotifications.map((item) => [
      item.id,
      item.title,
      item.message,
      item.category,
      item.priority,
      item.customer || "",
      item.createdAt,
      item.read ? "Read" : "Unread",
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
    anchor.download = "gold-house-notifications.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-heading">
        <div>
          <span className="notifications-eyebrow">CRM COMMUNICATION CENTRE</span>
          <h1>Notifications</h1>
          <p>Keep track of customer updates, reminders and important activities.</p>
        </div>

        <div className="notifications-heading-actions">
          <button
            className="notification-secondary-btn"
            onClick={exportCsv}
          >
            <Inbox size={16} />
            Export
          </button>

          <button
            className="notification-primary-btn"
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notifications-stats">
        <div className="notification-stat-card">
          <div className="notification-stat-icon burgundy">
            <Bell size={20} />
          </div>
          <div>
            <span>Total notifications</span>
            <strong>{stats.total}</strong>
            <small>All recorded alerts</small>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon rose">
            <MessageSquare size={20} />
          </div>
          <div>
            <span>Unread</span>
            <strong>{stats.unread}</strong>
            <small>Require your attention</small>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>High priority unread</span>
            <strong>{stats.highPriority}</strong>
            <small>Review these first</small>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon green">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Created today</span>
            <strong>{stats.today}</strong>
            <small>Based on local date</small>
          </div>
        </div>
      </div>

      <section className="notifications-panel">
        <div className="notifications-panel-heading">
          <div>
            <h2>All notifications</h2>
            <p>Review alerts and keep your customer records up to date.</p>
          </div>

          <span className="notification-count-pill">
            {filteredNotifications.length} results
          </span>
        </div>

        <div className="notifications-toolbar">
          <div className="notification-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => updateFilters(setSearch, event.target.value)}
              placeholder="Search notifications or customers..."
            />

            {search && (
              <button
                onClick={() => updateFilters(setSearch, "")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="notifications-filters">
            <label className="notification-filter-control">
              <Filter size={15} />
              <select
                value={category}
                onChange={(event) =>
                  updateFilters(setCategory, event.target.value)
                }
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </label>

            <select
              className="notification-select"
              value={readFilter}
              onChange={(event) =>
                updateFilters(setReadFilter, event.target.value)
              }
              aria-label="Filter by read status"
            >
              <option value="All">All statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>

            <select
              className="notification-select"
              value={priorityFilter}
              onChange={(event) =>
                updateFilters(setPriorityFilter, event.target.value)
              }
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="High">High priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Low">Low priority</option>
            </select>

            <select
              className="notification-select"
              value={sortBy}
              onChange={(event) => updateFilters(setSortBy, event.target.value)}
              aria-label="Sort notifications"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority first</option>
            </select>
          </div>
        </div>

        <div className="notification-list">
          {visibleNotifications.map((item) => (
            <article
              className={`notification-item ${item.read ? "is-read" : "is-unread"}`}
              key={item.id}
            >
              <div className={`notification-category-icon category-${item.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                {categoryIcon(item.category)}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{item.title}</h3>
                  {!item.read && <span className="notification-unread-dot" />}
                  <span className={`notification-priority priority-${item.priority.toLowerCase()}`}>
                    {item.priority}
                  </span>
                </div>

                <p>{item.message}</p>

                <div className="notification-meta">
                  <span className="notification-category-label">
                    {item.category}
                  </span>

                  {item.customer && (
                    <>
                      <span className="notification-meta-dot">•</span>
                      <span>{item.customer}</span>
                    </>
                  )}

                  <span className="notification-meta-dot">•</span>
                  <span title={formatDateTime(item.createdAt)}>
                    {getRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="notification-item-actions">
                <button
                  className="notification-icon-btn"
                  onClick={() => openDetails(item)}
                  title="View details"
                  aria-label="View notification details"
                >
                  <Eye size={16} />
                </button>

                <button
                  className="notification-icon-btn"
                  onClick={() => toggleReadStatus(item.id)}
                  title={item.read ? "Mark as unread" : "Mark as read"}
                  aria-label={item.read ? "Mark as unread" : "Mark as read"}
                >
                  {item.read ? <Bell size={16} /> : <Check size={16} />}
                </button>

                <button
                  className="notification-icon-btn delete"
                  onClick={() => setConfirmDelete(item.id)}
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}

          {visibleNotifications.length === 0 && (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <Inbox size={28} />
              </div>
              <h3>No notifications found</h3>
              <p>Try changing your search or filters.</p>
              <button
                className="notification-secondary-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setReadFilter("All");
                  setPriorityFilter("All");
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="notifications-pagination">
          <span>
            Showing {filteredNotifications.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, filteredNotifications.length)} of{" "}
            {filteredNotifications.length} notifications
          </span>

          <div className="notifications-pagination-controls">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Notifications per page"
            >
              <option value={5}>5 / page</option>
              <option value={6}>6 / page</option>
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

            <span>{currentPage} / {totalPages}</span>

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

      {showDetails && selectedNotification && (
        <div
          className="notification-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowDetails(false);
          }}
        >
          <section className="notification-modal">
            <div className="notification-modal-heading">
              <div>
                <span className="notifications-eyebrow">NOTIFICATION DETAILS</span>
                <h2>{selectedNotification.title}</h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="notification-detail-banner">
              <div className={`notification-category-icon category-${selectedNotification.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                {categoryIcon(selectedNotification.category)}
              </div>
              <div>
                <span>Notification ID</span>
                <strong>{selectedNotification.id}</strong>
              </div>
              <span className={`notification-priority priority-${selectedNotification.priority.toLowerCase()}`}>
                {selectedNotification.priority} priority
              </span>
            </div>

            <div className="notification-detail-grid">
              <div>
                <span>Category</span>
                <strong>{selectedNotification.category}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedNotification.read ? "Read" : "Unread"}</strong>
              </div>
              <div>
                <span>Customer</span>
                <strong>{selectedNotification.customer || "Not specified"}</strong>
              </div>
              <div>
                <span>Date and time</span>
                <strong>{formatDateTime(selectedNotification.createdAt)}</strong>
              </div>
              <div className="notification-detail-message">
                <span>Message</span>
                <p>{selectedNotification.message}</p>
              </div>
            </div>

            <div className="notification-modal-footer">
              <button
                className="notification-secondary-btn"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              <button
                className="notification-primary-btn"
                onClick={() => {
                  toggleReadStatus(selectedNotification.id);
                }}
              >
                <Check size={16} />
                Mark as {selectedNotification.read ? "unread" : "read"}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmDelete && (
        <div
          className="notification-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDelete(null);
          }}
        >
          <section className="notification-confirm-modal">
            <div className="notification-confirm-icon">
              <Trash2 size={23} />
            </div>
            <h2>Delete notification?</h2>
            <p>
              This notification will be removed from the current list. This
              action cannot be undone in this demo.
            </p>
            <div className="notification-modal-footer">
              <button
                className="notification-secondary-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="notification-danger-btn"
                onClick={() => deleteNotification(confirmDelete)}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
