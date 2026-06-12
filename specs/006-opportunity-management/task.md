# Opportunity Management — Task List

## Phase 1: Domain Layer

- [x] **T-01** Create `OpportunityStage` enum with values: `Prospecting`, `Qualification`, `Proposal`, `Negotiation`, `ClosedWon`, `ClosedLost`
  - File: `src/CRM.Domain/Enums/OpportunityStage.cs`

- [x] **T-02** Create `Opportunity` entity extending `BaseEntity` with fields: `OpportunityName`, `AccountId`, `ContactId`, `Stage`, `ExpectedRevenue`, `CloseDate`, `IsDeleted` and navigation properties `Account` (required), `Contact` (nullable)
  - File: `src/CRM.Domain/Entities/Opportunity.cs`

---

## Phase 2: Application Layer

- [x] **T-03** Create `IOpportunityRepository` interface with methods: `GetByIdAsync`, `GetPagedAsync`, `AddAsync`, `UpdateAsync`, `SoftDeleteAsync`
  - File: `src/CRM.Application/Interfaces/IOpportunityRepository.cs`

- [x] **T-04** Create `OpportunitySummaryDto` (Id, OpportunityName, AccountName, Stage, ExpectedRevenue) and `OpportunityDetailDto` (all fields including AccountId, AccountName, ContactId, ContactName, CloseDate)
  - File: `src/CRM.Application/Features/Opportunities/OpportunityDtos.cs`

- [x] **T-05** Create `CreateOpportunityCommand`, `CreateOpportunityValidator`, `CreateOpportunityHandler`
  - Folder: `src/CRM.Application/Features/Opportunities/CreateOpportunity/`
  - Validator rules: OpportunityName required, AccountId required (not empty Guid)

- [x] **T-06** Create `UpdateOpportunityCommand`, `UpdateOpportunityValidator`, `UpdateOpportunityHandler`
  - Folder: `src/CRM.Application/Features/Opportunities/UpdateOpportunity/`
  - Validator rules: same as create

- [x] **T-07** Create `GetOpportunityByIdQuery` and `GetOpportunityByIdHandler`
  - Folder: `src/CRM.Application/Features/Opportunities/GetOpportunityById/`
  - Throw `NotFoundException` if opportunity not found

- [x] **T-08** Create `GetOpportunitiesQuery` and `GetOpportunitiesHandler` with pagination and search
  - Folder: `src/CRM.Application/Features/Opportunities/GetOpportunities/`
  - Query params: `Search`, `Page` (default 1), `PageSize` (default 10)

- [x] **T-09** Create `DeleteOpportunityCommand` and `DeleteOpportunityHandler`
  - Folder: `src/CRM.Application/Features/Opportunities/DeleteOpportunity/`

---

## Phase 3: Infrastructure Layer

- [x] **T-10** Create `OpportunityConfiguration` EF Core entity type configuration
  - File: `src/CRM.Infrastructure/Persistence/Configurations/OpportunityConfiguration.cs`
  - Table: `Opportunities`, required: OpportunityName + AccountId, Stage default: Prospecting
  - `ExpectedRevenue`: precision 18, scale 2
  - `AccountId`: required FK to `Accounts` with restrict delete (no cascade)
  - `ContactId`: nullable FK to `Contacts`

- [x] **T-11** Add `DbSet<Opportunity> Opportunities` to `AppDbContext`
  - File: `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

- [x] **T-12** Implement `OpportunityRepository` with all `IOpportunityRepository` methods
  - File: `src/CRM.Infrastructure/Repositories/OpportunityRepository.cs`
  - `GetByIdAsync`: include `Account` and `Contact` navigation properties
  - `GetPagedAsync`: filter on OpportunityName, AccountName; exclude soft-deleted; order by CloseDate asc (nulls last), then CreatedAt desc

- [x] **T-13** Register `IOpportunityRepository` → `OpportunityRepository` in DI container
  - File: `src/CRM.API/Program.cs`

- [x] **T-14** Add and apply EF Core migration for Opportunity table
  ```
  dotnet ef migrations add AddOpportunityTable --project src/CRM.Infrastructure --startup-project src/CRM.API
  dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
  ```

---

## Phase 4: API Layer

- [x] **T-15** Add authorization policies: `opportunities.view`, `opportunities.create`, `opportunities.edit`, `opportunities.delete`
  - File: `src/CRM.API/Program.cs`

- [x] **T-16** Create `OpportunitiesController` with 5 endpoints
  - File: `src/CRM.API/Controllers/OpportunitiesController.cs`
  - `GET /api/opportunities` — `GetOpportunitiesQuery` (opportunities.view)
  - `GET /api/opportunities/{id}` — `GetOpportunityByIdQuery` (opportunities.view)
  - `POST /api/opportunities` — `CreateOpportunityCommand` (opportunities.create)
  - `PUT /api/opportunities/{id}` — `UpdateOpportunityCommand` (opportunities.edit)
  - `DELETE /api/opportunities/{id}` — `DeleteOpportunityCommand` (opportunities.delete)

---

## Phase 5: Frontend

- [x] **T-17** Create opportunities API client with types and axios functions
  - File: `web/src/api/opportunities.ts`
  - Types: `OpportunitySummary`, `OpportunityDetail`, `CreateOpportunityPayload`, `UpdateOpportunityPayload`, `OpportunitiesPagedResult`
  - Functions: `getOpportunities`, `getOpportunityById`, `createOpportunity`, `updateOpportunity`, `deleteOpportunity`

- [x] **T-18** Create `OpportunityListPage` with search, paginated table, add/edit/delete actions
  - File: `web/src/pages/Opportunities/OpportunityListPage.tsx`
  - Columns: Opportunity, Account, Stage, Revenue
  - Search with debounce, React Query for data fetching with cache invalidation on mutation

- [x] **T-19** Create `OpportunityFormPage` for create and edit modes
  - File: `web/src/pages/Opportunities/OpportunityFormPage.tsx`
  - Fields: Name, Account (MUI Select from `GET /api/accounts`, required), Contact (MUI Select from `GET /api/contacts`, optional), Stage (MUI Select), Revenue (number), Close Date (MUI DatePicker)
  - React Hook Form, client-side validation (Name required, Account required), populate form on edit

- [x] **T-20** Add Opportunity routes to app router
  - File: `web/src/App.tsx`
  - Routes: `/opportunities`, `/opportunities/new`, `/opportunities/:id/edit`

- [x] **T-21** Add "Opportunities" nav item to sidebar/navigation
  - File: `web/src/components/Layout/` (sidebar component)

---

## Phase 6: Tests

- [x] **T-22** Write `CreateOpportunityValidatorTests` — OpportunityName required, AccountId required (empty Guid rejected)
  - File: `src/CRM.Tests/Features/Opportunities/CreateOpportunityValidatorTests.cs`

- [x] **T-23** Write `CreateOpportunityHandlerTests` — entity creation and repository call
  - File: `src/CRM.Tests/Features/Opportunities/CreateOpportunityHandlerTests.cs`

- [x] **T-24** Write `GetOpportunitiesHandlerTests` — paging and search filtering
  - File: `src/CRM.Tests/Features/Opportunities/GetOpportunitiesHandlerTests.cs`

- [x] **T-25** Write `OpportunityListPage.test.tsx` — renders list, search, delete confirm dialog
  - File: `web/src/pages/Opportunities/OpportunityListPage.test.tsx`

- [x] **T-26** Write `OpportunityFormPage.test.tsx` — validation errors on empty Name/Account, submit calls correct API
  - File: `web/src/pages/Opportunities/OpportunityFormPage.test.tsx`

---

## Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| 1 — Domain | T-01 to T-02 | 2 |
| 2 — Application | T-03 to T-09 | 7 |
| 3 — Infrastructure | T-10 to T-14 | 5 |
| 4 — API | T-15 to T-16 | 2 |
| 5 — Frontend | T-17 to T-21 | 5 |
| 6 — Tests | T-22 to T-26 | 5 |
| **Total** | | **26** |
