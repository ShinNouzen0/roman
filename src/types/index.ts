export interface DigitalService {
  id: string;
  name: string;
  description: string;
  category: string;
  agency: string;
  manager?: string;
  logo: string;
  url: string;
  status: "active" | "maintenance" | "inactive" | "development";
  users?: string;
  lastUpdated?: string;
}
