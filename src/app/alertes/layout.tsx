/* AlertsProvider used to be mounted here. It now wraps the root layout so
 * the dashboard's "Alertes à traiter" card and the /alertes index page
 * share the same in-memory state — marking an alert as read from either
 * surface reflects on the other. This layout is kept as a pass-through so
 * we can re-introduce route-scoped concerns later without restructuring. */
export default function AlertesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
