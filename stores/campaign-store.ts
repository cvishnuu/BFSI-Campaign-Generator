import { create } from 'zustand';
import { CampaignFormData } from '@/types';

interface CampaignStore {
  // Current campaign data
  currentCampaign: CampaignFormData | null;

  // Execution tracking
  currentExecutionId: string | null;

  // Actions
  setCampaignData: (data: CampaignFormData) => void;
  setExecutionId: (id: string) => void;
  resetCampaign: () => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  currentCampaign: null,
  currentExecutionId: null,

  setCampaignData: (data) => set({ currentCampaign: data }),

  setExecutionId: (id) => set({ currentExecutionId: id }),

  resetCampaign: () => set({ currentCampaign: null, currentExecutionId: null }),
}));
