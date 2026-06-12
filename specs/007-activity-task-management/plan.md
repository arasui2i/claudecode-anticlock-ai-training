# Activity Task Management — Execution Plan

## Overview

Implement Activity Task Management following the same Clean Architecture + CQRS pattern used across the CRM. An Activity tracks a customer-related task or interaction (call, email, meeting, etc.). `AssignedTo` is a FK to User and is populated from the authenticated user's JWT claims in the handler — it is not a form field.

---

## Phase 1: Domain Layer

### 1.1 Activity Type Enum
**File:** `src/CRM.Domain/Enums/ActivityType.cs`

```
Call, Email, Meeting, Task, Note
```

### 1.2 Activity Status Enum
**File:** `src/CRM.Domain/Enums/ActivityStatus.cs`

```
Open, InProgress, Completed, Cancelled
```

### 1.3 Activity Entity
**File:** `src/CRM.Domain/Entities/Activity.cs`

Extend `BaseEntity`. Fields:
- `Subject` (string, required)
- `ActivityType` (ActivityType enum, default: Task)
- `DueDate` (DateTime, required)
- `Status` (ActivityStatus enum, default: Open)
- `AssignedTo` (Guid, nullable — FK to User, set from JWT claims on create)
- `IsDeleted` (bool, default: false)

Navigation property:
- `AssignedUser` (User, nullable)

---

## Phase 2: Application Layer

### 2.1 DTOs
**File:** `src/CRM.Application/Features/Activities/ActivityDtos.cs`

- `ActivitySummaryDto` — Id, Subject, ActivityType, DueDate, Status (for list/grid)
- `ActivityDetailDto` — all fields including AssignedTo, AssignedUserName (for get by id / edit form)

### 2.2 Create Activity
**Folder:** `src/CRM.Application/Features/Activities/CreateActivity/`

- `CreateActivityCommand.cs` — `IRequest<Guid>` record (Subject, ActivityType, DueDate, Status, AssignedTo)
  - `AssignedTo` populated by handler from JWT claims — not supplied by the form
- `CreateActivityValidator.cs` — FluentValidation: Subject required, DueDate required
- `CreateActivityHandler.cs` — maps command → Activity entity, calls `IActivityRepository.AddAsync`, returns Id

### 2.3 Update Activity
**Folder:** `src/CRM.Application/Features/Activities/UpdateActivity/`

- `UpdateActivityCommand.cs` — `IRequest` record (Id + Subject, ActivityType, DueDate, Status)
- `UpdateActivityValidator.cs` — same rules as create
- `UpdateActivityHandler.cs` — fetches activity via `GetByIdAsync`, updates fields, calls `UpdateAsync`

### 2.4 Get Activity By Id
**Folder:** `src/CRM.Application/Features/Activities/GetActivityById/`

- `GetActivityByIdQuery.cs` — `IRequest<ActivityDetailDto>` record (Id)
- `GetActivityByIdHandler.cs` — calls `GetByIdAsync`, throws `NotFoundException` if null, maps to `ActivityDetailDto`

### 2.5 Search Activities
**Folder:** `src/CRM.Application/Features/Activities/GetActivities/`

- `GetActivitiesQuery.cs` — `IRequest<PagedResult<ActivitySummaryDto>>` record (Search, Page = 1, PageSize = 10)
- `GetActivitiesHandler.cs` — calls `GetPagedAsync`, maps entities to `ActivitySummaryDto`

### 2.6 Delete Activity
**Folder:** `src/CRM.Application/Features/Activities/DeleteActivity/`

- `DeleteActivityCommand.cs` — `IRequest` record (Id)
- `DeleteActivityHandler.cs` — fetches activity, calls `SoftDeleteAsync`

### 2.7 Repository Interface
**File:** `src/CRM.Application/Interfaces/IActivityRepository.cs`

Methods:
- `GetByIdAsync(Guid id)`
- `GetPagedAsync(string? search, int page, int pageSize)`
- `AddAsync(Activity activity)`
- `UpdateAsync(Activity activity)`
- `SoftDeleteAsync(Guid id)`

---

## Phase 3: Infrastructure Layer

### 3.1 EF Core Configuration
**File:** `src/CRM.Infrastructure/Persistence/Configurations/ActivityConfiguration.cs`

- Table name: `Activities`
- Required fields: Subject, DueDate
- Default value for ActivityType: Task
- Default value for Status: Open
- `AssignedTo`: nullable FK to `Users` table (set null on delete — do not cascade)

### 3.2 DbContext Update
**File:** `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

Add: `DbSet<Activity> Activities`

### 3.3 Activity Repository
**File:** `src/CRM.Infrastructure/Repositories/ActivityRepository.cs`

Implement `IActivityRepository`:
- `GetByIdAsync` — include `AssignedUser` navigation property
- `GetPagedAsync` — filter by search on Subject; exclude soft-deleted; order by DueDate asc (upcoming first)
- `SoftDeleteAsync` — set `IsDeleted = true`

### 3.4 DI Registration
**File:** `src/CRM.API/Program.cs`

Add: `builder.Services.AddScoped<IActivityRepository, ActivityRepository>();`

### 3.5 Database Migration
Run after all infrastructure changes:
```
dotnet ef migrations add AddActivityTable --project src/CRM.Infrastructure --startup-project src/CRM.API
dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
```

---

## Phase 4: API Layer

### 4.1 Authorization Policies
**File:** `src/CRM.API/Program.cs`

Add policies: `activities.view`, `activities.create`, `activities.edit`, `activities.delete`

### 4.2 Activities Controller
**File:** `src/CRM.API/Controllers/ActivitiesController.cs`

| Method | Route | Handler | Policy |
|--------|-------|---------|--------|
| GET | `/api/activities` | `GetActivitiesQuery` | activities.view |
| GET | `/api/activities/{id}` | `GetActivityByIdQuery` | activities.view |
| POST | `/api/activities` | `CreateActivityCommand` | activities.create |
| PUT | `/api/activities/{id}` | `UpdateActivityCommand` | activities.edit |
| DELETE | `/api/activities/{id}` | `DeleteActivityCommand` | activities.delete |

For `POST /api/activities`, the controller extracts the current user's Id from `User.FindFirstValue(ClaimTypes.NameIdentifier)` and passes it as `AssignedTo` when constructing `CreateActivityCommand`.

---

## Phase 5: Frontend

### 5.1 API Client
**File:** `web/src/api/activities.ts`

Types: `ActivitySummary`, `ActivityDetail`, `CreateActivityPayload`, `UpdateActivityPayload`, `ActivitiesPagedResult`

Functions:
- `getActivities(params: { search?, page?, pageSize? })`
- `getActivityById(id: string)`
- `createActivity(payload: CreateActivityPayload)`
- `updateActivity(id: string, payload: UpdateActivityPayload)`
- `deleteActivity(id: string)`

### 5.2 Activity List Page
**File:** `web/src/pages/Activities/ActivityListPage.tsx`

Features:
- Search input with debounce
- Paginated MUI Table with columns: Subject, Type, Due Date, Status
- "Add Activity" button → navigates to `/activities/new`
- Edit icon → navigates to `/activities/:id/edit`
- Delete icon → opens `DeleteConfirmDialog`, calls `deleteActivity`
- React Query (`useQuery`) for data fetching with cache invalidation on mutation

### 5.3 Activity Form Page
**File:** `web/src/pages/Activities/ActivityFormPage.tsx`

Shared create/edit form:
- Fields:
  - Subject (text input)
  - Type (MUI Select from `ActivityType` enum values)
  - Due Date (MUI DatePicker, required)
  - Status (MUI Select from `ActivityStatus` enum values)
- React Hook Form for form state
- On load (edit): fetch activity by id, populate form
- On submit: call `createActivity` or `updateActivity` via `useMutation`, redirect to list on success
- Client-side validation: Subject required, Due Date required

### 5.4 Routing
**File:** `web/src/App.tsx` (or router config)

Add routes:
```
/activities              → ActivityListPage
/activities/new          → ActivityFormPage (create mode)
/activities/:id/edit     → ActivityFormPage (edit mode)
```

### 5.5 Navigation
**File:** `web/src/components/Layout/` (sidebar/nav component)

Add "Activities" nav item linking to `/activities`.

---

## Phase 6: Tests

### 6.1 Backend Unit Tests
**Project:** `src/CRM.Tests/`

- `CreateActivityValidatorTests.cs` — Subject required, DueDate required
- `CreateActivityHandlerTests.cs` — entity creation and repository call
- `GetActivitiesHandlerTests.cs` — paging and search filtering

### 6.2 Frontend Tests
**Location:** alongside page components (`*.test.tsx`)

- `ActivityListPage.test.tsx` — renders list, search triggers refetch, delete confirm dialog
- `ActivityFormPage.test.tsx` — validation errors on empty Subject/DueDate, submit calls correct API

---

## Execution Order

1. Domain: ActivityType enum → ActivityStatus enum → Activity entity
2. Application: IActivityRepository interface → DTOs → all Commands/Queries/Handlers
3. Infrastructure: ActivityConfiguration → DbContext update → ActivityRepository → DI registration → migration
4. API: authorization policies → ActivitiesController (with JWT claim extraction for AssignedTo)
5. Frontend: API client → ActivityListPage → ActivityFormPage → routing → navigation
6. Tests: validators, handlers, page components
