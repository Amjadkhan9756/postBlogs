import axios from "axios";

const DEFAULT_API_BASE_URL = "https://postblogs-eyvu.onrender.com/";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const configuredLocalApiUrl =
  configuredApiBaseUrl &&
  /^https?:\/\/(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i.test(
    configuredApiBaseUrl
  );

export const BASE_URL =
  process.env.NODE_ENV === "production" && configuredLocalApiUrl
    ? DEFAULT_API_BASE_URL
    : configuredApiBaseUrl ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8080/"
        : DEFAULT_API_BASE_URL);

const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

export function getApiErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    (error?.request ? fallback : error?.message || fallback)
  );
}

/** Production-safe image URL: only returns URL when we have a real filename from DB. */
export function getImageUrl(filename) {
  if (!filename || typeof filename !== "string") return null;
  const trimmed = filename.trim();
  if (!trimmed || trimmed === "default.jpg") return null;
  return `${base}/uploads/${trimmed}`;
}

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
