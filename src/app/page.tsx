import { Inter_Tight } from "next/font/google";
import SelectorClient from "@/components/selector/SelectorClient";

const interTight = Inter_Tight({
  variable: "--sel-font",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function VersionSelectorPage() {
  return (
    <div
      className={interTight.variable}
      style={{
        fontFamily: "var(--sel-font), system-ui, sans-serif",
        background: "#F7F8FA",
        color: "#0F172A",
        minHeight: "100vh",
      }}
    >
      <SelectorClient />
    </div>
  );
}
