const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}
