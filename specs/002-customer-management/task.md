# Customer Management — Task Breakdown

## Backend

### T01 — Customer Domain Entity & Enums
- Create `CustomerStatus` enum: Active, Inactive, Lead, Prospect
- Create `Gender` enum: Male, Female, Other
- Create `Customer` entity with all 15 fields: Id, FirstName, LastName, Company, Status, JobTitle, Gender, Age, Email, PhoneNumber, Industry, AnnualIncome, EmployeeCount, HeadquartersAddress, CreatedAt, UpdatedAt, IsDeleted

### T02 — EF Core Configuration & Migration
- Add `DbSet<Customer>` to `AppDbContext`
- Configure unique index on `Email`
- Configure global query filter: `WHERE IsDeleted = 0`
- Create migration: `AddCustomerTable`

### T03 — Customer Repository
- Define `ICustomerRepository` with:
  - `GetByIdAsync(Guid id)`
  - `GetPagedAsync(string search, int page, int pageSize)`
  - `EmailExistsAsync(string email, Guid? excludeId)`
  - `AddAsync(Customer customer)`
  - `UpdateAsync(Customer customer)`
  - `SoftDeleteAsync(Guid id)`
- Implement `CustomerRepository` using EF Core
- Register in DI

### T04 — Shared DTOs & PagedResult
- Create `PagedResult<T>` generic wrapper: Items, Total, Page, PageSize
- Create `CustomerSummaryDto`: Id, FirstName, LastName, Company, Email, Status, JobTitle, CreatedAt
- Create `CustomerDetailDto`: all fields

### T05 — CreateCustomerCommand
- Create `CreateCustomerCommand` record with all input fields
- Create `CreateCustomerValidator` (FluentValidation): FirstName/LastName NotEmpty, Email valid format + unique check via `ICustomerRepository.EmailExistsAsync`
- Create `CreateCustomerHandler`: validate → build entity → `AddAsync` → return new Id (Guid)

### T06 — UpdateCustomerCommand
- Create `UpdateCustomerCommand` record: Id + all editable fields
- Create `UpdateCustomerValidator`: Id exists, Email unique excluding self
- Create `UpdateCustomerHandler`: fetch by Id (throw NotFoundException if missing) → apply field changes → set UpdatedAt → `UpdateAsync`

### T07 — DeleteCustomerCommand
- Create `DeleteCustomerCommand` record: Id
- Create `DeleteCustomerHandler`: fetch by Id (throw NotFoundException if missing) → set IsDeleted = true, UpdatedAt = now → `UpdateAsync`

### T08 — GetCustomersQuery (Paginated + Search)
- Create `GetCustomersQuery`: Search (string), Page (int, default 1), PageSize (int, default 10)
- Create `GetCustomersHandler`: call `GetPagedAsync` → map to `CustomerSummaryDto` list → return `PagedResult<CustomerSummaryDto>`
- Search filters on: FirstName, LastName, Email, Company (case-insensitive, OR logic)

### T09 — GetCustomerByIdQuery
- Create `GetCustomerByIdQuery`: Id (Guid)
- Create `GetCustomerByIdHandler`: call `GetByIdAsync` (throw NotFoundException if missing) → map to `CustomerDetailDto` → return

### T10 — CustomersController & Authorization
- Create `CustomersController` with `[Authorize]` at class level
- `GET /api/customers` — accept Search, Page, PageSize query params → send `GetCustomersQuery`
- `GET /api/customers/{id}` — send `GetCustomerByIdQuery` → 404 if not found
- `POST /api/customers` — send `CreateCustomerCommand` → 201 Created; 409 Conflict on duplicate email
- `PUT /api/customers/{id}` — send `UpdateCustomerCommand` → 204 No Content; 409 on duplicate email
- `DELETE /api/customers/{id}` — `[Authorize(Policy = "customers.delete")]` → send `DeleteCustomerCommand` → 204 No Content
- Register `customers.delete` policy (Admin role only) in `Program.cs`

### T11 — Backend Unit Tests (nUnit)
- `CreateCustomerHandlerTests`: valid create returns Id, duplicate email throws, missing FirstName fails validation
- `UpdateCustomerHandlerTests`: valid update saves changes, email uniqueness excludes self, unknown Id throws NotFoundException
- `DeleteCustomerHandlerTests`: sets IsDeleted = true + UpdatedAt, unknown Id throws NotFoundException
- `GetCustomersHandlerTests`: returns paged result, search filters correctly, empty search returns all
- `GetCustomerByIdHandlerTests`: returns correct DTO, unknown Id throws NotFoundException
- `CreateCustomerValidatorTests`: email format validation, required field validation

---

## Frontend

### T12 — Customer API Client (`src/api/customers.ts`)
- Define TypeScript types: `CustomerSummary`, `CustomerDetail`, `CreateCustomerPayload`, `UpdateCustomerPayload`, `PagedResult<T>`
- `getCustomers(params: { search?, page, pageSize })` — GET `/api/customers`
- `getCustomerById(id: string)` — GET `/api/customers/:id`
- `createCustomer(data: CreateCustomerPayload)` — POST `/api/customers`
- `updateCustomer(id, data: UpdateCustomerPayload)` — PUT `/api/customers/:id`
- `deleteCustomer(id: string)` — DELETE `/api/customers/:id`

### T13 — React Query Hooks (`src/hooks/useCustomers.ts`)
- `useCustomers(params)` — `useQuery` for paginated list
- `useCustomer(id)` — `useQuery` for single customer detail
- `useCreateCustomer()` — `useMutation`, on success invalidate customer list query
- `useUpdateCustomer()` — `useMutation`, on success invalidate list + detail queries
- `useDeleteCustomer()` — `useMutation`, on success invalidate customer list query

### T14 — Application Layout (`src/components/Layout/`)
- `Sidebar.tsx` — MUI Drawer with nav items: Dashboard, Customers, Settings, Help; highlight active route
- `AppLayout.tsx` — outer shell combining Sidebar + `<Outlet />` (React Router nested layout)
- `TopBar.tsx` — page title display, user avatar (from AuthContext)
- Wire `AppLayout` as the parent route wrapping all protected pages in `App.tsx`

### T15 — Customer List Page (`src/pages/Customers/CustomerListPage.tsx`)
- MUI `Table` with columns: Name (First + Last), Company, Email, Status (chip), Job Title, Created At, Actions
- "Add Customer" button in top-right → navigate to `/customers/new`
- Debounced search bar (300ms) — updates `search` query param, resets to page 1
- `TablePagination` component driven by `page` + `pageSize` state
- Action column per row: Edit icon → `/customers/:id/edit`; Delete icon → open `DeleteConfirmDialog` (render only if user has Admin role)
- Loading skeleton (MUI `Skeleton`) while fetching
- Empty state message when no results match search

### T16 — Customer Form Page (`src/pages/Customers/CustomerFormPage.tsx`)
- Detect Create vs Edit mode from presence of `:id` route param
- Edit mode: fetch customer via `useCustomer(id)` and pre-populate form with `reset(data)` on load
- React Hook Form fields for all 15 customer fields:
  - FirstName, LastName (required)
  - Company, JobTitle, PhoneNumber, Industry, HeadquartersAddress (text)
  - Status (MUI Select)
  - Gender (MUI Select)
  - Age, AnnualIncome, EmployeeCount (number inputs)
  - Email (required, email format validation)
- On submit: call `useCreateCustomer` or `useUpdateCustomer` based on mode
- On success: navigate to `/customers`
- Map `409 Conflict` API response to inline error on Email field: "Email already in use"
- "Cancel" button navigates back to `/customers` without saving

### T17 — Customer Detail Page (`src/pages/Customers/CustomerDetailPage.tsx`)
- Fetch customer via `useCustomer(id)`, show loading skeleton during fetch
- Read-only MUI `Card` layout displaying all fields grouped by section (basic info, contact, company info)
- "Edit" button → navigate to `/customers/:id/edit`
- "Delete" button — visible to Admin role only → open `DeleteConfirmDialog`
- On delete success: navigate to `/customers`
- Back link to customer list

### T18 — Delete Confirm Dialog (`src/components/Customers/DeleteConfirmDialog.tsx`)
- MUI `Dialog` with message: "Are you sure you want to delete [FirstName LastName]?"
- "Delete" button (MUI `Button` color="error"): calls `useDeleteCustomer`, shows `CircularProgress` while loading
- "Cancel" button: closes dialog with no action
- Props: `open`, `customer`, `onClose`

### T19 — Routing Update (`src/App.tsx`)
- Add customer routes nested under `AppLayout` (protected):
  - `/customers` → `CustomerListPage`
  - `/customers/new` → `CustomerFormPage`
  - `/customers/:id` → `CustomerDetailPage`
  - `/customers/:id/edit` → `CustomerFormPage`
- Update `/` redirect to `/customers`

### T20 — Frontend Tests (Vitest + RTL)
- `CustomerListPage.test.tsx`: renders table rows from mock data, search input triggers debounced refetch, pagination controls update page param, delete button hidden for non-admin role
- `CustomerFormPage.test.tsx`: Create mode renders empty form; Edit mode pre-populates fields; valid submit calls correct mutation; 409 response sets Email field error
- `CustomerDetailPage.test.tsx`: renders all customer fields; delete button shown for Admin, hidden for non-Admin; delete success navigates to list
- `DeleteConfirmDialog.test.tsx`: cancel closes without mutation call; confirm calls `deleteCustomer` with correct Id; shows spinner during loading
