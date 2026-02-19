import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        新規登録
      </h1>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}
