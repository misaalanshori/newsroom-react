import { apiClient } from './client';

export interface Department {
    id: number;
    name: string;
    slug: string;
}

export interface CreateDepartmentDto {
    name: string;
    slug: string;
}

export interface UpdateDepartmentDto {
    name: string;
    slug: string;
}

export const departmentApi = {
    getAll: async () => {
        const response = await apiClient.get<Department[]>('/department');
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await apiClient.get<Department>(`/department/${id}`);
        return response.data;
    },
    create: async (data: CreateDepartmentDto) => {
        const response = await apiClient.post<Department>('/department', data);
        return response.data;
    },
    update: async (id: number, data: UpdateDepartmentDto) => {
        const response = await apiClient.put<Department>(`/department/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await apiClient.delete(`/department/${id}`);
    },
};
