import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        ログイン
      </h1>
      <LoginForm />
    </>
  );
}
