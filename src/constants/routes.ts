export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/signin',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected
  DASHBOARD: '/dashboard',
  PETS: '/pets',
  ADD_PET: '/pets/new',
  PET_PROFILE: '/pets/:id',
  EDIT_PET: '/pets/:id/edit',
  VACCINATIONS: '/pets/:id/vaccinations',
  MEDICATIONS: '/pets/:id/medications',
  DEWORMING: '/pets/:id/deworming',
  VET_VISITS: '/pets/:id/vet-visits',
  WEIGHT: '/pets/:id/weight',
  DOCUMENTS: '/documents',
  SETTINGS: '/settings',
} as const;

/**
 * Generate a dynamic route path by replacing :id with an actual ID
 */
export const buildPath = (route: string, params: Record<string, string>): string => {
  let path = route;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, value);
  }
  return path;
};
