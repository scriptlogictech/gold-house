
export const crmNavigation = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    label: "CUSTOMER RELATIONSHIPS",
    items: [
      { label: "Customers", path: "/admin/customers", icon: "Users" },
      { label: "Families", path: "/admin/families", icon: "House" },
      { label: "Referrals", path: "/admin/referrals", icon: "Share2" },
    ],
  },
  {
    label: "PURCHASES & LOYALTY",
    items: [
      { label: "Invoices", path: "/admin/invoices", icon: "ReceiptText" },
      { label: "Reward Points", path: "/admin/rewards", icon: "Award" },
      { label: "Memberships", path: "/admin/memberships", icon: "Crown" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Notifications", path: "/admin/notifications", icon: "Bell" },
      { label: "Reports", path: "/admin/reports", icon: "ChartNoAxesCombined" },
      { label: "Staff & Roles", path: "/admin/staff", icon: "ShieldCheck" },
    ],
  },
];

export const dashboardStats = [
  {
    label: "Total Customers",
    value: "1,284",
    change: "Sample figure",
    icon: "Users",
    tone: "wine",
  },
  {
    label: "Invoices Imported",
    value: "856",
    change: "Sample figure",
    icon: "ReceiptText",
    tone: "gold",
  },
  {
    label: "Reward Transactions",
    value: "2,410",
    change: "Sample figure",
    icon: "Award",
    tone: "green",
  },
  {
    label: "Family Memberships",
    value: "186",
    change: "Sample figure",
    icon: "House",
    tone: "blue",
  },
];

export const monthlyActivity = [
  { month: "May", customers: 35, invoices: 45 },
  { month: "Jun", customers: 48, invoices: 55 },
  { month: "Jul", customers: 42, invoices: 38 },
  { month: "Aug", customers: 60, invoices: 65 },
  { month: "Sep", customers: 53, invoices: 58 },
  { month: "Oct", customers: 72, invoices: 68 },
];

export const recentCustomers = [
  {
    id: "GHC000101",
    name: "Sample Customer One",
    mobile: "98XXXXXX21",
    category: "Gold Buyer",
    joined: "18 Oct 2026",
    status: "Active",
  },
  {
    id: "GHC000102",
    name: "Sample Customer Two",
    mobile: "97XXXXXX34",
    category: "Wedding Customer",
    joined: "17 Oct 2026",
    status: "Active",
  },
  {
    id: "GHC000103",
    name: "Sample Customer Three",
    mobile: "96XXXXXX57",
    category: "Exchange Customer",
    joined: "16 Oct 2026",
    status: "Active",
  },
  {
    id: "GHC000104",
    name: "Sample Customer Four",
    mobile: "95XXXXXX68",
    category: "Diamond Buyer",
    joined: "15 Oct 2026",
    status: "Inactive",
  },
  {
    id: "GHC000105",
    name: "Sample Customer Five",
    mobile: "94XXXXXX79",
    category: "VIP",
    joined: "14 Oct 2026",
    status: "Active",
  },
];
