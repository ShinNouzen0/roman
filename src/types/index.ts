export interface DigitalService {
  id: string;
  name: string;
  description: string;
  serviceType: "Layanan Publik" | "Administrasi Pemerintahan"; // Main category
  category: string; // Sub-category or Tag
  agency: string;
  manager?: string;
  logo: string;
  url: string;
  status: "active" | "maintenance" | "inactive" | "development";
  users?: string;
  lastUpdated?: string;
  contactEmail?: string;
  contactPhone?: string;
}
