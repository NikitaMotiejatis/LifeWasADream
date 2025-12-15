# Project Documentation – Summary of Changes

This document describes the deviations from the original project documentation.
While the implementation was initially based on the provided specification, a
significant number of elements were modified, removed, or redesigned during development.

---

## Data model

The original documentation described a wide range of functionalities that were
outside the scope of our project. The data model was overly detailed and included
many features that were not required for the core system objectives.

For this reason, we decided to focus only on the most important and relevant
parts of the domain. Unnecessary entities, tables, and relationships were
removed, and the data model was simplified to better match the actual project
scope and implementation goals.

The provided YAML specification included recursive structures, which are not legal in standard YAML. We found this approach invalid and unnecessarily complex, so we chose to simplify our implementation and focus on the core functionality and usability aspects.

Additionally, most items in their specification relied on a `version_id` system. We found this approach unusual and decided not to implement it like that.

### Deleted Items

The following features, tables, or data structures were fully removed from the system:

#### Database Tables & Data

- Location seating table
- Employee feedback table
- Menu data
- Recipe data
- Notification data
- Invite data
- Employee tasks
- Chat data
- Price table
- Discount table (disabled and then deleted)
- Order bill table

#### Application Data / Fields

- `description`
- `version_id`
- Deletion policy (application data)
- User type (application data)
- Business owner data
- Job data
- Payment-related data (deleted)
- Refund entity (renamed and merged into **Payment**)

### Changed / Refactored Items

#### Employee Data

- Employee data structure was reformatted
- Employee table was deleted and replaced by a new structure
- Employee status table was removed
- Removed fields:
  - `business_id`
  - `joined_at`
- Added **connected time data**:
  - Weekday-based working hours
- Introduced **Employee Shift**
- Employee Shift is now connected to:
  - Work Shift table
  - Employee entity

#### Location Data

- Location data structure was fixed
- Added logic defining **when a location is open**

#### Service Data

- `status` field removed
- Multiple service-related name changes applied for consistency

#### Orders

- Removed:
  - `created_at`
  - `closed_at`

### Added / New Features

- **Price Type** introduced
- `discount_id` added to specific entities
- **Item Discount table** added to replace the old discount logic
- Refund logic reworked and renamed to **Payment**

## Frontend

Although we considered the frontend design provided in the original documentation,
we chose not to implement it exactly as specified. Instead, the frontend was
developed alongside the HCI (Human–Computer Interaction) subject, allowing us
to experiment with multiple interaction patterns and functionalities.

We focused on designing our own frontend solutions, guided by insights from
usability testing, user feedback, and analysis. This approach allowed us to
validate our own design choices and interaction concepts, while still being
informed by the original proposed variant.

Also, the original design included features that were outside the scope of our project.

## Summary

Overall, the system diverges significantly from the original documentation.
Many features were removed to simplify the domain model, while others were
refactored to improve data consistency, flexibility, and maintainability.
