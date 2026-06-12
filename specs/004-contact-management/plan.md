# Contact Management — Execution Plan

## Overview

Implement Contact Management following the same Clean Architecture + CQRS pattern used for Customer and Lead features. A Contact represents a person associated with a Customer (Account).

---

## Phase 1: Domain Layer

### 1.1 Contact Status Enum
**File:** `src/CRM.Domain/Enums/ContactStatus.cs`

```
Active, Inactive
```

### 1.2 Contact Entity
**File:** `src/CRM.Domain/Entities/Contact.cs`

Extend `BaseEntity`. Fields:
- `FirstName` (string, required)
- `LastName` (string, nullable)
- `Email` (string, required)
- `Phone` (string, nullable)
- `AccountId` (Guid, nullable — FK to Customer)
- `Status` (ContactStatus enum, default: Active)
- `IsDeleted` (bool, default: false)

Navigation property:
- `Account` (Customer, nullable)

---

## Phase 2: Application Layer

### 2.1 DTOs
**File:** `src/CRM.Application/Features/Contacts/ContactDtos.cs`

- `ContactSummaryDto` — Id, FullName, Email, Phone (for list/grid)
- `ContactDetailDto` — all fields including AccountId, AccountName, Status (for get by id / edit form)

### 2.2 Create Contact
**Folder:** `src/CRM.Application/Features/Contacts/CreateContact/`

- `CreateContactCommand.cs` — `IRequest<Guid>` record (FirstName, LastName, Email, Phone, AccountId, Status)
- `CreateContactValidator.cs` — FluentValidation: FirstName required, Email required + valid format
- `CreateContactHandler.cs` — maps command → Contact entity, calls `IContactRepository.AddAsync`, returns Id

### 2.3 Update Contact
**Folder:** `src/CRM.Application/Features/Contacts/UpdateContact/`

- `UpdateContactCommand.cs` — `IRequest` record (Id + all updatable fields)
- `UpdateContactValidator.cs` — same rules as create
- `UpdateContactHandler.cs` — fetches contact via `GetByIdAsync`, updates fields, calls `UpdateAsync`

### 2.4 Get Contact By Id
**Folder:** `src/CRM.Application/Features/Contacts/GetContactById/`

- `GetContactByIdQuery.cs` — `IRequest<ContactDetailDto>` record (Id)
- `GetContactByIdHandler.cs` — calls `GetByIdAsync`, throws `NotFoundException` if null, maps to `ContactDetailDto`

### 2.5 Search Contacts
**Folder:** `src/CRM.Application/Features/Contacts/GetContacts/`

- `GetContactsQuery.cs` — `IRequest<PagedResult<ContactSummaryDto>>` record (Search, Page = 1, PageSize = 10)
- `GetContactsHandler.cs` — calls `GetPagedAsync`, maps entities to `ContactSummaryDto`

### 2.6 Delete Contact
**Folder:** `src/CRM.Application/Features/Contacts/DeleteContact/`

- `DeleteContactCommand.cs` — `IRequest` record (Id)
- `DeleteContactHandler.cs` — fetches contact, calls `SoftDeleteAsync`

### 2.7 Repository Interface
**File:** `src/CRM.Application/Interfaces/IContactRepository.cs`

Methods:
- `GetByIdAsync(Guid id)`
- `GetPagedAsync(string? search, int page, int pageSize)`
- `AddAsync(Contact contact)`
- `UpdateAsync(Contact contact)`
- `SoftDeleteAsync(Guid id)`

---

## Phase 3: Infrastructure Layer

### 3.1 EF Core Configuration
**File:** `src/CRM.Infrastructure/Persistence/Configurations/ContactConfiguration.cs`

- Table name: `Contacts`
- Required fields: FirstName, Email
- Default value for Status: Active
- `AccountId` as nullable FK to `Customers` table
- Configure navigation property: `Contact` → `Customer` (many-to-one)

### 3.2 DbContext Update
**File:** `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

Add: `DbSet<Contact> Contacts`

### 3.3 Contact Repository
**File:** `src/CRM.Infrastructure/Repositories/ContactRepository.cs`

Implement `IContactRepository`:
- `GetByIdAsync` — include `Account` navigation property for AccountName
- `GetPagedAsync` — filter by search on FirstName, LastName, Email, Phone; exclude soft-deleted; order by CreatedAt desc
- `SoftDeleteAsync` — set `IsDeleted = true`

### 3.4 DI Registration
**File:** `src/CRM.API/Program.cs`

Add: `builder.Services.AddScoped<IContactRepository, ContactRepository>();`

### 3.5 Database Migration
Run after all infrastructure changes:
```
dotnet ef migrations add AddContactTable --project src/CRM.Infrastructure --startup-project src/CRM.API
dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
```

---

## Phase 4: API Layer

### 4.1 Authorization Policies
**File:** `src/CRM.API/Program.cs`

Add policies: `contacts.view`, `contacts.create`, `contacts.edit`, `contacts.delete`

### 4.2 Contacts Controller
**File:** `src/CRM.API/Controllers/ContactsController.cs`

| Method | Route | Handler | Policy |
|--------|-------|---------|--------|
| GET | `/api/contacts` | `GetContactsQuery` | contacts.view |
| GET | `/api/contacts/{id}` | `GetContactByIdQuery` | contacts.view |
| POST | `/api/contacts` | `CreateContactCommand` | contacts.create |
| PUT | `/api/contacts/{id}` | `UpdateContactCommand` | contacts.edit |
| DELETE | `/api/contacts/{id}` | `DeleteContactCommand` | contacts.delete |

---

## Phase 5: Frontend

### 5.1 API Client
**File:** `web/src/api/contacts.ts`

Types: `ContactSummary`, `ContactDetail`, `CreateContactPayload`, `UpdateContactPayload`, `ContactsPagedResult`

Functions:
- `getContacts(params: { search?, page?, pageSize? })`
- `getContactById(id: string)`
- `createContact(payload: CreateContactPayload)`
- `updateContact(id: string, payload: UpdateContactPayload)`
- `deleteContact(id: string)`

### 5.2 Contact List Page
**File:** `web/src/pages/Contacts/ContactListPage.tsx`

Features:
- Search input with debounce
- Paginated MUI Table with columns: Name, Email, Phone
- "Add Contact" button → navigates to `/contacts/new`
- Edit icon → navigates to `/contacts/:id/edit`
- Delete icon → opens `DeleteConfirmDialog`, calls `deleteContact`
- React Query (`useQuery`) for data fetching with cache invalidation on mutation

### 5.3 Contact Form Page
**File:** `web/src/pages/Contacts/ContactFormPage.tsx`

Shared create/edit form:
- Fields: First Name, Last Name, Email, Phone, Account (MUI Select populated from `GET /api/customers`)
- React Hook Form for form state
- On load (edit): fetch contact by id, populate form
- On submit: call `createContact` or `updateContact` via `useMutation`, redirect to list on success
- Client-side validation: FirstName required, Email required + valid format

### 5.4 Routing
**File:** `web/src/App.tsx` (or router config)

Add routes:
```
/contacts              → ContactListPage
/contacts/new          → ContactFormPage (create mode)
/contacts/:id/edit     → ContactFormPage (edit mode)
```

### 5.5 Navigation
**File:** `web/src/components/Layout/` (sidebar/nav component)

Add "Contacts" nav item linking to `/contacts`.

---

## Phase 6: Tests

### 6.1 Backend Unit Tests
**Project:** `src/CRM.Tests/`

- `CreateContactValidatorTests.cs` — required fields (FirstName, Email) and email format
- `CreateContactHandlerTests.cs` — entity creation and repository call
- `GetContactsHandlerTests.cs` — paging and search filtering

### 6.2 Frontend Tests
**Location:** alongside page components (`*.test.tsx`)

- `ContactListPage.test.tsx` — renders list, search triggers refetch, delete confirm dialog
- `ContactFormPage.test.tsx` — form validation errors shown, submit calls correct API

---

## Execution Order

1. Domain: ContactStatus enum → Contact entity
2. Application: IContactRepository interface → DTOs → all Commands/Queries/Handlers
3. Infrastructure: ContactConfiguration → DbContext update → ContactRepository → DI registration → migration
4. API: authorization policies → ContactsController
5. Frontend: API client → ContactListPage → ContactFormPage → routing → navigation
6. Tests: validators, handlers, page components
