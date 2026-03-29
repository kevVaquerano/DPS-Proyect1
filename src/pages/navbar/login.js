import { useEffect } from "react";
import { useRouter } from "next/router";

// el login real está en pages/index.js, así que solo redirigimos ahí
export default function Login() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, []);
  return null;
}