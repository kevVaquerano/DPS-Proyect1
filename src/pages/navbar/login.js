import { useEffect } from "react";
import { useRouter } from "next/router";

// redirigimos 
export default function Login() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, []);
  return null;
}  