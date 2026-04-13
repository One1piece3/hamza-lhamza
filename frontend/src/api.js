export const API_BASE_URL = "";
export const API_URL = "/api";
export const STORAGE_URL = "/storage";

export function isNetworkError(error) {
  return !error?.response && Boolean(error?.message);
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (isNetworkError(error)) {
    return "Le serveur est indisponible pour le moment. Verifiez que le backend est lance puis reessayez.";
  }

  return (
    error?.response?.data?.message ||
    fallbackMessage ||
    "Une erreur est survenue. Merci de reessayer."
  );
}
