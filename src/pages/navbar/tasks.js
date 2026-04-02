import { useEffect } from "react";
import { useRouter } from "next/router";

// redirigimos a pages/tareas/index.jsx
export default function Tasks() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tareas");
  }, []);
  return null;
}         
  