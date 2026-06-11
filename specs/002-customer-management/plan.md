# Customer Management — Technical Implementation Plan

## Stack
- **Backend:** ASP.NET Core 9, EF Core (Code First), SQL Server, Clean Architecture, CQRS + MediatR, FluentValidation, JWT + Role-Based Authorization
- **Frontend:** React + TypeScript, Material UI, React Hook Form, React Query

---

## Backend

### 1. Domain Layer (`CRM.Domain`)

**Entity: `Customer`**
| Field | Type | Notes |
|---|---|---|
| Id | Guid | PK |
| FirstName | string | Required |
| LastName | string | Required |
| Company | string | |
| Status | CustomerStatus (enum) | Active, Inactive, Lead, Prospect |
| JobTitle | string | |
| Gender | Gender (enum) | Male, Female, Other |
| Age | int | |
| Email | string | Unique |
| PhoneNumber | string | |
| Industry | string | |
| AnnualIncome | decimal | |
| EmployeeCount | int | |
| HeadquartersAddress | string | |
| CreatedAt | DateTime | |
| UpdatedAt | DateTime | |
| IsDeleted | bool | Soft delete |

**Enums**
- `CustomerStatus`: Active, Inactive, Lead, Prospect
- `Gender`: Male, Female, Other

### 2. Infrastructure Layer (`CRM.Infrastructure`)

**EF Core**
- Add `DbSet<Customer>` to `AppDbContext`
- Configure unique index on `Email`
- Configure soft delete global query filter (`WHERE IsDeleted = 0`)
- Migration: `AddCustomerTable`

**Repository**
- `ICustomerRepository` interface:
  - `GetByIdAsync(Guid id)`
  - `GetPagedAsync(string search, int page, int pageSize)`
  - `EmailExistsAsync(string email, Guid? excludeId)`
  - `AddAsync(Customer customer)`
  - `UpdateAsync(Customer customer)`
  - `SoftDeleteAsync(Guid id)`
- `CustomerRepository` implementing above via EF Core

### 3. Application Layer (`CRM.Application`)

#### Commands

**CreateCustomerCommand** (`Features/Customers/Create/`)
```
CreateCustomerCommand
  - FirstName, LastName      : string (required)
  - Company, JobTitle        : string
  - Status                   : CustomerStatus
  - Gender                   : Gender
  - Age                      : int
  - Email                    : string (required, unique)
  - PhoneNumber              : string
  - Industry                 : string
  - AnnualIncome             : decimal
  - EmployeeCount            : int
  - HeadquartersAddress      : string

Returns: Guid (new customer Id)
```
- `CreateCustomerValidator`: FirstName NotEmpty, LastName NotEmpty, Email valid format + unique check via repository
- `CreateCustomerHandler`: validate → create entity → save → return Id

**UpdateCustomerCommand** (`Features/Customers/Update/`)
```
UpdateCustomerCommand
  - Id : Guid
  - (same fields as Create)

Returns: Unit
```
- `UpdateCustomerValidator`: Id exists, Email unique excluding self
- `UpdateCustomerHandler`: fetch → apply changes → save

**DeleteCustomerCommand** (`Features/Customers/Delete/`)
```
DeleteCustomerCommand
  - Id : Guid

Returns: Unit
```
- `DeleteCustomerHandler`: fetch → soft delete (set IsDeleted = true, UpdatedAt = now) → save

#### Queries

**GetCustomersQuery** (`Features/Customers/GetAll/`)
```
GetCustomersQuery
  - Search   : string (filters on Name, Email, Company)
  - Page     : int (default 1)
  - PageSize : int (default 10)

Returns: PagedResult<CustomerSummaryDto>
  - Items    : List<CustomerSummaryDto>
  - Total    : int
  - Page     : int
  - PageSize : int

CustomerSummaryDto: Id, FirstName, LastName, Company, Email, Status, JobTitle, CreatedAt
```

**GetCustomerByIdQuery** (`Features/Customers/GetById/`)
```
GetCustomerByIdQuery
  - Id : Guid

Returns: CustomerDetailDto (all fields)
```

#### Shared DTOs
- `PagedResult<T>` generic wrapper
- `CustomerSummaryDto` — list view fields only
- `CustomerDetailDto` — all fields

### 4. API Layer (`CRM.API`)

**Controller:** `CustomersController` — `/api/customers`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/customers` | Authenticated | Paginated list with search |
| GET | `/api/customers/{id}` | Authenticated | Customer details |
| POST | `/api/customers` | Authenticated | Create customer |
| PUT | `/api/customers/{id}` | Authenticated | Update customer |
| DELETE | `/api/customers/{id}` | Admin only | Soft delete customer |

- `[Authorize]` on controller; `[Authorize(Policy = "customers.delete")]` on DELETE endpoint
- Register `customers.delete` policy (Admin role only) in `Program.cs`
- Return `409 Conflict` when duplicate email is detected
- Return `404 Not Found` when customer Id does not exist

---

## Frontend

### 1. Customer API (`src/api/customers.ts`)
- `getCustomers(params: { search?, page, pageSize })` — GET `/api/customers`
- `getCustomerById(id: string)` — GET `/api/customers/:id`
- `createCustomer(data: CreateCustomerPayload)` — POST `/api/customers`
- `updateCustomer(id, data: UpdateCustomerPayload)` — PUT `/api/customers/:id`
- `deleteCustomer(id: string)` — DELETE `/api/customers/:id`

### 2. React Query Hooks (`src/hooks/useCustomers.ts`)
- `useCustomers(params)` — `useQuery` for paginated list
- `useCustomer(id)` — `useQuery` for single customer
- `useCreateCustomer()` — `useMutation`, invalidates list on success
- `useUpdateCustomer()` — `useMutation`, invalidates list + detail on success
- `useDeleteCustomer()` — `useMutation`, invalidates list on success

### 3. Application Layout (`src/components/Layout/`)

Matches mockup: sidebar + main content area.

- `AppLayout.tsx` — outer shell: `Sidebar` + `<Outlet />` (React Router)
- `Sidebar.tsx` — MUI Drawer with nav items: Dashboard, Customers, Settings, Help
- `TopBar.tsx` — page title, user avatar, search (global placeholder)

### 4. Customer List Page (`src/pages/Customers/CustomerListPage.tsx`)

- MUI `Table` with columns: Name, Company, Email, Status, Job Title, Created At, Actions
- Checkbox column for bulk selection (UI only, no bulk action in this spec)
- **Search bar** — debounced text input, updates `search` query param
- **Pagination** — MUI `TablePagination`, driven by `page` + `pageSize` state
- **Action column** per row:
  - Edit icon → navigate to `/customers/:id/edit`
  - Delete icon → confirm dialog (visible to Admin only, hidden for other roles)
- "Add Customer" button → navigate to `/customers/new`
- Loading skeleton while fetching; empty state when no results

### 5. Customer Form (`src/pages/Customers/CustomerFormPage.tsx`)

Shared for Create and Edit (driven by presence of `:id` route param).

**React Hook Form fields (matching spec fields):**
- First Name, Last Name (required)
- Company, Job Title
- Status (MUI Select: Active / Inactive / Lead / Prospect)
- Gender (MUI Select: Male / Female / Other)
- Age (number input)
- Email (required, email format)
- Phone Number
- Industry
- Annual Income (number input)
- Employee Count (number input)
- Headquarters Address

**Behaviour:**
- Edit mode: pre-populate from `useCustomer(id)` on mount
- On submit: call `useCreateCustomer` or `useUpdateCustomer`
- On success: navigate back to `/customers`
- Show `409 Conflict` API error inline on Email field ("Email already in use")
- "Cancel" button navigates back without saving

### 6. Customer Detail Page (`src/pages/Customers/CustomerDetailPage.tsx`)

- Read-only view of all fields in a MUI `Card` layout
- "Edit" button → `/customers/:id/edit`
- "Delete" button (Admin only) → confirm dialog → call `useDeleteCustomer` → redirect to list
- Back link to list

### 7. Delete Confirmation Dialog (`src/components/Customers/DeleteConfirmDialog.tsx`)
- MUI `Dialog` with customer name in message
- "Delete" (destructive) and "Cancel" buttons
- Shows loading state during mutation

### 8. Routing (`src/App.tsx`)

```
/customers             → CustomerListPage       (protected)
/customers/new         → CustomerFormPage       (protected)
/customers/:id         → CustomerDetailPage     (protected)
/customers/:id/edit    → CustomerFormPage       (protected)
```

---

## File Structure

```
CRM.Domain/
  Entities/Customer.cs
  Enums/CustomerStatus.cs
  Enums/Gender.cs

CRM.Infrastructure/
  Persistence/AppDbContext.cs          ← add Customer DbSet
  Persistence/Migrations/AddCustomerTable.cs
  Repositories/CustomerRepository.cs

CRM.Application/
  Common/PagedResult.cs
  Features/Customers/Create/CreateCustomerCommand.cs
  Features/Customers/Create/CreateCustomerHandler.cs
  Features/Customers/Create/CreateCustomerValidator.cs
  Features/Customers/Update/UpdateCustomerCommand.cs
  Features/Customers/Update/UpdateCustomerHandler.cs
  Features/Customers/Update/UpdateCustomerValidator.cs
  Features/Customers/Delete/DeleteCustomerCommand.cs
  Features/Customers/Delete/DeleteCustomerHandler.cs
  Features/Customers/GetAll/GetCustomersQuery.cs
  Features/Customers/GetAll/GetCustomersHandler.cs
  Features/Customers/GetById/GetCustomerByIdQuery.cs
  Features/Customers/GetById/GetCustomerByIdHandler.cs
  DTOs/CustomerSummaryDto.cs
  DTOs/CustomerDetailDto.cs

CRM.API/
  Controllers/CustomersController.cs

src/
  api/customers.ts
  hooks/useCustomers.ts
  components/Layout/AppLayout.tsx
  components/Layout/Sidebar.tsx
  components/Customers/DeleteConfirmDialog.tsx
  pages/Customers/CustomerListPage.tsx
  pages/Customers/CustomerFormPage.tsx
  pages/Customers/CustomerDetailPage.tsx
```

---

## Implementation Order

1. Domain entity + enums + EF migration
2. `CustomerRepository`
3. `CreateCustomerCommand` + handler + validator
4. `UpdateCustomerCommand` + handler + validator
5. `DeleteCustomerCommand` + handler
6. `GetCustomersQuery` + handler (pagination + search)
7. `GetCustomerByIdQuery` + handler
8. `CustomersController` + permission policy wiring
9. `AppLayout` + `Sidebar` + routing shell
10. `CustomerListPage` (table + search + pagination)
11. `CustomerFormPage` (create + edit)
12. `CustomerDetailPage`
13. `DeleteConfirmDialog` + role-gated visibility
14. Tests

---

## Testing

**Backend (nUnit)**
- `CreateCustomerHandlerTests`: valid create, duplicate email rejected, missing required fields
- `UpdateCustomerHandlerTests`: valid update, email uniqueness excludes self, customer not found
- `DeleteCustomerHandlerTests`: soft delete sets IsDeleted, customer not found
- `GetCustomersHandlerTests`: pagination, search filters by name/email/company
- `CreateCustomerValidatorTests`: email format, required fields

**Frontend (Vitest + RTL)**
- `CustomerListPage`: renders rows, search triggers refetch, pagination controls work
- `CustomerFormPage`: pre-populates on edit, submits correct payload, shows 409 error on email field
- `CustomerDetailPage`: renders all fields, delete button hidden for non-admin
- `DeleteConfirmDialog`: cancel aborts, confirm calls mutation
