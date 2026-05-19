import { AlertsProvider } from "@/components/dashboard/AlertsProvider";

export default function AlertesLayout({ children }: { children: React.ReactNode }) {
  return <AlertsProvider>{children}</AlertsProvider>;
}
