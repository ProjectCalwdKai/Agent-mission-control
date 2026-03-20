export type TaskCategory =
  | 'Marketing'
  | 'AI video generation'
  | 'Remotion videos'
  | 'Product research'
  | 'Accounting'
  | 'Coding'
  | 'Task automation';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Mode = 'Cheap' | 'Balanced' | 'Premium';
export type AgentAvailability = 'online' | 'offline' | 'busy';

export interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  availability: AgentAvailability;
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  prompt?: string;
  description?: string;
  details?: string;
  category: TaskCategory;
  priority: Priority;
  status: 'Inbox' | 'Planned' | 'In Progress' | 'Review' | 'Blocked' | 'Done';
  assignedAgent?: string;
  assignedAgentId?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  requiresApproval?: boolean;
  hasDelegation?: boolean;
}

export const AGENT_ROSTER: Agent[] = [
  { id: 'chief-agent', name: 'Chief Agent', model: 'gpt-5.4', role: 'Chief Agent', availability: 'online' },
  { id: 'coding-lead', name: 'Coding Lead', model: 'sonnet', role: 'Coding Lead', availability: 'online' },
  { id: 'research-lead', name: 'Research Lead', model: 'gemini-pro', role: 'Research Lead', availability: 'online' },
  { id: 'fast-worker', name: 'Fast Worker', model: 'gemini-flash', role: 'Fast Worker', availability: 'online' },
  { id: 'brainstormer', name: 'Brainstormer', model: 'qwen', role: 'Brainstormer', availability: 'online' },
  { id: 'finance-lead', name: 'Finance Lead', model: 'minimax', role: 'Finance Lead', availability: 'online' },
  { id: 'generalist', name: 'Generalist', model: 'minimax', role: 'Generalist', availability: 'online' },
];

export function getSuggestedAgentForCategory(category: TaskCategory): Agent {
  switch (category) {
    case 'Marketing':
      return AGENT_ROSTER[4];
    case 'AI video generation':
      return AGENT_ROSTER[6];
    case 'Remotion videos':
      return AGENT_ROSTER[1];
    case 'Product research':
      return AGENT_ROSTER[2];
    case 'Accounting':
      return AGENT_ROSTER[5];
    case 'Coding':
      return AGENT_ROSTER[1];
    case 'Task automation':
      return AGENT_ROSTER[1];
    default:
      return AGENT_ROSTER[6];
  }
}
