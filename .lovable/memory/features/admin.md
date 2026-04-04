---
name: Admin Portal
description: Secure admin dashboard with appointments, patients EMR, doctors, blog CMS, analytics
type: feature
---
- Route: /admin (protected), /admin/login (public)
- Single "admin" role via user_roles table
- Appointments: list/calendar view, filters by doctor/status/date, walk-in booking module
- Patients: auto-generated PAT-XXXXXX codes, global search, visit history, treatment notes/prescriptions
- Doctors: CRUD with availability management
- Blog CMS: create/edit/publish posts with slug/category/cover image
- Dashboard: KPIs (total bookings online vs walk-in, patients, pending, completed)
- Auth: auto-confirm enabled, signup disabled (admin creates users)
