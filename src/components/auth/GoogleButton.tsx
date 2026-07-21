"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/shared/Button";

// Google "G" mark — lucide has no brand logo, so we inline the official colors.
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.4z"
      />
      <path
        fill="#FBBC05"
        d="M10.3 28.3c-.5-1.4-.7-2.9-.7-4.3s.3-2.9.7-4.3l-7.8-6.1C.9 16.7 0 20.2 0 24s.9 7.3 2.5 10.4l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.4 0-11.8-3.7-13.7-9.8l-7.8 6.1C6.4 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

// Submit button for the sign-in form. Uses the form's pending status to show a
// real loading state while the Google OAuth redirect is in flight.
export function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      fullWidth
      loading={pending}
      leftIcon={<GoogleMark />}
    >
      Continue with Google
    </Button>
  );
}
