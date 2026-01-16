import { apiClient } from './client';

export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface CreateRoleDto {
    name: string;
    slug: string;
}

export interface UpdateRoleDto {
    name?: string;
    slug?: string;
}

export const roleApi = {
    getAll: async () => {
        const response = await apiClient.get<Role[]>('/role');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Role>(`/role/${id}`);
        return response.data;
    },

    create: async (dto: CreateRoleDto) => {
        const response = await apiClient.post<Role>('/role', dto);
        return response.data;
    },

    update: async (id: number, dto: UpdateRoleDto) => {
        const response = await apiClient.patch<Role>(`/role/${id}`, dto);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<Role>(`/role/${id}`);
        return response.data;
    },
};
