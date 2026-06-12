# Opportunity Management — Execution Plan

## Overview

Implement Opportunity Management following the same Clean Architecture + CQRS pattern used across the CRM. An Opportunity tracks a potential sale, linked to an Account (required) and optionally a Contact. Stage drives the sales pipeline progression.

---

## Phase 1: Domain Layer

### 1.1 Opportunity Stage Enum
**File:** `src/CRM.Domain/Enums/OpportunityStage.cs`

```
Prospecting, Qualification, Proposal, Negotiation, ClosedWon, ClosedLost
```

### 1.2 Opportunity Entity
**File:** `src/CRM.Domain/Entities/Opportunity.cs`

Extend `BaseEntity`. Fields:
- `OpportunityName` (string, required)
- `AccountId` (Guid, required — FK to Account)
- `ContactId` (Guid, nullable — FK to Contact)
- `Stage` (OpportunityStage enum, default: Prospecting)
- `ExpectedRevenue` (decimal, nullable)
- `CloseDate` (DateTime, nullable)
- `IsDeleted` (bool, default: false)

Navigation properties:
- `Account` (Account, required)
- `Contact` (Contact, nullable)

---

## Phase 2: Application Layer

### 2.1 DTOs
**File:** `src/CRM.Application/Features/Opportunities/OpportunityDtos.cs`

- `OpportunitySummaryDto` — Id, OpportunityName, AccountName, Stage, ExpectedRevenue (for list/grid)
- `OpportunityDetailDto` — all fields including AccountId, AccountName, ContactId, ContactName, CloseDate (for get by id / edit form)

### 2.2 Create Opportunity
**Folder:** `src/CRM.Application/Features/Opportunities/CreateOpportunity/`

- `CreateOpportunityCommand.cs` — `IRequest<Guid>` record (OpportunityName, AccountId, ContactId, Stage, ExpectedRevenue, CloseDate)
- `CreateOpportunityValidator.cs` — FluentValidation: OpportunityName required, AccountId required (not empty Guid)
- `CreateOpportunityHandler.cs` — maps command → Opportunity entity, calls `IOpportunityRepository.AddAsync`, returns Id

### 2.3 Update Opportunity
**Folder:** `src/CRM.Application/Features/Opportunities/UpdateOpportunity/`

- `UpdateOpportunityCommand.cs` — `IRequest` record (Id + all updatable fields)
- `UpdateOpportunityValidator.cs` — same rules as create
- `UpdateOpportunityHandler.cs` — fetches opportunity via `GetByIdAsync`, updates fields, calls `UpdateAsync`

### 2.4 Get Opportunity By Id
**Folder:** `src/CRM.Application/Features/Opportunities/GetOpportunityById/`

- `GetOpportunityByIdQuery.cs` — `IRequest<OpportunityDetailDto>` record (Id)
- `GetOpportunityByIdHandler.cs` — calls `GetByIdAsync`, throws `NotFoundException` if null, maps to `OpportunityDetailDto`

### 2.5 Search Opportunities
**Folder:** `src/CRM.Application/Features/Opportunities/GetOpportunities/`

- `GetOpportunitiesQuery.cs` — `IRequest<PagedResult<OpportunitySummaryDto>>` record (Search, Page = 1, PageSize = 10)
- `GetOpportunitiesHandler.cs` — calls `GetPagedAsync`, maps entities to `OpportunitySummaryDto`

### 2.6 Delete Opportunity
**Folder:** `src/CRM.Application/Features/Opportunities/DeleteOpportunity/`

- `DeleteOpportunityCommand.cs` — `IRequest` record (Id)
- `DeleteOpportunityHandler.cs` — fetches opportunity, calls `SoftDeleteAsync`

### 2.7 Repository Interface
**File:** `src/CRM.Application/Interfaces/IOpportunityRepository.cs`

Methods:
- `GetByIdAsync(Guid id)`
- `GetPagedAsync(string? search, int page, int pageSize)`
- `AddAsync(Opportunity opportunity)`
- `UpdateAsync(Opportunity opportunity)`
- `SoftDeleteAsync(Guid id)`

---

## Phase 3: Infrastructure Layer

### 3.1 EF Core Configuration
**File:** `src/CRM.Infrastructure/Persistence/Configurations/OpportunityConfiguration.cs`

- Table name: `Opportunities`
- Required fields: OpportunityName, AccountId
- Default value for Stage: Prospecting
- `ExpectedRevenue`: precision 18, scale 2
- `AccountId`: required FK to `Accounts` table (restrict delete — do not cascade-delete opportunities when account is deleted)
- `ContactId`: nullable FK to `Contacts` table

### 3.2 DbContext Update
**File:** `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

Add: `DbSet<Opportunity> Opportunities`

### 3.3 Opportunity Repository
**File:** `src/CRM.Infrastructure/Repositories/OpportunityRepository.cs`

Implement `IOpportunityRepository`:
- `GetByIdAsync` — include `Account` and `Contact` navigation properties
- `GetPagedAsync` — filter by search on OpportunityName, AccountName; exclude soft-deleted; order by CloseDate asc (nulls last), then CreatedAt desc
- `SoftDeleteAsync` — set `IsDeleted = true`

### 3.4 DI Registration
**File:** `src/CRM.API/Program.cs`

Add: `builder.Services.AddScoped<IOpportunityRepository, OpportunityRepository>();`

### 3.5 Database Migration
Run after all infrastructure changes:
```
dotnet ef migrations add AddOpportunityTable --project src/CRM.Infrastructure --startup-project src/CRM.API
dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
```

---

## Phase 4: API Layer

### 4.1 Authorization Policies
**File:** `src/CRM.API/Program.cs`

Add policies: `opportunities.view`, `opportunities.create`, `opportunities.edit`, `opportunities.delete`

### 4.2 Opportunities Controller
**File:** `src/CRM.API/Controllers/OpportunitiesController.cs`

| Method | Route | Handler | Policy |
|--------|-------|---------|--------|
| GET | `/api/opportunities` | `GetOpportunitiesQuery` | opportunities.view |
| GET | `/api/opportunities/{id}` | `GetOpportunityByIdQuery` | opportunities.view |
| POST | `/api/opportunities` | `CreateOpportunityCommand` | opportunities.create |
| PUT | `/api/opportunities/{id}` | `UpdateOpportunityCommand` | opportunities.edit |
| DELETE | `/api/opportunities/{id}` | `DeleteOpportunityCommand` | opportunities.delete |

---

## Phase 5: Frontend

### 5.1 API Client
**File:** `web/src/api/opportunities.ts`

Types: `OpportunitySummary`, `OpportunityDetail`, `CreateOpportunityPayload`, `UpdateOpportunityPayload`, `OpportunitiesPagedResult`

Functions:
- `getOpportunities(params: { search?, page?, pageSize? })`
- `getOpportunityById(id: string)`
- `createOpportunity(payload: CreateOpportunityPayload)`
- `updateOpportunity(id: string, payload: UpdateOpportunityPayload)`
- `deleteOpportunity(id: string)`

### 5.2 Opportunity List Page
**File:** `web/src/pages/Opportunities/OpportunityListPage.tsx`

Features:
- Search input with debounce
- Paginated MUI Table with columns: Opportunity, Account, Stage, Revenue
- "Add Opportunity" button → navigates to `/opportunities/new`
- Edit icon → navigates to `/opportunities/:id/edit`
- Delete icon → opens `DeleteConfirmDialog`, calls `deleteOpportunity`
- React Query (`useQuery`) for data fetching with cache invalidation on mutation

### 5.3 Opportunity Form Page
**File:** `web/src/pages/Opportunities/OpportunityFormPage.tsx`

Shared create/edit form:
- Fields:
  - Name (text input)
  - Account (MUI Select populated from `GET /api/accounts`, required)
  - Contact (MUI Select populated from `GET /api/contacts`, optional)
  - Stage (MUI Select from `OpportunityStage` enum values)
  - Revenue (number input)
  - Close Date (MUI DatePicker)
- React Hook Form for form state
- On load (edit): fetch opportunity by id, populate form
- On submit: call `createOpportunity` or `updateOpportunity` via `useMutation`, redirect to list on success
- Client-side validation: Name required, Account required

### 5.4 Routing
**File:** `web/src/App.tsx` (or router config)

Add routes:
```
/opportunities              → OpportunityListPage
/opportunities/new          → OpportunityFormPage (create mode)
/opportunities/:id/edit     → OpportunityFormPage (edit mode)
```

### 5.5 Navigation
**File:** `web/src/components/Layout/` (sidebar/nav component)

Add "Opportunities" nav item linking to `/opportunities`.

---

## Phase 6: Tests

### 6.1 Backend Unit Tests
**Project:** `src/CRM.Tests/`

- `CreateOpportunityValidatorTests.cs` — OpportunityName required, AccountId required (empty Guid rejected)
- `CreateOpportunityHandlerTests.cs` — entity creation and repository call
- `GetOpportunitiesHandlerTests.cs` — paging and search filtering

### 6.2 Frontend Tests
**Location:** alongside page components (`*.test.tsx`)

- `OpportunityListPage.test.tsx` — renders list, search triggers refetch, delete confirm dialog
- `OpportunityFormPage.test.tsx` — validation errors on empty Name/Account, submit calls correct API

---

## Execution Order

1. Domain: OpportunityStage enum → Opportunity entity
2. Application: IOpportunityRepository interface → DTOs → all Commands/Queries/Handlers
3. Infrastructure: OpportunityConfiguration → DbContext update → OpportunityRepository → DI registration → migration
4. API: authorization policies → OpportunitiesController
5. Frontend: API client → OpportunityListPage → OpportunityFormPage → routing → navigation
6. Tests: validators, handlers, page components
