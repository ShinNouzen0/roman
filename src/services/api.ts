import { DigitalService } from "@/types";
import { mockServices } from "@/data/mockData";

/**
 * Service to fetch digital services.
 * Currently uses mock data, but structured to easily switch to a real API fetch.
 */
export async function getDigitalServices(): Promise<DigitalService[]> {
  // Simulate network delay for realistic loading states
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockServices);
    }, 500); // 500ms delay
  });
}

/**
 * Optional: Function to fetch a single service by ID
 */
export async function getDigitalServiceById(id: string): Promise<DigitalService | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const service = mockServices.find(s => s.id === id);
      resolve(service);
    }, 300);
  });
}
