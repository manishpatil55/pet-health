# Authentication APIs

Base URL: `http://localhost:5000/api/v1` (Note: we use dynamic `VITE_API_BASE_URL` in our code)

## 1. Sign up
- **Endpoint**: `POST /auth/signup/`
- **Body**: `{ "name": "test", "email": "test@gmail.com", "password": "test123456" }`
- **Response**: No response body (200 OK or 201 Created presumably).

## 2. Login
- **Endpoint**: `POST /auth/login/`
- **Body**: `{ "email": "test@gmail.com", "password": "test123456" }`
- **Response**: No response body (tokens are set via HttpOnly cookies? Wait, the previous API doc said "You will receive accessToken and refreshToken in the JSON response body" but this one says "No response body". Need to be careful here - if tokens are in cookies, we don't need to manually extract).

## 3. Refresh Token
- **Endpoint**: `POST /auth/refresh-token/`
- **Response**: No response body.

## 4. Logout
- **Endpoint**: `POST /auth/logout/`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: No response body.

## 5. Logout All
- **Endpoint**: `POST /auth/logout-all/`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: No response body.

## 6. Change Password
- **Endpoint**: `POST /auth/change-password/`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "currentPassword": "test123456", "newPassword": "newtest123456" }`
- **Response**: No response body.

## 7. Delete Account
- **Endpoint**: `DELETE /auth/delete-account/`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: No response body.

## 8. Resend OTP
- **Endpoint**: `POST /auth/resend-otp/`
- **Body**: `{ "email": "test@gmail.com" }`
- **Response**: No response body.

## 9. Google Login
- **Endpoint**: `POST /auth/google/`
- **Body**: `{ "idToken": "<firebase_id_token>" }`
- **Response**: No response body.

## 10. Forgot Password
- **Endpoint**: `POST /auth/forgot-password/`
- **Body**: `{ "email": "test@gmail.com" }`
- **Response**: No response body.

## 11. Reset Password
- **Endpoint**: `POST /auth/reset-password/`
- **Body**: `{ "email": "email@gmail.com", "token": "<reset_token_from_email_link>", "newPassword": "NewPass1234" }`
- **Response**: No response body.

## 12. Verify Email
- **Endpoint**: `POST /auth/verify-email/`
- **Body**: `{ "email": "test@gmail.com", "otp": "965834" }`
- **Response**: No response body.

# Pet APIs

## 1. Get all pets
- **Endpoint**: `GET /pets/`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of pets or `{ success: true, data: [...] }`

## 2. Create pet
- **Endpoint**: `POST /pets/`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
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

## 3. Get pet by id
- **Endpoint**: `GET /pets/{{id}}/`
- **Headers**: `Authorization: Bearer <token>`

## 4. Update pet
- **Endpoint**: `PUT /pets/{{id}}/`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
```json
{
  "name": "Max",
  "breed": "Poodle"
}
```

## 5. Delete pet
- **Endpoint**: `DELETE /pets/{{id}}/`
- **Headers**: `Authorization: Bearer <token>`

# Vaccination APIs

## 1. Vaccination Templates (Admin / Setup)
- `POST /vaccinations/templates/` - Create template
- `GET /vaccinations/templates/` - Get all templates
- `PUT /vaccinations/templates/:id` - Update template
- `DELETE /vaccinations/templates/:id` - Delete template

## 2. Vaccination Records (Core CRUD)
- `POST /vaccinations/` - Create vaccination record
- `GET /vaccinations/pet/:id/` - Get all vaccinations by Pet ID
- `GET /vaccinations/:id/` - Get vaccination by ID
- `PUT /vaccinations/:id/` - Update vaccination record
- `DELETE /vaccinations/:id/` - Delete vaccination record

## 3. Vaccination Timeline & Actions
- `GET /vaccinations/pet/:id/upcoming/` - Get upcoming vaccinations
- `GET /vaccinations/pet/:id/overdue/` - Get overdue vaccinations
- `PATCH /vaccinations/:id/complete/` - Mark vaccination as complete

# Deworming APIs

## 1. Deworming Schedules
- `POST /deworming/schedules/` - Create Schedule 
- `GET /deworming/schedules/:petId/` - Get Schedule for a Pet 
- `PATCH /deworming/schedules/:scheduleId/` - Update Schedule
- `DELETE /deworming/schedules/:scheduleId/` - Deactivate Schedule

## 2. Deworming Records
- `POST /deworming/records/` - Add Deworming Record
- `GET /deworming/records/:petId/history` - Get Deworming History for a Pet
- `GET /deworming/records/record/:recordId/` - Get Single Record
- `PATCH /deworming/records/record/:recordId/` - Update Record
- `DELETE /deworming/records/record/:recordId/` - Delete Record
