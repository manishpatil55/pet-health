# Pet health API Documentation

Base URL: `https://pet-health-tracker-mnpb.onrender.com/api/v1`

## 🔐 Authentication Guide
This API uses a dual-token system designed to work securely for both web and mobile clients.

**How it works**
- `accessToken`: 15 minutes lifetime. Used in every API request header.
- `refreshToken`: 90 days lifetime. Used only to get a new accessToken.

### 🌐 For Web Frontend Developers
**On Login/Signup:**
- You will receive `accessToken` and `refreshToken` in the JSON response body.
- Store `accessToken` in memory only. NEVER in localStorage.
- Ignore `refreshToken` from the body — the server sets it as an `HttpOnly` cookie automatically.

**On every API call:**
`Authorization: Bearer <accessToken>`

**When you receive a 401 response:**
Check the code field:
`{ "success": false, "code": "TOKEN_EXPIRED", "message": "Access token expired" }`

| Code | Action |
| --- | --- |
| `TOKEN_EXPIRED` | Call POST `/auth/refresh-token` with no body (cookie is sent automatically), then retry |
| `TOKEN_INVALID` | Redirect user to login |
| `WRONG_TOKEN_TYPE` | Redirect user to login |
| `NO_TOKEN` | Redirect user to login |
| `USER_NOT_FOUND` | Redirect user to login |
| `REFRESH_TOKEN_REUSE`| Redirect user to login |

**On Logout:**
Call POST `/api/v1/auth/logout`. The server removes session and clears cookie. Delete `accessToken` from state.

---

### Auth Routes `/api/v1/auth`

#### POST `/api/v1/auth/signup/`
Registers a new user and sends a one-time password (OTP).
**Body:**
```json
{
    "name": "test",
    "email": "test@gmail.com",
    "password": "test123456"
}
```

#### POST `/api/v1/auth/login/`
**Body:**
```json
{
    "email": "test@gmail.com",
    "password": "test123456"
}
```

#### POST `/api/v1/auth/refresh-token/`
Request to refresh access token using the stored cookie. No body required for web.

#### POST `/api/v1/auth/logout/`
Header: `Authorization: Bearer <accessToken>`

#### POST `/api/v1/auth/logout-all/`
Header: `Authorization: Bearer <accessToken>`

#### POST `/api/v1/auth/change-password/`
**Body:**
```json
{
    "currentPassword": "test123456",
    "newPassword": "newtest123456"
}
```

#### DELETE `/api/v1/auth/delete-account/`
Header: `Authorization: Bearer <accessToken>`

#### POST `/api/v1/auth/resend-otp/`
**Body:**
```json
{
    "email": "test@gmail.com"
}
```

#### POST `/api/v1/auth/google/`
**Body:**
```json
{
  "idToken": "<firebase_id_token>"
}
```

#### POST `/api/v1/auth/forgot-password/`
**Body:**
```json
{
   "email": "test@gmail.com"
}
```

#### POST `/api/v1/auth/reset-password/`
**Body:**
```json
{
  "email": "email@gmail.com",
  "token": "<reset_token_from_email_link>",
  "newPassword": "NewPass1234"
}
```

#### POST `/api/v1/auth/verify-email/`
**Body:**
```json
{
    "email": "test@gmail.com",
    "otp": "965834"
}
```

---

### Pet Routes `/api/v1/pets`

#### GET `/api/v1/pets/`
Get paginated pets.

#### POST `/api/v1/pets/`
**Body:**
```json
{
  "name": "Buddy",
  "type": "Dog",
  "breed": "Labrador",
  "gender": "Male",
  "dateOfBirth": "2022-01-15",
  "initialWeight": 10,
  "photo": "url_or_base64",
  "microchipId": "123ABC"
}
```

#### GET `/api/v1/pets/:id/`
Get pet by ID.

#### PUT `/api/v1/pets/:id/`
Update pet by ID.
**Body:**
```json
{
  "name": "Max",
  "breed": "Poodle"
}
```

#### DELETE `/api/v1/pets/:id/`
Delete pet by ID.

---

### Vaccination Routes `/api/v1/vaccinations`

#### POST `/api/v1/vaccinations/templates/`
Create templates (Admin).
**Body:**
```json
{
  "petType": "dog",
  "vaccineName": "Rabies",
  "isCoreVaccine": true,
  "recommendedAgeWeeks": 12,
  "boosterIntervalWeeks": 52,
  "description": "Rabies vaccine for dogs."
}
```

#### GET `/api/v1/vaccinations/templates/`
Get templates (Admin).

#### PUT `/api/v1/vaccinations/templates/:id`
Update template by ID (Admin).
**Body:**
```json
{
  "vaccineName": "Updated Rabies",
  "description": "Updated description."
}
```

#### DELETE `/api/v1/vaccinations/templates/:id`
Delete template by ID (Admin).

#### POST `/api/v1/vaccinations/pet/:petId/auto-generate`
Auto-generates vaccination records for a pet based on vaccine templates. Returns created items.

#### POST `/api/v1/vaccinations/`
Create vaccination manually.
**Body:**
```json
{
  "petId": "69bbf1a2ae5b807177776598",
  "vaccineName": "Rabies",
  "dateAdministered": "2025-04-01",
  "nextDueDate": "2026-04-01",
  "veterinarianName": "Dr. Smith",
  "clinicName": "Happy Pets Clinic",
  "notes": "Annual booster",
  "documents": [
    { "url": "https://...", "type": "image" }
  ]
}
```

#### GET `/api/v1/vaccinations/:id/`
Get vaccination by ID.

#### GET `/api/v1/vaccinations/pet/:petId/`
Get all vaccinations By petID.

#### DELETE `/api/v1/vaccinations/:id/`
Delete vaccination.

#### PUT `/api/v1/vaccinations/:id/`
Update vaccination by ID.
**Body:**
```json
{
  "dateAdministered": "",
  "nextDueDate": "2026-01-01"
}
```

#### GET `/api/v1/vaccinations/pet/:petId/upcoming/`
Get upcoming vaccination by petId.

#### GET `/api/v1/vaccinations/pet/:petId/overdue/`
Get overdue vaccination by petId.

#### PATCH `/api/v1/vaccinations/:id/complete/`
Mark vaccination as complete.

#### GET `/api/v1/vaccination/:id/documnets/`
Get documents of vaccination. (Note backend typo "documnets" and singular "vaccination").

---

### Deworming Routes `/api/v1/deworming`

#### POST `/api/v1/deworming/schedules/`
Create Schedule.
**Body:**
```json
{
  "petId": "69c049ab471224d2d34afda9",
  "frequency": "monthly"
}
```

#### GET `/api/v1/deworming/schedules/:id/`
Get Schedule for a Pet. Note: `:id` matches pet ID.

#### PATCH `/api/v1/deworming/schedules/:id/`
Update Schedule. 
**Body:**
```json
{
  "frequency": "quarterly"
}
```

#### POST `/api/v1/deworming/records/`
Add Deworming Record.
**Body:**
```json
{
  "petId": "69c049ab471224d2d34afda9",
  "dateAdministered": "2026-03-20",
  "productName": "Drontal Plus",
  "administeredBy": "Dr. Smith",
  "notes": "No side effects observed"
}
```

#### GET `/api/v1/deworming/records/:petId/history`
Get Deworming History for a Pet.

#### GET `/api/v1/deworming/records/record/:recordId/`
Get Single Record.

#### PATCH `/api/v1/deworming/records/record/:recordId/`
Update Record.
**Body:**
```json
{
  "notes": "Updated — slight lethargy observed for 1 hour",
  "productName": "Drontal Plus (updated)"
}
```

#### DELETE `/api/v1/deworming/records/record/:recordId/`
Delete Record.

#### DELETE `/api/v1/deworming/schedules/:scheduleId/`
Deactivate Schedule.

---

### Weight Routes `/api/v1/weightlogs`

#### POST `/api/v1/weightlogs/`
Add Weight Log.
**Body:**
```json
{
  "petId": "69c049ab471224d2d34afda9",
  "weight": 12.5,
  "unit": "kg",
  "recordedDate": "2026-03-01",
  "notes": "After morning walk"
}
```

#### GET `/api/v1/weightlogs/:petId/`
Get All Weight Logs for a Pet.

#### GET `/api/v1/weightlogs/:petId/latest/`
Get Latest Weight.

#### GET `/api/v1/weightlogs/:petId/stats/`
Get Weight Stats.

#### GET `/api/v1/weightlogs/:petId/:logId/`
Get Single Log.

#### PATCH `/api/v1/weightlogs/:logId/`
Update Weight Log.
**Body:**
```json
{
  "weight": 12.8,
  "notes": "Corrected entry — weighed before meal"
}
```

#### DELETE `/api/v1/weightlogs/:logId/`
Delete Weight Log.

---

### Vet Visit Routes `/api/v1/vetvisits`

#### POST `/api/v1/vetvisits/`
Create Vet Visit (Past or Future).
**Body:**
```json
{
  "petId": "69c049ab471224d2d34afda9",
  "visitDate": "2026-03-15",
  "visitType": "routine",
  "clinicName": "PetCare Clinic",
  "veterinarianName": "Dr. Sharma",
  "diagnosis": "Healthy — no issues found",
  "treatmentDetails": "Flea treatment applied",
  "cost": 800,
  "currency": "INR",
  "notes": "Next visit in 6 months",
  "followUpDate": "2026-09-15"
}
```

#### GET `/api/v1/vetvisits/:petId/?visitType=routine&from=2026-01-01&to=2026-12-31`
Get All Vet Visits for a Pet.

#### GET `/api/v1/vetvisits/:petId/upcoming/`
Get Upcoming Visits.

#### GET `/api/v1/vetvisits/:petId/overdue-follow-ups/`
Get Overdue Follow-ups.

#### GET `/api/v1/vetvisits/:petId/cost-summary/`
Get Cost Summary.

#### GET `/api/v1/vetvisits/visit/:visitId/`
Get Single Visit.

#### PATCH `/api/v1/vetvisits/visit/:visitId/`
Update Visit.
**Body:**
```json
{
  "diagnosis": "Mild ear infection detected",
  "treatmentDetails": "Ear drops prescribed — 5 days course",
  "cost": 950
}
```

#### DELETE `/api/v1/vetvisits/visit/:visitId/`
Delete Visit.

---

### Medication Routes `/api/v1/medications`

#### POST `/api/v1/medications/`
Create medication.
**Body:**
```json
{
  "pet": "69c049ab471224d2d34afda9",
  "medicineName": "Amoxicillin",
  "dosage": "10mg",
  "frequency": "twice-daily",
  "customIntervalHours": 8,
  "startDate": "2026-03-23",
  "endDate": "2026-03-30",
  "notes": "after food"
}
```

#### GET `/api/v1/medications/pet/:petId/`
Get all medication for a pet.

#### GET `/api/v1/medications/:id/`
Get a medication by ID.

#### PATCH `/api/v1/medications/:id/`
Update a medication by ID.
**Body:**
```json
{
  "notes": "Take with food",
  "dosage": "20mg",
  "status": "stopped"
}
```

#### DELETE `/api/v1/medications/:id/`
Delete a medication by ID.

#### GET `/api/v1/medications/:id/doses/`
Get all dose logs for a medication.

#### POST `/api/v1/medications/dose/:id/`
Mark a dose as taken.

#### PATCH `/api/v1/medications/dose/:id/`
Update a dose log.
**Body:**
```json
{
  "status": "missed",
  "takenTime": "2026-03-24T08:00:00.000Z"
}
```
