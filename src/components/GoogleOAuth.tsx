// Legacy entry point. The Google sign-in implementation moved to a hook so
// each page can render its own themed "Continue with Google" button while
// sharing the credential flow. Import `useGoogleAuth` from
// `@/hooks/useGoogleAuth` instead.
export { useGoogleAuth } from '@/hooks/useGoogleAuth';
