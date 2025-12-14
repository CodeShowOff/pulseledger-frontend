import axios from "axios";

export default function getErrorMessage(err: unknown, fallback = "An error occurred") {
  if (axios.isAxiosError(err)) {
    const resp = err.response?.data as any;
    return (resp?.message as string) ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
