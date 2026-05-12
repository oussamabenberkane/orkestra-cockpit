import BrandPanel from "@/components/login/BrandPanel";
import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden relative">
      <BrandPanel />
      <LoginForm />
    </div>
  );
}
