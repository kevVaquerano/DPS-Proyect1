import { useEffect } from "react";
import { useRouter } from "next/router";

// los proyectos se manejan desde el dashboard
export default function Projects() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, []);
  return null;
}