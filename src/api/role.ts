import { apiClient } from './client';

export interface Role {
    id: number;
    name: string;
    slug: string;
}

export const roleApi = {
    getAll: async () => {
        const response = await apiClient.get<Role[]>('/role');
        return response.data;
    },
};
