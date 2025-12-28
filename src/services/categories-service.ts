// Categories API service
import { apiClient } from './api-client';

export interface Category {
    id: string;
    name: string;
    user_id: string | null;
}

/**
 * Get all categories (system categories)
 */
export async function getCategories(): Promise<Category[]> {
    return apiClient<Category[]>('/categories');
}

/**
 * Create a custom category
 */
export async function createCategory(name: string): Promise<Category> {
    return apiClient<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}
