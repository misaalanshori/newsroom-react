import { apiClient } from './client';
import type { Department } from './department';

export interface User {
    id: number;
    username: string;
}

export interface News {
    id: number;
    title: string;
    contents: string;
    departmentId: number;
    writerId: number;
    department?: Department;
    writer?: User;
}

export interface CreateNewsDto {
    title: string;
    contents: string;
    departmentId?: number;
}

export interface UpdateNewsDto {
    title?: string;
    contents?: string;
    departmentId?: number;
}

export const newsApi = {
    getAll: async () => {
        const response = await apiClient.get<News[]>('/news');
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await apiClient.get<News>(`/news/${id}`);
        return response.data;
    },
    create: async (data: CreateNewsDto) => {
        const response = await apiClient.post<News>('/news', data);
        return response.data;
    },
    update: async (id: number, data: UpdateNewsDto) => {
        const response = await apiClient.put<News>(`/news/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await apiClient.delete(`/news/${id}`);
    },
};
