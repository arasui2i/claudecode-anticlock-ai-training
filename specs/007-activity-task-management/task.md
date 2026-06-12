# Activity Task Management — Task List

## Phase 1: Domain Layer

- [ ] **T-01** Create `ActivityType` enum with values: `Call`, `Email`, `Meeting`, `Task`, `Note`
  - File: `src/CRM.Domain/Enums/ActivityType.cs`

- [ ] **T-02** Create `ActivityStatus` enum with values: `Open`, `InProgress`, `Completed`, `Cancelled`
  - File: `src/CRM.Domain/Enums/ActivityStatus.cs`

- [ ] **T-03** Create `Activity` entity extending `BaseEntity` with fields: `Subject`, `ActivityType`, `DueDate`, `Status`, `AssignedTo`, `IsDeleted` and navigation property `AssignedUser` (User, nullable)
  - File: `src/CRM.Domain/Entities/Activity.cs`
  - `ActivityType` default: Task, `Status` default: Open, `AssignedTo` nullable FK to User

---

## Phase 2: Application Layer

- [ ] **T-04** Create `IActivityRepository` interface with methods: `GetByIdAsync`, `GetPagedAsync`, `AddAsync`, `UpdateAsync`, `SoftDeleteAsync`
  - File: `src/CRM.Application/Interfaces/IActivityRepository.cs`

- [ ] **T-05** Create `ActivitySummaryDto` (Id, Subject, ActivityType, DueDate, Status) and `ActivityDetailDto` (all fields including AssignedTo, AssignedUserName)
  - File: `src/CRM.Application/Features/Activities/ActivityDtos.cs`

- [ ] **T-06** Create `CreateActivityCommand`, `CreateActivityValidator`, `CreateActivityHandler`
  - Folder: `src/CRM.Application/Features/Activities/CreateActivity/`
  - Command params: Subject, ActivityType, DueDate, Status, AssignedTo (set from JWT claims by controller — not a form field)
  - Validator rules: Subject required, DueDate required

- [ ] **T-07** Create `UpdateActivityCommand`, `UpdateActivityValidator`, `UpdateActivityHandler`
  - Folder: `src/CRM.Application/Features/Activities/UpdateActivity/`
  - Command params: Id, Subject, ActivityType, DueDate, Status (no AssignedTo — ownership not changed on update)
  - Validator rules: same as create

- [ ] **T-08** Create `GetActivityByIdQuery` and `GetActivityByIdHandler`
  - Folder: `src/CRM.Application/Features/Activities/GetActivityById/`
  - Throw `NotFoundException` if activity not found

- [ ] **T-09** Create `GetActivitiesQuery` and `GetActivitiesHandler` with pagination and search
  - Folder: `src/CRM.Application/Features/Activities/GetActivities/`
  - Query params: `Search`, `Page` (default 1), `PageSize` (default 10)

- [ ] **T-10** Create `DeleteActivityCommand` and `DeleteActivityHandler`
  - Folder: `src/CRM.Application/Features/Activities/DeleteActivity/`

---

## Phase 3: Infrastructure Layer

- [ ] **T-11** Create `ActivityConfiguration` EF Core entity type configuration
  - File: `src/CRM.Infrastructure/Persistence/Configurations/ActivityConfiguration.cs`
  - Table: `Activities`, required: Subject + DueDate, ActivityType default: Task, Status default: Open
  - `AssignedTo`: nullable FK to `Users` table with set-null on delete (no cascade)

- [ ] **T-12** Add `DbSet<Activity> Activities` to `AppDbContext`
  - File: `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

- [ ] **T-13** Implement `ActivityRepository` with all `IActivityRepository` methods
  - File: `src/CRM.Infrastructure/Repositories/ActivityRepository.cs`
  - `GetByIdAsync`: include `AssignedUser` navigation property
  - `GetPagedAsync`: filter on Subject; exclude soft-deleted; order by DueDate asc (upcoming first)

- [ ] **T-14** Register `IActivityRepository` → `ActivityRepository` in DI container
  - File: `src/CRM.API/Program.cs`

- [ ] **T-15** Add and apply EF Core migration for Activity table
  ```
  dotnet ef migrations add AddActivityTable --project src/CRM.Infrastructure --startup-project src/CRM.API
  dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
  ```

---

## Phase 4: API Layer

- [ ] **T-16** Add authorization policies: `activities.view`, `activities.create`, `activities.edit`, `activities.delete`
  - File: `src/CRM.API/Program.cs`

- [ ] **T-17** Create `ActivitiesController` with 5 endpoints
  - File: `src/CRM.API/Controllers/ActivitiesController.cs`
  - `GET /api/activities` — `GetActivitiesQuery` (activities.view)
  - `GET /api/activities/{id}` — `GetActivityByIdQuery` (activities.view)
  - `POST /api/activities` — `CreateActivityCommand` (activities.create); extract `AssignedTo` from `User.FindFirstValue(ClaimTypes.NameIdentifier)`
  - `PUT /api/activities/{id}` — `UpdateActivityCommand` (activities.edit)
  - `DELETE /api/activities/{id}` — `DeleteActivityCommand` (activities.delete)

---

## Phase 5: Frontend

- [ ] **T-18** Create activities API client with types and axios functions
  - File: `web/src/api/activities.ts`
  - Types: `ActivitySummary`, `ActivityDetail`, `CreateActivityPayload`, `UpdateActivityPayload`, `ActivitiesPagedResult`
  - Functions: `getActivities`, `getActivityById`, `createActivity`, `updateActivity`, `deleteActivity`

- [ ] **T-19** Create `ActivityListPage` with search, paginated table, add/edit/delete actions
  - File: `web/src/pages/Activities/ActivityListPage.tsx`
  - Columns: Subject, Type, Due Date, Status
  - Search with debounce, React Query for data fetching with cache invalidation on mutation

- [ ] **T-20** Create `ActivityFormPage` for create and edit modes
  - File: `web/src/pages/Activities/ActivityFormPage.tsx`
  - Fields: Subject (text), Type (MUI Select), Due Date (MUI DatePicker, required), Status (MUI Select)
  - React Hook Form, client-side validation (Subject required, Due Date required), populate form on edit

- [ ] **T-21** Add Activity routes to app router
  - File: `web/src/App.tsx`
  - Routes: `/activities`, `/activities/new`, `/activities/:id/edit`

- [ ] **T-22** Add "Activities" nav item to sidebar/navigation
  - File: `web/src/components/Layout/` (sidebar component)

---

## Phase 6: Tests

- [ ] **T-23** Write `CreateActivityValidatorTests` — Subject required, DueDate required
  - File: `src/CRM.Tests/Features/Activities/CreateActivityValidatorTests.cs`

- [ ] **T-24** Write `CreateActivityHandlerTests` — entity creation and repository call
  - File: `src/CRM.Tests/Features/Activities/CreateActivityHandlerTests.cs`

- [ ] **T-25** Write `GetActivitiesHandlerTests` — paging and search filtering
  - File: `src/CRM.Tests/Features/Activities/GetActivitiesHandlerTests.cs`

- [ ] **T-26** Write `ActivityListPage.test.tsx` — renders list, search, delete confirm dialog
  - File: `web/src/pages/Activities/ActivityListPage.test.tsx`

- [ ] **T-27** Write `ActivityFormPage.test.tsx` — validation errors on empty Subject/DueDate, submit calls correct API
  - File: `web/src/pages/Activities/ActivityFormPage.test.tsx`

---

## Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| 1 — Domain | T-01 to T-03 | 3 |
| 2 — Application | T-04 to T-10 | 7 |
| 3 — Infrastructure | T-11 to T-15 | 5 |
| 4 — API | T-16 to T-17 | 2 |
| 5 — Frontend | T-18 to T-22 | 5 |
| 6 — Tests | T-23 to T-27 | 5 |
| **Total** | | **27** |
