import { apiClient } from './client';

export interface CasbinRule {
    id: number;
    ptype: string;  // 'p' for policy or 'g' for group/hierarchy
    v0: string;     // role or user:ID (for p) | child role (for g)
    v1: string;     // resource (for p) | parent role (for g)
    v2?: string;    // scope
    v3?: string;    // ownership
    v4?: string;    // action
    v5?: string;
}

export interface CreatePolicyDto {
    ptype: string;
    v0: string;
    v1: string;
    v2?: string;
    v3?: string;
    v4?: string;
    v5?: string;
}

export interface PolicyFilter {
    ptype?: string;
    v0?: string;
    v1?: string;
    v2?: string;
    v3?: string;
    v4?: string;
    v5?: string;
}

export const policyApi = {
    getAll: async (filter?: PolicyFilter) => {
        const params = new URLSearchParams();
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }
        const response = await apiClient.get<CasbinRule[]>(`/policy?${params.toString()}`);
        return response.data;
    },

    create: async (dto: CreatePolicyDto) => {
        const response = await apiClient.post<CasbinRule>('/policy', dto);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<CasbinRule>(`/policy/${id}`);
        return response.data;
    },

    reload: async () => {
        const response = await apiClient.post<{ message: string }>('/policy/reload');
        return response.data;
    },
};
