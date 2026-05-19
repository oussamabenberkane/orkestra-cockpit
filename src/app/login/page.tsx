import BrandPanel from "@/components/login/BrandPanel";
import LoginCard from "@/components/login/LoginCard";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden relative">
      <BrandPanel />
      <LoginCard />
    </div>
  );
}
