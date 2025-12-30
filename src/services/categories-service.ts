// Categories API service
import { apiClient } from './api-client';

export interface Category {
    id: string;
    name: string;
}

/**
 * Get all categories (static system-wide categories)
 */
export async function getCategories(): Promise<Category[]> {
    return apiClient<Category[]>('/categories');
}
