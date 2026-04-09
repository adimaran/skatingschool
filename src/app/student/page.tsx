"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch the available classes to view
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesData) {
        setClasses(classesData);
      }
    }
    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className={styles.dashboard}>Loading Data...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.card} style={{ maxWidth: '800px' }}>
        <h1 className={styles.title}>Student / Parent Portal</h1>
        <p className={styles.subtitle}>Welcome back, {user.email}. Check attendance and available classes.</p>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Upcoming Skating Classes</h2>
          {classes.length === 0 ? (
            <p style={{ color: '#666', marginTop: '1rem' }}>No classes currently scheduled.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {classes.map(c => (
                <div key={c.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }}>
                  <h3 style={{ margin: 0, color: '#1e3c72' }}>{c.title}</h3>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}><strong>Level:</strong> {c.level}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}><strong>Time:</strong> {c.schedule_time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={styles.button} onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}
