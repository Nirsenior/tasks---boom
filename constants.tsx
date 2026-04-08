
import { 
  Search,
  Plus,
  Filter,
  Download,
  Maximize2,
  Paperclip,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Menu,
  Star,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Hash,
  Settings,
  Bell,
  Inbox,
  LayoutList,
  MoreVertical,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Copy,
  Trash2
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, List, User as UserType, Workspace } from './types';

// Populate ICONS with all icons requested by components
export const ICONS = {
  Search, Plus, Filter, Download, Maximize2, Paperclip, ChevronDown, ChevronUp, LayoutGrid, Menu,
  Star, UserIcon: User, Clock, AlertCircle, CheckCircle2, Lock, Hash, Settings, Bell, Inbox, LayoutList, MoreVertical, X, RotateCcw,
  ArrowUp, ArrowDown, Edit: Pencil, ArrowRight, ArrowLeft, Copy, Trash: Trash2
};

// Common suggestions for "גורם מנחה"
export const COMMON_TITLE_SUGGESTIONS = [
  'רמ״ט',
  'מנל״ח',
  'קצין אג״ם',
  'סמבצ״ית',
  'ממ״ן',
  'מפקד היחידה',
  'קמ״ן',
  'קשר״ר'
];

// Common suggestions for "אחריות ביצוע"
export const COMMON_ASSIGNEE_SUGGESTIONS = [
  'אוגדה 162',
  'חטמ״ר 215',
  'אוגדה 98',
  'פיקוד דרום',
  'פיקוד מרכז',
  'פיקוד צפון'
];

// Export SEED_USERS as used in store.ts
export const SEED_USERS: UserType[] = [
  { id: 'u1', name: 'Jordan Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' }
];

// Export SEED_LISTS as used in store.ts
export const SEED_LISTS: List[] = [
  { id: 'l1', name: 'משימות כלליות', isStarred: true, isPrivate: false },
  { id: 'l2', name: 'תוכניות עבודה', isStarred: false, isPrivate: false }
];

// Export SEED_WORKSPACES as used in store.ts
export const SEED_WORKSPACES: Workspace[] = [
  { id: 'w1', name: 'מערכת שליטה ובקרה' }
];

export const SEED_TASKS: Task[] = [
  {
    id: '1',
    id_num: '1000',
    creationTime: '24/11/27, 15:20',
    title: ['רמ״ט'],
    description: 'ביצוע סריקה במרחב 254',
    assignee: ['אוגדה 162'],
    status: TaskStatus.NOT_DONE,
    startTime: '14/08/2024',
    endTime: '01/01/2024',
    fileCount: 1,
    priority: TaskPriority.HIGH,
    archived: false,
    listId: 'l1'
  },
  {
    id: '2',
    id_num: '1001',
    creationTime: '24/11/27, 15:20',
    title: ['מנל״ח'],
    description: 'הכנת תוכנית אימון והגדרת קורדינטות ליחידה 524',
    assignee: ['חטמ"ר 215', 'אוגדה...'],
    status: TaskStatus.DONE,
    startTime: '14/08/2024',
    endTime: '14/08/2025',
    fileCount: 0,
    priority: TaskPriority.MED,
    archived: false,
    listId: 'l1'
  },
  {
    id: '3',
    id_num: '1002',
    creationTime: '24/11/27, 15:20',
    title: ['קצין אג״ם'],
    description: 'ביצוע סריקה במרחב 254',
    assignee: ['חפק 162'],
    status: TaskStatus.NOT_DONE,
    startTime: '14/08/2024',
    endTime: '14/08/2025',
    fileCount: 0,
    priority: TaskPriority.HIGH,
    archived: false,
    listId: 'l1'
  },
  {
    id: '4',
    id_num: '1003',
    creationTime: '24/11/27, 15:20',
    title: ['סמבצ״ית'],
    description: 'הכנת תוכנית אימון והגדרת קורדינטות ליחידה 524',
    assignee: ['אוגדה 162'],
    status: TaskStatus.OPEN,
    startTime: '14/08/2024',
    endTime: '14/08/2025',
    fileCount: 1,
    priority: TaskPriority.LOW,
    archived: false,
    listId: 'l1'
  },
  {
    id: '5',
    id_num: '1004',
    creationTime: '24/11/27, 16:10',
    title: ['יחידת מחשוב'],
    description: 'מעבר על כלל המשימות שנותרו לספרינט הנוכחי',
    assignee: ['יחידת מחשוב'],
    status: TaskStatus.IN_PROGRESS,
    startTime: '15/08/2024',
    endTime: '15/08/2024',
    fileCount: 2,
    priority: TaskPriority.MED,
    archived: false,
    listId: 'l1'
  }
];