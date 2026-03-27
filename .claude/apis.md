# Authentication APIs

Base URL: `http://localhost:5000/api/v1` (dynamic via `VITE_API_BASE_URL`)

## Auth
- `POST /auth/signup/` — `{ name, email, password }`
- `POST /auth/login/` — `{ email, password }`
- `POST /auth/refresh-token/`
- `POST /auth/logout/`
- `POST /auth/logout-all/`
- `POST /auth/change-password/` — `{ currentPassword, newPassword }`
- `DELETE /auth/delete-account/`
- `POST /auth/resend-otp/` — `{ email }`
- `POST /auth/google/` — `{ idToken }`
- `POST /auth/forgot-password/` — `{ email }`
- `POST /auth/reset-password/` — `{ email, token, newPassword }`
- `POST /auth/verify-email/` — `{ email, otp }`

# Pet APIs
- `GET /pets/` — Get all pets
- `POST /pets/` — Create pet `{ name, type, breed, gender, dateOfBirth, initialWeight, photo, microchipId }`
- `GET /pets/:id/` — Get pet by id
- `PUT /pets/:id/` — Update pet
- `DELETE /pets/:id/` — Delete pet

# Vaccination APIs

## Templates
- `POST /vaccinations/templates/` — `{ petType, vaccineName, isCoreVaccine, recommendedAgeWeeks, boosterIntervalWeeks, description }`
- `GET /vaccinations/templates/`
- `PUT /vaccinations/templates/:id`
- `DELETE /vaccinations/templates/:id`

## Records
- `POST /vaccinations/` — `{ petId, vaccineName, dateAdministered, nextDueDate, veterinarianName, clinicName, notes, documents }`
- `GET /vaccinations/:id/` — Get by ID
- `GET /vaccinations/pet/:petId/` — Get all by pet
- `PUT /vaccinations/:id/` — Update
- `DELETE /vaccinations/:id/` — Delete

## Timeline
- `GET /vaccinations/pet/:petId/upcoming/`
- `GET /vaccinations/pet/:petId/overdue/`
- `PATCH /vaccinations/:id/complete/`

## Documents
- `GET /vaccinations/:id/document/` — Get all documents for a vaccination record

# Medication APIs
- `POST /medications/` — `{ pet, medicineName, dosage, frequency, customIntervalHours, startDate, endDate, notes }`
- `GET /medications/pet/:petId/` — Get all for pet
- `GET /medications/:id/` — Get by ID (with progress)
- `PATCH /medications/:id/` — Update
- `DELETE /medications/:id/` — Delete
- `GET /medications/:id/doses/` — Get dose logs
- `POST /medications/dose/:doseId/` — Mark dose taken
- `PATCH /medications/dose/:doseId/` — Update dose `{ status, takenTime }`

# Deworming APIs

## Schedules
- `POST /deworming/schedules/` — `{ petId, frequency }`
- `GET /deworming/schedules/:petId/`
- `PATCH /deworming/schedules/:scheduleId/`
- `DELETE /deworming/schedules/:scheduleId/`

## Records
- `POST /deworming/records/` — `{ petId, dateAdministered, productName, administeredBy, notes }`
- `GET /deworming/records/:petId/history`
- `GET /deworming/records/record/:recordId/`
- `PATCH /deworming/records/record/:recordId/`
- `DELETE /deworming/records/record/:recordId/`

# Weight Log APIs
- `POST /weightlogs/` — `{ petId, weight, unit, recordedDate, notes }`
- `GET /weightlogs/:petId/` — Get all logs for pet
- `GET /weightlogs/:petId/latest/` — Get latest weight
- `GET /weightlogs/:petId/stats/` — Get weight stats
- `GET /weightlogs/:petId/:logId/` — Get single log
- `PATCH /weightlogs/:logId/` — Update `{ weight, notes }`
- `DELETE /weightlogs/:logId/` — Delete

# Vet Visit APIs
- `POST /vetvisits/` — `{ petId, visitDate, visitType, clinicName, veterinarianName, diagnosis, treatmentDetails, cost, currency, notes, followUpDate }`
- `GET /vetvisits/:petId/` — Get all (supports `?visitType=&from=&to=`)
- `GET /vetvisits/:petId/upcoming/` — Upcoming visits
- `GET /vetvisits/:petId/overdue-follow-ups/` — Overdue follow-ups
- `GET /vetvisits/:petId/cost-summary/` — Cost summary
- `GET /vetvisits/visit/:visitId/` — Get single
- `PATCH /vetvisits/visit/:visitId/` — Update
- `DELETE /vetvisits/visit/:visitId/` — Delete
