# REST API Plan

## 1. Resources

- Auth (supabase auth service)
- Profile (profiles table)
- Visit (visits table)
- Work Schedule (work_schedule table)
- Time Block (time_blocks table)
- Note (notes table)

## 2. Endpoints

### 2.1 Auth

#### POST /auth/signup

- description: register a new patient account
- request body:
  ```json
  {
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "date_of_birth": "YYYY-MM-DD"
  }
  ```
- responses:
  - 201: account created, returns { user_id, email, first_name, last_name }
  - 400: validation error (e.g. under 18)

#### POST /auth/login

- description: authenticate and retrieve jwt
- request body:
  ```json
  { "email": "string", "password": "string" }
  ```
- responses:
  - 200: { access_token, refresh_token, expires_in }
  - 401: invalid credentials

#### POST /auth/password-reset

- description: request password reset email
- request body:
  ```json
  { "email": "string" }
  ```
- responses:
  - 200: email sent
  - 404: email not found

### 2.2 Profile

#### GET /profiles/me

- description: retrieve current patient or worker profile
- authorization: bearer token required
- responses:
  - 200: profile object
  - 401: unauthorized

#### PATCH /profiles/me

- description: update own profile (except role)
- authorization: bearer token
- request body: any subset of { first_name, last_name, phone }
- responses:
  - 200: updated profile
  - 400: validation error
  - 401: unauthorized

#### DELETE /profiles/me

- description: soft delete own patient profile
- authorization: bearer token (patient only)
- responses:
  - 204: deleted
  - 401: unauthorized

### 2.3 Visits

#### GET /visits

- description: list visits for current user (patient: own; worker: all)
- authorization: bearer token
- query parameters: `page`, `limit`, `sort_by` (`start_time`), `status`
- responses:
  - 200: { data: [visit], meta: { total, page, limit } }

#### GET /visits/{id}

- description: retrieve single visit
- authorization: bearer token
- responses:
  - 200: visit object
  - 403: forbidden or out-of-range
  - 404: not found

#### GET /visits/next-available

- description: compute next available appointment for current patient
- authorization: bearer token (patient)
- query parameters: `duration` minutes (60 or 120)
- responses:
  - 200: { start_time: timestamptz, end_time: timestamptz }
  - 404: no availability

#### POST /visits

- description: schedule new visit
- authorization: bearer token (patient)
- request body:
  ```json
  { "start_time": "ISO 8601 timestamptz", "end_time": "ISO 8601 timestamptz", "purpose": "string" }
  ```
- validations:
  - start_time at full hour
  - duration matches 60 or 120 min
  - at least 24h in future
- responses:
  - 201: visit created
  - 400: validation error
  - 409: time conflict

#### PATCH /visits/{id}

- description: modify existing visit (patient only)
- authorization: bearer token (patient)
- request body: any of { start_time, end_time, purpose }
- validations:
  - same as POST
  - only if >24h before original start
- responses:
  - 200: updated visit
  - 400: validation error
  - 403: forbidden
  - 409: conflict

#### DELETE /visits/{id}

- description: cancel a visit
- authorization: bearer token (patient or worker)
- validations:
  - patient: only if >24h before
  - worker: no restriction
- responses:
  - 204: deleted
  - 403: forbidden

### 2.4 Work Schedule

#### GET /work-schedule

- description: list weekly work schedule
- authorization: bearer token (worker)
- responses:
  - 200: [ { day_of_week, start_time, end_time } ]

#### POST /work-schedule

- description: create weekly schedule entry
- authorization: bearer token (worker)
- request body: { day_of_week, start_time, end_time }
- responses:
  - 201: entry created
  - 400: validation error or duplicate

#### PATCH /work-schedule/{id}

- description: update schedule entry
- authorization: bearer token (worker)
- request body: any of { day_of_week, start_time, end_time }
- responses:
  - 200: updated entry
  - 400: validation error

#### DELETE /work-schedule/{id}

- description: remove schedule entry
- authorization: bearer token (worker)
- responses:
  - 204: deleted

### 2.5 Time Blocks

#### GET /time-blocks

- description: list all time blocks
- authorization: bearer token (worker)
- responses:
  - 200: [ { id, start_time, end_time, created_by } ]

#### POST /time-blocks

- description: create a time block
- authorization: bearer token (worker)
- request body: { start_time, end_time, note? }
- responses:
  - 201: block created
  - 400: validation error

#### PATCH /time-blocks/{id}

- description: update block
- authorization: bearer token (worker)
- request body: any of { start_time, end_time }
- responses:
  - 200: updated block
  - 400: validation error

#### DELETE /time-blocks/{id}

- description: remove block
- authorization: bearer token (worker)
- responses:
  - 204: deleted

### 2.6 Notes

#### GET /visits/{visit_id}/notes

- description: list notes for a visit
- authorization: bearer token (worker)
- responses:
  - 200: [ note ]

#### POST /visits/{visit_id}/notes

- description: add a note to a visit
- authorization: bearer token (worker)
- request body: { content }
- responses:
  - 201: note created
  - 400: validation error

#### PATCH /notes/{id}

- description: update a note
- authorization: bearer token (worker)
- request body: { content }
- responses:
  - 200: updated note

#### DELETE /notes/{id}

- description: delete a note
- authorization: bearer token (worker)
- responses:
  - 204: deleted

## 3. Authentication and Authorization

- mechanism: jwt via supabase auth
- header: Authorization: Bearer <token>
- roles derived from jwt claim `role_enum`
- rls policies enforced at db layer; api must pass user_id and respect 24h rules

## 4. Validation and Business Logic

- user.age >= 18 (signup)
- start_time < end_time; duration 60 or 120 minutes
- start_time must fall on full hour
- patient actions on visits only if at least 24h before start_time
- next-available endpoint uses db exclusion logic and work_schedule/time_blocks
- all timestamps must be ISO8601 with tz
- pagination uses `limit` and `page` parameters
