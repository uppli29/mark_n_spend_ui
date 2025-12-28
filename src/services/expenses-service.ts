// Expenses API service
import { apiClient } from './api-client';

export interface Expense {
    id: string;
    user_id: string;
    amount: number;
    category_id: string;
    account_id: string;
    card_id: string | null;
    description: string | null;
    expense_date: string;
    created_at: string;
}

export interface CreateExpenseData {
    amount: number;
    category_id: string;
    account_id: string;
    card_id?: string | null;
    description?: string | null;
    expense_date: string;
}

export interface ExpenseFilters {
    from?: string;
    to?: string;
    account?: string;
    category?: string;
    limit?: number;
    offset?: number;
}

export type SummaryPeriod = 'daily' | 'weekly' | 'monthly';

export interface CategorySummary {
    category_id: string;
    category_name: string;
    total: number;
}

export interface AccountSummary {
    account_id: string;
    account_name: string;
    total: number;
}

export interface ExpenseSummary {
    period: SummaryPeriod;
    start_date: string;
    end_date: string;
    total: number;
    by_category: CategorySummary[];
    by_account: AccountSummary[];
}

/**
 * Get all expenses with optional filters
 */
export async function getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    return apiClient<Expense[]>('/expenses', {
        params: filters as Record<string, string | number | boolean | undefined>,
    });
}

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseData): Promise<Expense> {
    return apiClient<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
    return apiClient<void>(`/expenses/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Get expense summary for a period (daily, weekly, monthly)
 */
export async function getExpenseSummary(
    period: SummaryPeriod,
    referenceDate?: string
): Promise<ExpenseSummary> {
    return apiClient<ExpenseSummary>('/expenses/summary', {
        params: {
            period,
            reference_date: referenceDate,
        },
    });
}
