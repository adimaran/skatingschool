"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className={styles.dashboard}>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.subtitle}>Welcome back, {user.email}. System management access granted.</p>
        <button className={styles.button} onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}
