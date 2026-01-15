import { apiClient } from './client';
import type { Permission } from '../hooks/useAuth';

export interface User {
    id: number;
    username: string;
    roleId?: number;
    departmentId?: number;
    role: {
        id: number;
        name: string;
        slug: string;
    };
    department?: {
        id: number;
        name: string;
        slug: string;
    };
    permissions?: Permission[];
}

export interface UpdateUserDto {
    username?: string;
    password?: string;
    roleId?: number;
    departmentId?: number;
}

export const userApi = {
    getAll: async () => {
        const response = await apiClient.get<User[]>('/user');
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await apiClient.get<User>(`/user/${id}`);
        return response.data;
    },
    getMe: async () => {
        const response = await apiClient.get<User>('/user/me');
        return response.data;
    },
    update: async (id: number, data: UpdateUserDto) => {
        const response = await apiClient.put<User>(`/user/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await apiClient.delete(`/user/${id}`);
    },
};
