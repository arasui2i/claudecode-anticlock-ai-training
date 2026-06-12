# Contact Management — Task List

## Phase 1: Domain Layer

- [x] **T-01** Create `ContactStatus` enum with values: `Active`, `Inactive`
  - File: `src/CRM.Domain/Enums/ContactStatus.cs`

- [x] **T-02** Create `Contact` entity extending `BaseEntity` with fields: `FirstName`, `LastName`, `Email`, `Phone`, `AccountId`, `Status`, `IsDeleted` and navigation property `Account` (Customer)
  - File: `src/CRM.Domain/Entities/Contact.cs`

---

## Phase 2: Application Layer

- [x] **T-03** Create `IContactRepository` interface with methods: `GetByIdAsync`, `GetPagedAsync`, `AddAsync`, `UpdateAsync`, `SoftDeleteAsync`
  - File: `src/CRM.Application/Interfaces/IContactRepository.cs`

- [x] **T-04** Create `ContactSummaryDto` (Id, FullName, Email, Phone) and `ContactDetailDto` (all fields including AccountId, AccountName, Status)
  - File: `src/CRM.Application/Features/Contacts/ContactDtos.cs`

- [x] **T-05** Create `CreateContactCommand`, `CreateContactValidator`, `CreateContactHandler`
  - Folder: `src/CRM.Application/Features/Contacts/CreateContact/`
  - Validator rules: FirstName required, Email required + valid format

- [x] **T-06** Create `UpdateContactCommand`, `UpdateContactValidator`, `UpdateContactHandler`
  - Folder: `src/CRM.Application/Features/Contacts/UpdateContact/`
  - Validator rules: same as create

- [x] **T-07** Create `GetContactByIdQuery` and `GetContactByIdHandler`
  - Folder: `src/CRM.Application/Features/Contacts/GetContactById/`
  - Throw `NotFoundException` if contact not found

- [x] **T-08** Create `GetContactsQuery` and `GetContactsHandler` with pagination and search
  - Folder: `src/CRM.Application/Features/Contacts/GetContacts/`
  - Query params: `Search`, `Page` (default 1), `PageSize` (default 10)

- [x] **T-09** Create `DeleteContactCommand` and `DeleteContactHandler`
  - Folder: `src/CRM.Application/Features/Contacts/DeleteContact/`

---

## Phase 3: Infrastructure Layer

- [x] **T-10** Create `ContactConfiguration` EF Core entity type configuration
  - File: `src/CRM.Infrastructure/Persistence/Configurations/ContactConfiguration.cs`
  - Table: `Contacts`, required fields: FirstName, Email, Status default: Active, nullable FK `AccountId` → `Customers`

- [x] **T-11** Add `DbSet<Contact> Contacts` to `AppDbContext`
  - File: `src/CRM.Infrastructure/Persistence/AppDbContext.cs`

- [x] **T-12** Implement `ContactRepository` with all `IContactRepository` methods
  - File: `src/CRM.Infrastructure/Repositories/ContactRepository.cs`
  - `GetByIdAsync`: include `Account` navigation property for AccountName
  - `GetPagedAsync`: filter on FirstName, LastName, Email, Phone; exclude soft-deleted; order by CreatedAt desc

- [x] **T-13** Register `IContactRepository` → `ContactRepository` in DI container
  - File: `src/CRM.API/Program.cs`

- [x] **T-14** Add and apply EF Core migration for Contact table
  ```
  dotnet ef migrations add AddContactTable --project src/CRM.Infrastructure --startup-project src/CRM.API
  dotnet ef database update --project src/CRM.Infrastructure --startup-project src/CRM.API
  ```

---

## Phase 4: API Layer

- [x] **T-15** Add authorization policies: `contacts.view`, `contacts.create`, `contacts.edit`, `contacts.delete`
  - File: `src/CRM.API/Program.cs`

- [x] **T-16** Create `ContactsController` with 5 endpoints
  - File: `src/CRM.API/Controllers/ContactsController.cs`
  - `GET /api/contacts` — `GetContactsQuery` (contacts.view)
  - `GET /api/contacts/{id}` — `GetContactByIdQuery` (contacts.view)
  - `POST /api/contacts` — `CreateContactCommand` (contacts.create)
  - `PUT /api/contacts/{id}` — `UpdateContactCommand` (contacts.edit)
  - `DELETE /api/contacts/{id}` — `DeleteContactCommand` (contacts.delete)

---

## Phase 5: Frontend

- [x] **T-17** Create contacts API client with types and axios functions
  - File: `web/src/api/contacts.ts`
  - Types: `ContactSummary`, `ContactDetail`, `CreateContactPayload`, `UpdateContactPayload`, `ContactsPagedResult`
  - Functions: `getContacts`, `getContactById`, `createContact`, `updateContact`, `deleteContact`

- [x] **T-18** Create `ContactListPage` with search, paginated table, add/edit/delete actions
  - File: `web/src/pages/Contacts/ContactListPage.tsx`
  - Columns: Name, Email, Phone
  - Search with debounce, React Query for data fetching with cache invalidation on mutation

- [x] **T-19** Create `ContactFormPage` for create and edit modes
  - File: `web/src/pages/Contacts/ContactFormPage.tsx`
  - Fields: First Name, Last Name, Email, Phone, Account (MUI Select from `GET /api/customers`)
  - React Hook Form, client-side validation, populate form on edit

- [x] **T-20** Add Contact routes to app router
  - File: `web/src/App.tsx`
  - Routes: `/contacts`, `/contacts/new`, `/contacts/:id/edit`

- [x] **T-21** Add "Contacts" nav item to sidebar/navigation
  - File: `web/src/components/Layout/` (sidebar component)

---

## Phase 6: Tests

- [x] **T-22** Write `CreateContactValidatorTests` — required fields (FirstName, Email) and email format
  - File: `src/CRM.Tests/Features/Contacts/CreateContactValidatorTests.cs`

- [x] **T-23** Write `CreateContactHandlerTests` — entity creation and repository call
  - File: `src/CRM.Tests/Features/Contacts/CreateContactHandlerTests.cs`

- [x] **T-24** Write `GetContactsHandlerTests` — paging and search filtering
  - File: `src/CRM.Tests/Features/Contacts/GetContactsHandlerTests.cs`

- [x] **T-25** Write `ContactListPage.test.tsx` — renders list, search, delete confirm dialog
  - File: `web/src/pages/Contacts/ContactListPage.test.tsx`

- [x] **T-26** Write `ContactFormPage.test.tsx` — validation errors, submit calls correct API
  - File: `web/src/pages/Contacts/ContactFormPage.test.tsx`

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
