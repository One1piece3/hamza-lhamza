const STORAGE_KEY = "hamza_lhamza_admin_session";
const CUSTOMER_STORAGE_KEY = "hamza_lhamza_customer_session";

function getStorageEntries(key) {
  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    const raw = storage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      return JSON.parse(raw);
    } catch {
      storage.removeItem(key);
    }
  }

  return null;
}

function persistSession(key, session, remember = true) {
  const targetStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(key);
  targetStorage.setItem(key, JSON.stringify(session));
}

function clearStoredSession(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function getAdminSession() {
  try {
    return getStorageEntries(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAdminSession(session, remember = true) {
  persistSession(STORAGE_KEY, session, remember);
}

export function clearAdminSession() {
  clearStoredSession(STORAGE_KEY);
}

export function getAdminAuthHeaders() {
  const session = getAdminSession();
  return session?.token
    ? { Authorization: `Bearer ${session.token}` }
    : {};
}

export function getCustomerSession() {
  try {
    return getStorageEntries(CUSTOMER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCustomerSession(session, remember = true) {
  persistSession(CUSTOMER_STORAGE_KEY, session, remember);
}

export function clearCustomerSession() {
  clearStoredSession(CUSTOMER_STORAGE_KEY);
}
