import BrandPanel from "@/components/login/BrandPanel";
import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <BrandPanel />
      <LoginForm />
    </div>
  );
}
