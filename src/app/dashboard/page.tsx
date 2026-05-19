import { fetchHeroData, fetchSatelliteValues, fetchAgentTaskRows } from "@/lib/dashboard-data";
import { heroByPeriod } from "@/lib/dashboard-mock";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [heroM, heroT, heroA, satelliteValues, agentTaskRows] = await Promise.all([
    fetchHeroData("M"),
    fetchHeroData("T"),
    fetchHeroData("A"),
    fetchSatelliteValues(),
    fetchAgentTaskRows(),
  ]);

  // Fall back to mock data when DB views return empty (seed agents not yet run)
  const initialHero = {
    M: heroM.data.length > 0 ? heroM : heroByPeriod.M,
    T: heroT.data.length > 0 ? heroT : heroByPeriod.T,
    A: heroA.data.length > 0 ? heroA : heroByPeriod.A,
  };

  return (
    <DashboardClient
      initialHero={initialHero}
      satelliteValues={satelliteValues}
      agentTaskRows={agentTaskRows}
    />
  );
}
