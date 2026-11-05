export interface LiveCustomerQuery {
  id: string;
  customerName: string;
  customerTitle: string;
  avatar: string;
  timestamp: string;
  text: string;
  extracted: {
    voltage: number | null;
    connector: string | null;
    watts: number | null;
    safe_20w_applied: boolean;
  };
  decision: 'dispatch' | 'escalate';
  assigned_part_id?: string | null;
  decision_reason?: string | null;
  status: 'pending_approval' | 'approved' | 'dispatched' | 'escalated';
  isNewAlert?: boolean;
  adminNotes?: string | null;
}

export interface Ticket {
  id: string;
  text: string;
  voltage: number | null;
  connector: string | null;
  watts: number | null;
  clarified: boolean;
  clarification_reply?: string | null;
  decision?: 'dispatch' | 'escalate' | null;
  decision_reason?: string | null;
  assigned_part_id?: string | null;
  assigned_part_watts?: number | null;
  assigned_part_voltage?: number | null;
  assigned_part_connector?: string | null;
}

export interface CatalogPart {
  id: string;
  description: string;
  voltage: number;
  connector: string;
  watts: number;
  snapshot_age: 'recent' | 'aged';
  stock_known: boolean;
  stock: number | null;
  source?: 'desk_snapshot' | 'warehouse' | null;
  desk_cache?: number | null;
  warehouse_stock?: number | null;
  has_discrepancy?: boolean;
}

export interface CandidateCheck {
  part_id: string;
  voltage: number;
  connector: string;
  watts: number;
  v_match: boolean;
  c_match: boolean;
  w_match: boolean;
  compatible: boolean;
  stock_known: boolean;
  stock: number | null;
  snapshot_age: 'recent' | 'aged';
}

export interface CompatibilityRow {
  ticket_id: string;
  req_v: number | null;
  req_c: string | null;
  req_w: number | null;
  clarified: boolean;
  clarification_reply?: string | null;
  decision?: string | null;
  assigned_part_id?: string | null;
  decision_reason?: string | null;
  candidates: CandidateCheck[];
}

export interface StepLog {
  step: number;
  kind: 'llm' | 'world_action';
  action: {
    op: string;
    part_id?: string;
    ticket_id?: string;
    messages?: any[];
  };
  result?: any;
  budget_remaining: number;
  spent?: number;
}

export interface ScoreGrade {
  score: number;
  components: {
    outcome: { earned: number; max: number };
    integrity: { earned: number; max: number };
    efficiency: { earned: number; max: number };
  };
  diagnostics: {
    fulfilled_fraction: number;
    useful_escalation_fraction: number;
    unnecessary_escalation_fraction: number;
    unsafe_dispatches: number;
    unavailable_dispatches: number;
    mean_tool_spend: number;
    invalid_actions: number;
  };
}

export interface CaseRunData {
  case_id: string;
  case_index: number;
  dataset: string;
  condition: string;
  policy: string;
  tickets: Ticket[];
  catalog: CatalogPart[];
  compatibility_matrix: CompatibilityRow[];
  steps: StepLog[];
  spent: number;
  budget_remaining: number;
  model_calls: number;
  grade: ScoreGrade;
}

export interface CaseMetaItem {
  index: number;
  case_id: string;
  condition: string;
  tickets_count: number;
  parts_count: number;
}

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  badge: string;
}

export type TabType =
  | 'home'
  | 'customer'
  | 'workbench'
  | 'charts'
  | 'database'
  | 'overview'
  | 'player'
  | 'matrix'
  | 'catalog'
  | 'sandbox'
  | 'audit';

export interface DatabaseStats {
  totalWorlds: number;
  totalTickets: number;
  totalParts: number;
  totalDiscrepancies: number;
  discrepanciesPerWorld: number;
  breakdownByDataset: {
    practice: { worlds: number; tickets: number; parts: number };
    smoke: { worlds: number; tickets: number; parts: number };
    training: { worlds: number; tickets: number; parts: number };
  };
  voltages: { name: string; count: number; percent: number; color: string }[];
  connectors: { name: string; count: number; percent: number; color: string }[];
  wattages: { name: string; count: number; percent: number; color: string }[];
  missingWattageStats: {
    missing: number;
    total: number;
    percent: number;
    safe20wApplied: number;
  };
  stockUnitsHistogram: { units: string; worlds: number }[];
  unfulfillableDistribution: { category: string; worlds: number; color: string; desc: string }[];
  snapshotAges: {
    recent: number;
    aged: number;
    discrepanciesPerWorld: number;
  };
  baselineComparison: {
    baselineMockPracticeScore: number;
    baselineMockTrainingScore: number;
    baselineUnnecessaryEscalations: number;
    partSureScore: number;
    partSureAvgSpend: number;
    partSureUnnecessaryEscalations: number;
    safetyRating: number;
  };
}
