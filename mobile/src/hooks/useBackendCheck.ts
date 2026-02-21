/**
 * Proactive backend connectivity check on app load.
 * Runs once when the hook mounts, independent of location.
 */
import { useState, useEffect } from 'react';
import { checkBackendAvailable } from '../services/api';

export function useBackendCheck(): {
  connectionError: string | null;
  connectionChecked: boolean;
} {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);

  useEffect(() => {
    checkBackendAvailable()
      .then(() => {
        setConnectionError(null);
      })
      .catch((err) => {
        const msg =
          err?.name === 'AbortError'
            ? 'Connection timeout. Is the backend running?'
            : (err?.message || 'Cannot reach backend. Check same Wi‑Fi and API URL.');
        setConnectionError(msg);
      })
      .finally(() => setConnectionChecked(true));
  }, []);

  return { connectionError, connectionChecked };
}
