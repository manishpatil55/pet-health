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
