import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Projects() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, []);
  return null;
}    