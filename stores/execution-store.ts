import { create } from 'zustand';
import { ExecutionStatus, PendingApprovalData } from '@/types';

interface ExecutionStore {
  // Current execution state
  executionId: string | null;
  status: ExecutionStatus;
  progress: number;
  logs: string[];

  // Approval data
  approvalData: PendingApprovalData | null;

  // Actions
  setExecutionId: (id: string) => void;
  setStatus: (status: ExecutionStatus) => void;
  setProgress: (progress: number) => void;
  addLog: (log: string) => void;
  setApprovalData: (data: PendingApprovalData) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  executionId: null,
  status: 'pending',
  progress: 0,
  logs: [],
  approvalData: null,

  setExecutionId: (id) => set({ executionId: id }),

  setStatus: (status) => set({ status }),

  setProgress: (progress) => set({ progress }),

  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

  setApprovalData: (data) => set({ approvalData: data }),

  reset: () => set({
    executionId: null,
    status: 'pending',
    progress: 0,
    logs: [],
    approvalData: null,
  }),
}));
