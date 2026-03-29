import { useEffect } from "react";
import { useRouter } from "next/router";

// el kanban de tareas está en pages/tareas/index.jsx
export default function Tasks() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tareas");
  }, []);
  return null;
}