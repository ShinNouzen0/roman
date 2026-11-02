import { DigitalService } from "@/types";
import { getStoredServices } from "@/services/serviceStore";

/**
 * Service to fetch digital services from database with graceful fallback to store.
 * Synchronized with Supabase / Admin updates in real-time.
 */
export async function getDigitalServices(): Promise<DigitalService[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/services", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    }
  } catch {
    // fallback to local stored services
  }
  return getStoredServices();
}

/**
 * Function to fetch a single service by ID
 */
export async function getDigitalServiceById(id: string): Promise<DigitalService | undefined> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/services/${id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    }
  } catch {
    // fallback to local stored services
  }
  const services = getStoredServices();
  return services.find((s) => s.id === id);
}
