# Hire & Fix

## Project overview
Hire & Fix is a company-based home services booking platform.
Users can browse service employees added by vendors, book a specific employee for a service at their location, make payments, and manage bookings.

## Roles
- Admin: platform-wide control
- Vendor: manages employees and booking status
- Employee: views assigned bookings
- User/Customer: browses, books, pays, manages bookings

## MVP priorities
- Authentication
- Role-based access control
- CRUD operations
- Booking flow
- Payment integration
- Responsive homepage
- Validation and error handling

## Working rules
- Do not make large architecture changes without explaining them first.
- Prefer small, focused edits.
- Preserve the existing folder structure unless asked to refactor.
- When adding code, also add or update validation and error handling.
- For new features, explain which files will change before editing.
- Use pnpm, not npm.
- Assume development is done in WSL.

## Git workflow
- Main branch stays stable.
- New work should target feature/* branches.
- Keep commits focused and descriptive.

## When helping
- If requirements are unclear, first summarize assumptions.
- Prefer simple MVP implementations over overengineering.
- Match existing code style and naming conventions.