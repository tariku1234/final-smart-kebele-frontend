// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Complaint status options
// User roles
export const USER_ROLES = {
  CITIZEN: "citizen",
  STAKEHOLDER_OFFICE: "stakeholder_office",
  WEREDA_ANTI_CORRUPTION: "wereda_anti_corruption",
  KIFLEKETEMA_ANTI_CORRUPTION: "kifleketema_anti_corruption",
  KENTIBA_BIRO: "kentiba_biro",
}

// Office types
export const OFFICE_TYPES = {
  TRADE: "trade_office",
  ID: "id_office",
  LAND: "land_office",
  TAX: "tax_office",
  COURT: "court_office",
  POLICE: "police_office",
  EDUCATION: "education_office",
  HEALTH: "health_office",
  TRANSPORT: "transport_office",
  WATER: "water_office",
  ELECTRICITY: "electricity_office",
  TELECOM: "telecom_office",
  IMMIGRATION: "immigration_office",
  SOCIAL_AFFAIRS: "social_affairs_office",
  OTHER: "other",
}

// Complaint stages
export const COMPLAINT_STAGES = {
  STAKEHOLDER_FIRST: "stakeholder_first",
  STAKEHOLDER_SECOND: "stakeholder_second",
  WEREDA_FIRST: "wereda_first",
  WEREDA_SECOND: "wereda_second",
  KIFLEKETEMA_FIRST: "kifleketema_first",
  KIFLEKETEMA_SECOND: "kifleketema_second",
  KENTIBA: "kentiba",
}

// Complaint status
export const COMPLAINT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  ESCALATED: "escalated",
}

// Kifleketema list
export const KIFLEKETEMA_LIST = [
  { value: "lemi_kura", label: "Lemi Kura" },
  { value: "arada", label: "Arada" },
  { value: "addis_ketema", label: "Addis Ketema" },
  { value: "lideta", label: "Lideta" },
  { value: "kirkos", label: "Kirkos" },
  { value: "yeka", label: "Yeka" },
  { value: "bole", label: "Bole" },
  { value: "akaky_kaliti", label: "Akaky Kaliti" },
  { value: "nifas_silk_lafto", label: "Nifas Silk-Lafto" },
  { value: "kolfe_keranio", label: "Kolfe Keranio" },
  { value: "gulele", label: "Gulele" },
]

// Wereda count per kifleketema
export const WEREDA_COUNT = {
  lemi_kura: 10,
  arada: 8,
  addis_ketema: 12,
  lideta: 10,
  kirkos: 10,
  yeka: 12,
  bole: 11,
  akaky_kaliti: 13,
  nifas_silk_lafto: 13,
  kolfe_keranio: 11,
  gulele: 10,
}

// Display names for various entities
export const DISPLAY_NAMES = {
  // Roles
  citizen: "Citizen",
  admin: "System Administrator",
  stakeholder_office: "Stakeholder Office",
  wereda_anti_corruption: "Wereda Anti-Corruption Officer",
  kifleketema_anti_corruption: "Kifleketema Anti-Corruption Officer",
  kentiba_biro: "Kentiba Biro",

  // Office types
  trade_office: "Trade Office",
  id_office: "ID Office",
  land_office: "Land Office",
  tax_office: "Tax Office",
  court_office: "Court Office",
  police_office: "Police Office",
  education_office: "Education Office",
  health_office: "Health Office",
  transport_office: "Transport Office",
  water_office: "Water Office",
  electricity_office: "Electricity Office",
  telecom_office: "Telecom Office",
  immigration_office: "Immigration Office",
  social_affairs_office: "Social Affairs Office",
  other: "Other Office",

  // Complaint status
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  escalated: "Escalated",

  // Complaint stages
  stakeholder_first: "Stakeholder (First Stage)",
  stakeholder_second: "Stakeholder (Second Stage)",
  wereda_first: "Wereda (First Stage)",
  wereda_second: "Wereda (Second Stage)",
  kifleketema_first: "Kifleketema (First Stage)",
  kifleketema_second: "Kifleketema (Second Stage)",
  kentiba: "Kentiba Biro",
}

// Office Status
export const OFFICE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  LIMITED: "limited",
}

// Alert Priority
export const ALERT_PRIORITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
}
