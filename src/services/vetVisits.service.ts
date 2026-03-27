import api from './api';
import type { VetVisit } from '@/types';

interface VetVisitResponse { success: boolean; data: VetVisit }
interface VetVisitListResponse { success: boolean; data: VetVisit[] }

export const vetVisitsService = {
  /** Get all vet visits for a pet (supports query filters) */
  getAll: async (petId: string, params?: { visitType?: string; from?: string; to?: string }): Promise<VetVisitListResponse> => {
    const res = await api.get(`/vetvisits/${petId}`, { params });
    return res.data;
  },

  /** Get upcoming visits */
  getUpcoming: async (petId: string): Promise<VetVisitListResponse> => {
    const res = await api.get(`/vetvisits/${petId}/upcoming`);
    return res.data;
  },

  /** Get overdue follow-ups */
  getOverdueFollowups: async (petId: string): Promise<VetVisitListResponse> => {
    const res = await api.get(`/vetvisits/${petId}/overdue-follow-ups`);
    return res.data;
  },

  /** Get cost summary */
  getCostSummary: async (petId: string): Promise<{ success: boolean; data: any }> => {
    const res = await api.get(`/vetvisits/${petId}/cost-summary`);
    return res.data;
  },

  /** Get a single vet visit by ID */
  getById: async (visitId: string): Promise<VetVisitResponse> => {
    const res = await api.get(`/vetvisits/visit/${visitId}`);
    return res.data;
  },

  /** Create a new vet visit record */
  create: async (
    data: Record<string, any>,
  ): Promise<VetVisitResponse> => {
    const res = await api.post('/vetvisits/', data);
    return res.data;
  },

  /** Update a vet visit (uses PATCH per backend spec) */
  update: async (
    visitId: string,
    data: Partial<VetVisit>,
  ): Promise<VetVisitResponse> => {
    const res = await api.patch(`/vetvisits/visit/${visitId}`, data);
    return res.data;
  },

  /** Delete a vet visit */
  delete: async (
    visitId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/vetvisits/visit/${visitId}`);
    return res.data;
  },
};
