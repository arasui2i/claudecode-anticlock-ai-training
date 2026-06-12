# Lead Management — Task List

## Phase 1: Domain Layer

- [x] **T-01** Create `LeadStatus` enum with values: `New`, `Contacted`, `Qualified`, `Unqualified`, `Converted`
  - File: `src/CRM.Domain/Enums/LeadStatus.cs`

- [x] **T-02** Create `Lead` entity extending `BaseEntity` with fields: `FirstName`, `LastName`, `CompanyName`, `Email`, `Phone`, `Status`, `OwnerId`, `IsDeleted`
  - File: `src/CRM.Domain/Entities/Lead.cs`

---

## Phase 2: Application Layer

- [x] **T-03** Create `ILeadRepository` interface with methods: `GetByIdAsync`, `GetPagedAsync`, `AddAsync`, `UpdateAsync`, `SoftDeleteAsync`
  - File: `src/CRM.Application/Interfaces/ILeadRepository.cs`

- [x] **T-04** Create `LeadSummaryDto` and `LeadDetailDto` records
  - File: `src/CRM.Application/Features/Leads/LeadDtos.cs`

- [x] **T-05** Create `CreateLeadCommand`, `CreateLeadValidator`, `CreateLeadHandler`
  - Folder: `src/CRM.Application/Features/Leads/CreateLead/`
  - Validator rules: FirstName required, CompanyName required, Email required + valid format

- [x] **T-06** Create `UpdateLeadCommand`, `UpdateLeadValidator`, `UpdateLeadHandler`
  - Folder: `src/CRM.Application/Features/Leads/UpdateLead/`

- [x] **T-07** Create `GetLeadByIdQuery` and `GetLeadByIdHandler`
  - Folder: `src/CRM.Application/Features/Leads/GetLeadById/`
  - Throw `NotFoundException` if lead not found

- [x] **T-08** Create `GetLeadsQuery` and `GetLeadsHandler` with pagination and search
  - Folder: `src/CRM.Application/Features/Leads/GetLeads/`
  - Query params: `Search`, `Page` (default 1), `PageSize` (default 10)

- [x] **T-09** Create `DeleteLeadCommand` and `DeleteLeadHandler`
  - Folder: `src/CRM.Application/Features/Leads/DeleteLead/`

---

## Phase 3: Infrastructure Layer

- [x] **T-10** Create `LeadConfiguration` EF Core entity type configuration
  - File: `src/CRM.Infrastructure/Persistence/Configurations/LeadConfiguration.cs`
  - Table: `Leads`, required fields, Status default, nullable OwnerId FK

- [x] **T-11** Add `DbSet<Lead> Leads` to `AppDbContext`
  - File: `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

- [x] **T-12** Implement `LeadRepository` with all `ILeadRepository` methods
  - File: `src/CRM.Infrastructure/Repositories/LeadRepository.cs`
  - `GetPagedAsync`: filter on FirstName, LastName, CompanyName, Email; exclude soft-deleted; order by CreatedAt desc

- [x] **T-13** Register `ILeadRepository` → `LeadRepository` in DI container
  - File: `src/CRM.API/Program.cs`

- [x] **T-14** Add and apply EF Core migration for Lead table
  ```
  dotnet ef migrations add AddLeadTable --project src/CRM.Infrastructure --startup-project src/CRM.API
  dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
  ```

---

## Phase 4: API Layer

- [x] **T-15** Add authorization policies: `leads.view`, `leads.create`, `leads.edit`, `leads.delete`
  - File: `src/CRM.API/Program.cs`

- [x] **T-16** Create `LeadsController` with 5 endpoints
  - File: `src/CRM.API/Controllers/LeadsController.cs`
  - `GET /api/leads` — `GetLeadsQuery` (leads.view)
  - `GET /api/leads/{id}` — `GetLeadByIdQuery` (leads.view)
  - `POST /api/leads` — `CreateLeadCommand` (leads.create)
  - `PUT /api/leads/{id}` — `UpdateLeadCommand` (leads.edit)
  - `DELETE /api/leads/{id}` — `DeleteLeadCommand` (leads.delete)

---

## Phase 5: Frontend

- [x] **T-17** Create leads API client with types and axios functions
  - File: `web/src/api/leads.ts`
  - Types: `LeadSummary`, `LeadDetail`, `CreateLeadPayload`, `UpdateLeadPayload`, `LeadsPagedResult`
  - Functions: `getLeads`, `getLeadById`, `createLead`, `updateLead`, `deleteLead`

- [x] **T-18** Create `LeadListPage` with search, paginated table, add/edit/delete actions
  - File: `web/src/pages/Leads/LeadListPage.tsx`
  - Columns: Name, Company, Email, Status
  - Search with debounce, React Query for data fetching

- [x] **T-19** Create `LeadFormPage` for create and edit modes
  - File: `web/src/pages/Leads/LeadFormPage.tsx`
  - Fields: First Name, Last Name, Company, Email, Phone, Status
  - React Hook Form, client-side validation, populate form on edit

- [x] **T-20** Add Lead routes to app router
  - File: `web/src/App.tsx`
  - Routes: `/leads`, `/leads/new`, `/leads/:id/edit`

- [x] **T-21** Add "Leads" nav item to sidebar/navigation
  - File: `web/src/components/Layout/` (sidebar component)

---

## Phase 6: Tests

- [x] **T-22** Write `CreateLeadValidatorTests` — required fields and email format
  - File: `src/CRM.Tests/Features/Leads/CreateLeadValidatorTests.cs`

- [x] **T-23** Write `CreateLeadHandlerTests` — entity creation and repository call
  - File: `src/CRM.Tests/Features/Leads/CreateLeadHandlerTests.cs`

- [x] **T-24** Write `GetLeadsHandlerTests` — paging and search filtering
  - File: `src/CRM.Tests/Features/Leads/GetLeadsHandlerTests.cs`

- [x] **T-25** Write `LeadListPage.test.tsx` — renders list, search, delete confirm dialog
  - File: `web/src/pages/Leads/LeadListPage.test.tsx`

- [x] **T-26** Write `LeadFormPage.test.tsx` — validation errors, submit calls correct API
  - File: `web/src/pages/Leads/LeadFormPage.test.tsx`

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
