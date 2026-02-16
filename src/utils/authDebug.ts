/**
 * Auth/persist debug logging. Enable in dev via:
 *   localStorage.setItem('bookshoes-debug-auth', '1')
 * or open with ?bookshoes-debug-auth=1
 * Disable: localStorage.removeItem('bookshoes-debug-auth')
 */

const DEBUG_KEY = 'bookshoes-debug-auth';

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(DEBUG_KEY) === '1') return true;
    if (new URLSearchParams(window.location.search).get(DEBUG_KEY) === '1') return true;
  } catch {
    return false;
  }
  return false;
}

function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

export function logAuth(
  label: string,
  detail?: Record<string, unknown>
): void {
  if (!isEnabled()) return;
  const msg = detail ? `${label} ${JSON.stringify(detail)}` : label;
  console.log(`[bookshoes-auth ${ts()}] ${msg}`);
}

export function logAuthEnableHint(): void {
  if (typeof window === 'undefined') return;
  console.log(
    '[bookshoes] To log auth/rehydration/fetch sequence, run: localStorage.setItem("bookshoes-debug-auth","1") then refresh.'
  );
}
