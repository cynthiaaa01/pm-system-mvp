// ============================================================
// PM System - Constants
// ============================================================

import type {
  ProposalStatus,
  ProjectStatus,
  TaskStatus,
  ProjectType,
  TaskPriority,
  UserRole,
} from '@/types/database';

// =========================
// Status Labels (Chinese)
// =========================

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  lead: '潛在客戶',
  negotiating: '洽談中',
  quoted: '已報價',
  pending: '待確認',
  won: '已成交',
  lost: '未成交',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: '待啟動',
  in_progress: '進行中',
  testing: '測試中',
  completed: '已完成',
  closed: '已結案',
  delayed: '已延遲',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待處理',
  in_progress: '進行中',
  review: '審核中',
  done: '已完成',
  delayed: '已延遲',
};

// =========================
// Status Colors
// =========================

export const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  lead: '#74b9ff',      // info blue
  negotiating: '#fdcb6e', // warning yellow
  quoted: '#a29bfe',     // accent purple light
  pending: '#fdcb6e',    // warning yellow
  won: '#00b894',        // success green
  lost: '#e17055',       // danger red
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  pending: '#74b9ff',     // info blue
  in_progress: '#6c5ce7', // accent purple
  testing: '#fdcb6e',     // warning yellow
  completed: '#00b894',   // success green
  closed: '#636e72',      // neutral gray
  delayed: '#e17055',     // danger red
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#74b9ff',        // info blue
  in_progress: '#6c5ce7', // accent purple
  review: '#fdcb6e',      // warning yellow
  done: '#00b894',        // success green
  delayed: '#e17055',     // danger red
};

// =========================
// Project Type Labels (Chinese)
// =========================

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  online_event: '線上活動',
  courseware: '數位教材',
  training: '教育訓練',
  consulting: '顧問諮詢',
};

export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  online_event: '🎯',
  courseware: '📚',
  training: '🎓',
  consulting: '💼',
};

// =========================
// Priority Labels & Colors
// =========================

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#636e72',     // neutral gray
  medium: '#74b9ff',  // info blue
  high: '#fdcb6e',    // warning yellow
  urgent: '#e17055',  // danger red
};

// =========================
// Role Labels (Chinese)
// =========================

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理員',
  sales: '業務',
  operations: '運營',
  marketing: '行銷',
};

// =========================
// Navigation Items
// =========================

export interface NavItem {
  label: string;
  href: string;
  icon: string; // emoji or icon identifier
  roles?: UserRole[]; // visible to these roles, undefined = all
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: '儀表板',
    href: '/dashboard',
    icon: '📊',
  },
  {
    label: '提案管理',
    href: '/proposals',
    icon: '📋',
    roles: ['admin', 'sales'],
  },
  {
    label: '專案管理',
    href: '/projects',
    icon: '📁',
  },
  {
    label: '任務管理',
    href: '/tasks',
    icon: '✅',
  },
  {
    label: '客戶管理',
    href: '/clients',
    icon: '🏢',
    roles: ['admin', 'sales', 'operations'],
  },
  {
    label: '範本管理',
    href: '/templates',
    icon: '📝',
    roles: ['admin', 'operations'],
  },
  {
    label: '團隊成員',
    href: '/team',
    icon: '👥',
    roles: ['admin'],
  },
  {
    label: '設定',
    href: '/settings',
    icon: '⚙️',
  },
];

// =========================
// Currency
// =========================

export const DEFAULT_CURRENCY = 'TWD';
export const CURRENCY_LOCALE = 'zh-TW';

// =========================
// Pagination
// =========================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// =========================
// Date Formats
// =========================

export const DATE_FORMAT = 'yyyy/MM/dd';
export const DATETIME_FORMAT = 'yyyy/MM/dd HH:mm';
