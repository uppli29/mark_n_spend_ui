// Accounts API service
import { apiClient } from './api-client';

export type AccountType = 'BANK' | 'CARD';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
}

export interface CreateAccountData {
    name: string;
    type: AccountType;
}

export interface UpdateAccountData {
    name?: string;
}

/**
 * Get all accounts for the current user
 */
export async function getAccounts(): Promise<Account[]> {
    return apiClient<Account[]>('/accounts');
}

/**
 * Create a new account
 */
export async function createAccount(data: CreateAccountData): Promise<Account> {
    return apiClient<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an account
 */
export async function updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    return apiClient<Account>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete an account
 */
export async function deleteAccount(id: string): Promise<void> {
    return apiClient<void>(`/accounts/${id}`, {
        method: 'DELETE',
    });
}
