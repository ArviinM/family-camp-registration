# Task Breakdown: Family Camp Registration System (Direct Supabase)

This breakdown outlines the key tasks required to build the Family Camp Registration System using direct Supabase integration from Next.js.

**Phase 1: Setup & Foundation (Est. 0.5 days)**

* [ ] **Task 1.1:** Initialize Next.js Project.
* [ ] **Task 1.2:** Set up Supabase Project (Database, Auth - if needed).
* [ ] **Task 1.3:** Install and configure Shadcn/ui.
* [ ] **Task 1.4:** Install ExcelJS library (`npm install exceljs`).
* [ ] **Task 1.5:** Install Supabase client library (`npm install @supabase/supabase-js`).
* [ ] **Task 1.6:** Define Database Schema in Supabase (e.g., `registrants` table with columns: `id`, `created_at`, `full_name`, `age`, `church_location`, `assigned_group`, etc.). Set up Row Level Security (RLS) policies appropriately.
* [ ] **Task 1.7:** Configure Supabase client in Next.js (environment variables for URL and anon key).
* [ ] **Task 1.8:** Set up basic project structure (folders for components, pages/app router, utils, actions if using Server Actions).

**Phase 2: Core Registration Feature (Est. 1 day)**

* [ ] **Task 2.1:** Create the Registration Page UI (`/register` or relevant route in App Router).
* [ ] **Task 2.2:** Build the Registration Form component using Shadcn/ui components (Input, Select for location, Button).
    * Include fields: Full Name, Age (Must be 12 or above), Church Location (populate dropdown from list).
    * Add form validation (required fields, age >= 12). Clearly state the age requirement (12+) on the form.
* [ ] **Task 2.3:** Implement the form submission logic (e.g., using a Server Action or an event handler in a Client Component).
* [ ] **Task 2.4:** Inside the submission logic, call `supabase.from('registrants').insert(...)` directly to save valid registration data (age >= 12) to the Supabase table. Handle potential errors.
* [ ] **Task 2.5:** Display a success/confirmation message upon successful registration, or an error message if age is below 12 or if the database operation fails.

**Phase 3: Grouping Algorithm & Assignment (Est. 1-1.5 days)**

* [ ] **Task 3.1:** Define Age Brackets **starting from age 12** (e.g., 12-18, 19-30, 31-50, 51+). *Decision needed.*
* [ ] **Task 3.2:** Design the Grouping Algorithm Logic (operates only on registrants aged 12+).
    * *Option A (Simpler):* Round-robin assignment.
    * *Option B (Better Balance):* Calculate group "scores" based on current counts per age bracket/location.
    * *Decision needed.*
* [ ] **Task 3.3:** Implement the grouping algorithm.
    * **Recommended:** As a Supabase Database Function (PL/pgSQL). This keeps logic close to data.
    * *Alternative:* As a JavaScript function within Next.js (e.g., in `/utils` or a Server Action). Requires fetching current group counts from Supabase first.
* [ ] **Task 3.4:** Integrate Grouping Logic:
    * *Option A (Trigger from Frontend/Server Action):* After successful registration insert (Task 2.4), call the Supabase Function (e.g., using `supabase.rpc('assign_group', { registrant_id: new_id })`) or the JS function to determine the group and update the registrant's record (`supabase.from('registrants').update(...)`).
    * *Option B (Manual Trigger):* Create an admin button that triggers a Server Action or client-side function to run the grouping logic (Supabase Function or JS) on all *ungrouped, eligible* registrants.
* [ ] **Task 3.5:** Test the grouping logic with sample data.

**Phase 4: Data Export Feature (Est. 0.5 days)**

* [ ] **Task 4.1:** Create a Server Action (`exportRegistrants`) or a client-side function triggered by an admin button.
* [ ] **Task 4.2:** Implement logic within the action/function to fetch all eligible registrants (age >= 12) directly from Supabase (`supabase.from('registrants').select('*').gte('age', 12)`).
* [ ] **Task 4.3:** Use ExcelJS *within the Server Action* (or potentially client-side, though server-side is often easier for file generation) to generate an Excel file buffer from the fetched data.
* [ ] **Task 4.4:** Set appropriate headers for file download (e.g., `Content-Disposition`). Return the file buffer.
* [ ] **Task 4.5:** Add a button/link on the admin page to trigger the export action/function.
* [ ] **Task 4.6:** Implement separate exports per group (modify Supabase query to filter by `assigned_group`).

**Phase 5: Data Import Feature (Est. 1 day - *Lower Priority*)**

* [ ] **Task 5.1:** Design the expected Excel file structure/template.
* [ ] **Task 5.2:** Create an Admin Page/Section UI for file upload (e.g., using `<input type="file">`).
* [ ] **Task 5.3:** Create a Server Action (`importRegistrants`) to handle the file upload.
* [ ] **Task 5.4:** Implement logic within the Server Action to:
    * Receive the uploaded file.
    * Parse the Excel file using ExcelJS.
    * Iterate through rows, validating data and **filtering out rows where age < 12.**
    * Prepare an array of valid registrant objects.
* [ ] **Task 5.5:** Perform batch insert/upsert directly to Supabase (`supabase.from('registrants').upsert(validRegistrants)`). Handle potential errors and limits.
* [ ] **Task 5.6:** Optionally, trigger the grouping algorithm (Supabase Function or JS logic) for newly imported users.
* [ ] **Task 5.7:** Provide feedback to the admin on import success/failure/rows processed/skipped.

**Phase 6: Admin View & Management (Est. 0.5 days - *Basic version*)**

* [ ] **Task 6.1:** Create a basic Admin Page UI (`/admin`). Secure it using Supabase Auth and RLS, or simple password protection if Auth is too complex for the timeframe.
* [ ] **Task 6.2:** Fetch and display the list of all *eligible* registrants (age >= 12) directly from Supabase in a component (Client or Server Component). Use Shadcn/ui Table.
* [ ] **Task 6.3:** Add client-side or server-side filtering/tabs to view participants by assigned group. Fetch data accordingly from Supabase.
* [ ] **Task 6.4:** Add buttons/links to trigger Export and Import Server Actions.
* [ ] **Task 6.5:** (Optional) Add a button to manually trigger the grouping process (calling the relevant Server Action or Supabase Function).

**Phase 7: Testing & Deployment (Est. 0.5 days)**

* [ ] **Task 7.1:** End-to-end testing: Registration (including age < 12 rejection), direct Supabase interactions, grouping, export, import (if applicable). Check RLS policies.
* [ ] **Task 7.2:** Test responsiveness.
* [ ] **Task 7.3:** Deploy the application (e.g., to Vercel, ensuring Supabase environment variables are set).
* [ ] **Task 7.4:** Final testing on the deployed environment.

**Notes:**

* Timeline remains aggressive. Prioritize MVP.
* Use Server Actions for mutations (create, update, delete) and potentially for data fetching that requires server-side logic (like file generation). Use Supabase client directly in components for reads where appropriate.
* **Supabase Row Level Security (RLS) is crucial** when interacting directly from the client/browser to ensure users can only access/modify data they are permitted to.
* Decide early on the grouping algorithm implementation (Supabase Function vs. JS).
