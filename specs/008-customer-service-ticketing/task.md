# Customer Service Ticketing — Task List

## Phase 1: Domain Layer

- [ ] **T-01** Create `TicketPriority` enum with values: `Low`, `Medium`, `High`, `Critical`
  - File: `src/CRM.Domain/Enums/TicketPriority.cs`

- [ ] **T-02** Create `TicketStatus` enum with values: `Open`, `InProgress`, `Resolved`, `Closed`
  - File: `src/CRM.Domain/Enums/TicketStatus.cs`

- [ ] **T-03** Create `Ticket` entity extending `BaseEntity` with fields: `TicketNumber`, `Subject`, `AccountId`, `ContactId`, `Priority`, `Status`, `IsDeleted` and navigation properties `Account` (nullable), `Contact` (nullable)
  - File: `src/CRM.Domain/Entities/Ticket.cs`
  - `TicketNumber`: auto-generated (not set by user), `Priority` default: Medium, `Status` default: Open

---

## Phase 2: Application Layer

- [ ] **T-04** Create `ITicketRepository` interface with methods: `GetByIdAsync`, `GetPagedAsync`, `GetNextTicketNumberAsync`, `AddAsync`, `UpdateAsync`, `SoftDeleteAsync`
  - File: `src/CRM.Application/Interfaces/ITicketRepository.cs`
  - `GetNextTicketNumberAsync()` returns the next formatted ticket number (e.g., `TKT-00042`)

- [ ] **T-05** Create `TicketSummaryDto` (Id, TicketNumber, Subject, Priority, Status) and `TicketDetailDto` (all fields including AccountId, AccountName, ContactId, ContactName)
  - File: `src/CRM.Application/Features/Tickets/TicketDtos.cs`

- [ ] **T-06** Create `CreateTicketCommand`, `CreateTicketValidator`, `CreateTicketHandler`
  - Folder: `src/CRM.Application/Features/Tickets/CreateTicket/`
  - Command params: Subject, AccountId, ContactId, Priority, Status (no TicketNumber — generated in handler)
  - Handler: calls `GetNextTicketNumberAsync`, sets TicketNumber on entity before saving
  - Validator rules: Subject required, Priority required

- [ ] **T-07** Create `UpdateTicketCommand`, `UpdateTicketValidator`, `UpdateTicketHandler`
  - Folder: `src/CRM.Application/Features/Tickets/UpdateTicket/`
  - Command params: Id, Subject, AccountId, ContactId, Priority, Status (TicketNumber excluded — immutable)
  - Validator rules: same as create

- [ ] **T-08** Create `GetTicketByIdQuery` and `GetTicketByIdHandler`
  - Folder: `src/CRM.Application/Features/Tickets/GetTicketById/`
  - Throw `NotFoundException` if ticket not found

- [ ] **T-09** Create `GetTicketsQuery` and `GetTicketsHandler` with pagination and search
  - Folder: `src/CRM.Application/Features/Tickets/GetTickets/`
  - Query params: `Search`, `Page` (default 1), `PageSize` (default 10)

- [ ] **T-10** Create `DeleteTicketCommand` and `DeleteTicketHandler`
  - Folder: `src/CRM.Application/Features/Tickets/DeleteTicket/`

---

## Phase 3: Infrastructure Layer

- [ ] **T-11** Create `TicketConfiguration` EF Core entity type configuration
  - File: `src/CRM.Infrastructure/Persistence/Configurations/TicketConfiguration.cs`
  - Table: `Tickets`, required: TicketNumber + Subject, Priority default: Medium, Status default: Open
  - `TicketNumber`: unique index, max length 20
  - `AccountId`: nullable FK to `Accounts` with set-null on delete
  - `ContactId`: nullable FK to `Contacts` with set-null on delete

- [ ] **T-12** Add `DbSet<Ticket> Tickets` to `AppDbContext`
  - File: `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

- [ ] **T-13** Implement `TicketRepository` with all `ITicketRepository` methods
  - File: `src/CRM.Infrastructure/Repositories/TicketRepository.cs`
  - `GetByIdAsync`: include `Account` and `Contact` navigation properties
  - `GetPagedAsync`: filter on TicketNumber, Subject; exclude soft-deleted; order by CreatedAt desc
  - `GetNextTicketNumberAsync`: count all tickets (including soft-deleted), return `TKT-{(count + 1):D5}`

- [ ] **T-14** Register `ITicketRepository` → `TicketRepository` in DI container
  - File: `src/CRM.API/Program.cs`

- [ ] **T-15** Add and apply EF Core migration for Ticket table
  ```
  dotnet ef migrations add AddTicketTable --project src/CRM.Infrastructure --startup-project src/CRM.API
  dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
  ```

---

## Phase 4: API Layer

- [ ] **T-16** Add authorization policies: `tickets.view`, `tickets.create`, `tickets.edit`, `tickets.delete`
  - File: `src/CRM.API/Program.cs`

- [ ] **T-17** Create `TicketsController` with 5 endpoints
  - File: `src/CRM.API/Controllers/TicketsController.cs`
  - `GET /api/tickets` — `GetTicketsQuery` (tickets.view)
  - `GET /api/tickets/{id}` — `GetTicketByIdQuery` (tickets.view)
  - `POST /api/tickets` — `CreateTicketCommand` (tickets.create)
  - `PUT /api/tickets/{id}` — `UpdateTicketCommand` (tickets.edit)
  - `DELETE /api/tickets/{id}` — `DeleteTicketCommand` (tickets.delete)

---

## Phase 5: Frontend

- [ ] **T-18** Create tickets API client with types and axios functions
  - File: `web/src/api/tickets.ts`
  - Types: `TicketSummary`, `TicketDetail`, `CreateTicketPayload`, `UpdateTicketPayload`, `TicketsPagedResult`
  - Functions: `getTickets`, `getTicketById`, `createTicket`, `updateTicket`, `deleteTicket`

- [ ] **T-19** Create `TicketListPage` with search, paginated table, add/edit/delete actions
  - File: `web/src/pages/Tickets/TicketListPage.tsx`
  - Columns: Ticket Number, Subject, Priority, Status
  - Search with debounce, React Query for data fetching with cache invalidation on mutation

- [ ] **T-20** Create `TicketFormPage` for create and edit modes
  - File: `web/src/pages/Tickets/TicketFormPage.tsx`
  - Fields: Subject (required), Account (MUI Select from `GET /api/accounts`), Contact (MUI Select from `GET /api/contacts`), Priority (MUI Select, required), Status (MUI Select)
  - Ticket Number displayed as read-only field on edit mode (from `TicketDetailDto`, not submitted)
  - React Hook Form, client-side validation (Subject required, Priority required), populate form on edit

- [ ] **T-21** Add Ticket routes to app router
  - File: `web/src/App.tsx`
  - Routes: `/tickets`, `/tickets/new`, `/tickets/:id/edit`

- [ ] **T-22** Add "Tickets" nav item to sidebar/navigation
  - File: `web/src/components/Layout/` (sidebar component)

---

## Phase 6: Tests

- [ ] **T-23** Write `CreateTicketValidatorTests` — Subject required, Priority required
  - File: `src/CRM.Tests/Features/Tickets/CreateTicketValidatorTests.cs`

- [ ] **T-24** Write `CreateTicketHandlerTests` — verify TicketNumber is generated and entity is created with correct values
  - File: `src/CRM.Tests/Features/Tickets/CreateTicketHandlerTests.cs`

- [ ] **T-25** Write `GetTicketsHandlerTests` — paging and search filtering
  - File: `src/CRM.Tests/Features/Tickets/GetTicketsHandlerTests.cs`

- [ ] **T-26** Write `TicketListPage.test.tsx` — renders list with Ticket Number column, search, delete confirm dialog
  - File: `web/src/pages/Tickets/TicketListPage.test.tsx`

- [ ] **T-27** Write `TicketFormPage.test.tsx` — validation errors on empty Subject/Priority, Ticket Number read-only on edit, submit calls correct API
  - File: `web/src/pages/Tickets/TicketFormPage.test.tsx`

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
