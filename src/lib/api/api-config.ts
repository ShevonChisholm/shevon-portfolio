export function getApiBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_NEST_API_URL || process.env.NEXT_PUBLIC_API_URL;

  return (configured || "http://localhost:3001").replace(/\/+$/, "");
}
