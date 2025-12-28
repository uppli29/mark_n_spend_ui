# Expense Tracker Frontend Documentation

This documentation provides an overview of all frontend components and services to help developers understand, navigate, and debug the application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Components](#components)
- [Authentication](#authentication)
- [Data Flow](#data-flow)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
src/
├── App.tsx                 # Main app entry, routing, theme management
├── services/               # API service layer
│   ├── api-client.ts       # Base API client with auth
│   ├── accounts-service.ts # Accounts CRUD
│   ├── expenses-service.ts # Expenses CRUD + summaries
│   └── categories-service.ts # Categories API
├── components/
│   ├── auth/               # Authentication components
│   ├── dashboard.tsx       # Dashboard with charts
│   ├── expenses.tsx        # Expenses list with filters
│   ├── accounts.tsx        # Accounts management
│   └── ui/                 # Reusable UI components (shadcn)
└── index.css               # Global styles and CSS variables
```

---

## Services

### `api-client.ts`

**Purpose**: Base API client that handles all HTTP requests with automatic JWT token injection.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `apiClient<T>()` | `endpoint: string, options?: RequestOptions` | `Promise<T>` | Makes authenticated API requests |

**Key Features**:
- Automatically adds `Authorization: Bearer <token>` header
- Handles query parameters via `params` option
- Returns parsed JSON response
- Throws error with detail message on failure

**Usage Example**:
```typescript
const data = await apiClient<Account[]>('/accounts');
```

---

### `accounts-service.ts`

**Purpose**: CRUD operations for user accounts (bank accounts, cards).

| Function | Parameters | Returns | API Endpoint |
|----------|------------|---------|--------------|
| `getAccounts()` | - | `Promise<Account[]>` | `GET /accounts` |
| `createAccount()` | `{ name, type }` | `Promise<Account>` | `POST /accounts` |
| `updateAccount()` | `id, { name }` | `Promise<Account>` | `PUT /accounts/{id}` |
| `deleteAccount()` | `id: string` | `Promise<void>` | `DELETE /accounts/{id}` |

**Types**:
```typescript
type AccountType = 'BANK' | 'CARD';
interface Account { id, user_id, name, type }
```

---

### `expenses-service.ts`

**Purpose**: CRUD operations for expenses and summary data for charts.

| Function | Parameters | Returns | API Endpoint |
|----------|------------|---------|--------------|
| `getExpenses()` | `filters?: ExpenseFilters` | `Promise<Expense[]>` | `GET /expenses?from=&to=&account=` |
| `createExpense()` | `CreateExpenseData` | `Promise<Expense>` | `POST /expenses` |
| `deleteExpense()` | `id: string` | `Promise<void>` | `DELETE /expenses/{id}` |
| `getExpenseSummary()` | `period, referenceDate?` | `Promise<ExpenseSummary>` | `GET /expenses/summary?period=` |

**Filter Options**:
```typescript
interface ExpenseFilters {
  from?: string;      // Start date (YYYY-MM-DD)
  to?: string;        // End date (YYYY-MM-DD)
  account?: string;   // Account UUID
  category?: string;  // Category UUID
  limit?: number;     // Max results (default: 100)
}
```

**Summary Periods**: `'daily' | 'weekly' | 'monthly'`

---

### `categories-service.ts`

**Purpose**: Fetch expense categories (system-defined).

| Function | Returns | API Endpoint |
|----------|---------|--------------|
| `getCategories()` | `Promise<Category[]>` | `GET /categories` |

---

## Components

### `App.tsx`

**Purpose**: Root component handling authentication, routing, and global state.

**Responsibilities**:
- Wraps app with `AuthProvider`
- Fetches shared data (accounts, categories) on login
- Manages tab navigation (Dashboard, Expenses, Accounts)
- Handles theme toggle (light/dark)

**State**:
| State | Type | Description |
|-------|------|-------------|
| `activeTab` | `'dashboard' | 'expenses' | 'accounts'` | Current page |
| `accounts` | `Account[]` | User's accounts |
| `categories` | `Category[]` | Available categories |
| `theme` | `'light' | 'dark'` | Current theme |

---

### `dashboard.tsx`

**Purpose**: Main dashboard with expense summaries and pie charts.

**Data Fetching**:
- Calls `getExpenseSummary('weekly')` for weekly chart
- Calls `getExpenseSummary('monthly')` for monthly chart
- Calls `getExpenses({ limit: 10 })` for recent expenses

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `accounts` | `Account[]` | Available accounts |
| `categories` | `Category[]` | Category list for mapping IDs to names |
| `onAddExpense` | `function` | Callback to add new expense |
| `onExpenseAdded` | `function` | Callback after expense added |

**Debugging Tips**:
- If charts are empty: Check `getExpenseSummary` API response in Network tab
- If category names show "Unknown": Categories API may have failed

---

### `expenses.tsx`

**Purpose**: Filterable list of expenses with chart breakdown.

**Data Fetching**:
- Calls `getExpenses({ from, to, account, limit: 500 })` when filters change
- Filters are applied server-side for performance

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `accounts` | `Account[]` | For account filter dropdown |
| `categories` | `Category[]` | For mapping category IDs to names |

**State**:
| State | Description |
|-------|-------------|
| `startDate` | Filter start date (default: 30 days ago) |
| `endDate` | Filter end date (default: today) |
| `selectedAccountId` | Selected account filter ('all' or UUID) |
| `expenses` | Fetched expenses array |

**Debugging Tips**:
- Check Network tab for `/expenses?from=...&to=...` calls
- Verify date format is `YYYY-MM-DD`

---

### `accounts.tsx`

**Purpose**: Display and manage user accounts.

**Data Fetching**:
- Calls `getExpenses({ limit: 500 })` to calculate per-account stats

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `accounts` | `Account[]` | User's accounts |
| `onAddAccount` | `function` | Callback to add account |
| `onDeleteAccount` | `function` | Callback to delete account |

---

### `add-expense-modal.tsx`

**Purpose**: Modal form for adding new expenses.

**Required Data**:
- `accounts` - For account selection dropdown
- `categories` - For category selection dropdown

**Form Fields**:
| Field | Type | Validation |
|-------|------|------------|
| `amount` | number | Must be > 0 |
| `categoryId` | UUID | Required |
| `accountId` | UUID | Required |
| `description` | string | Required |
| `date` | date | Required |

---

### `add-account-modal.tsx`

**Purpose**: Modal form for adding new accounts.

**Form Fields**:
| Field | Type | Options |
|-------|------|---------|
| `name` | string | Required |
| `type` | enum | 'BANK' or 'CARD' |

---

## Authentication

### `auth-context.tsx`

**Purpose**: Global authentication state management.

**Exports**:
| Export | Description |
|--------|-------------|
| `AuthProvider` | Context provider wrapper |
| `useAuth()` | Hook to access auth state |
| `getAccessToken()` | Get current JWT token (for api-client) |

**State**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  register: (email, password) => Promise<void>;
  logout: () => void;
}
```

**Token Storage**:
- Access token: In-memory (secure)
- Refresh token: `localStorage.refreshToken`
- User info: `localStorage.user`

---

### `auth-service.ts`

**Purpose**: API calls for authentication.

| Function | Endpoint | Description |
|----------|----------|-------------|
| `loginUser()` | `POST /auth/login` | OAuth2 password flow |
| `registerUser()` | `POST /auth/register` | Create new user |
| `refreshAccessToken()` | `POST /auth/refresh` | Refresh JWT |

---

## Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Component  │───▶│   Service    │───▶│  Backend    │
│  (React)    │◀───│  (API Layer) │◀───│  (FastAPI)  │
└─────────────┘    └──────────────┘    └─────────────┘
       │                  │
       ▼                  ▼
   Local State      api-client.ts
   (useState)       (adds JWT token)
```

**Example: Adding an Expense**
1. User fills form in `AddExpenseModal`
2. `onAdd()` prop called → triggers `createExpense()` in App.tsx
3. `createExpense()` calls `expenses-service.ts`
4. Service uses `api-client.ts` to POST to `/expenses`
5. On success, Dashboard refreshes its data

---

## Troubleshooting

### Common Issues

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| 401 Unauthorized | Token expired or invalid | Check `getAccessToken()` returns valid token |
| Empty charts | No expenses in period | Verify date range, check API response |
| Category shows "Unknown" | Category ID not in map | Ensure categories are fetched |
| CORS errors | Backend not configured | Check FastAPI CORS middleware |

### Debugging Steps

1. **Check Network Tab**: Inspect API calls for status codes and response bodies
2. **Check Console**: Look for error messages from catch blocks
3. **Verify Token**: `console.log(getAccessToken())` to check if token exists
4. **Check localStorage**: Verify `user` and `refreshToken` are stored

### API Base URL

The API base URL is hardcoded in `api-client.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

For production, update this to use environment variables.
