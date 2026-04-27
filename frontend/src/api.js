export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : "/api";
export const STORAGE_URL = API_BASE_URL
  ? `${API_BASE_URL}/media`
  : "/media";

export function getStorageUrl(path) {
  if (!path) return "";

  const value = String(path).trim();
  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const cleanPath = value
    .replace(/^\/+/, "")
    .replace(/^storage\/+/i, "")
    .replace(/^media\/+/i, "");
  return `${STORAGE_URL}/${cleanPath}`;
}

export function isNetworkError(error) {
  return !error?.response && Boolean(error?.message);
}

function getFirstValidationError(error) {
  const errors = error?.response?.data?.errors;

  if (!errors || typeof errors !== "object") {
    return "";
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value[0]) {
      return String(value[0]);
    }
  }

  return "";
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (isNetworkError(error)) {
    return "Le serveur est indisponible pour le moment. Verifiez que le backend est lance puis reessayez.";
  }

  const validationMessage = getFirstValidationError(error);

  return (
    validationMessage ||
    error?.response?.data?.message ||
    fallbackMessage ||
    "Une erreur est survenue. Merci de reessayer."
  );
}
