import { useEffect } from "react";
import { useRouter } from "next/router";

// el registro también está en pages/index.js (hay un toggle login/registro)
export default function Register() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, []);
  return null;
}