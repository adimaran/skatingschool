"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [kids, setKids] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  const [newKidName, setNewKidName] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, [router]);

  async function loadDashboard() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      router.push("/login"); return;
    }
    const currentUser = session.user;
    setUser(currentUser);

    // FOREIGN KEY PATCH: Guarantee the user exists in `users` table before doing Kids operations!
    const { data: userCheck } = await supabase.from('users').select('id').eq('id', currentUser.id).single();
    if (!userCheck) {
      // If they signed up under the old system, forcefully migrate them to the new class repo architecture!
      await supabase.from('users').insert({ id: currentUser.id, role: 'parent' });
    }

    // Fetch classes
    const { data: classesData } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (classesData) setClasses(classesData);

    // Fetch Parent's Kids
    const { data: kidsData } = await supabase.from('kids').select('*').eq('parent_id', currentUser.id);
    if (kidsData) {
      setKids(kidsData);
      
      if (kidsData.length > 0) {
        const kidIds = kidsData.map(k => k.id);
        const { data: enrollData } = await supabase.from('class_enrollments').select('*').in('kid_id', kidIds);
        if (enrollData) setEnrollments(enrollData);
      }
    }
  }

  const handleAddKid = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('kids').insert({ parent_id: user.id, name: newKidName });
    if (error) alert("Error adding kid: " + error.message);
    setNewKidName("");
    loadDashboard();
  };

  const handleEnrollMenu = async (classId: string, kidId: string) => {
    const isEnrolled = enrollments.some(e => e.class_id === classId && e.kid_id === kidId);
    if (isEnrolled) {
      const { error } = await supabase.from('class_enrollments').delete().eq('class_id', classId).eq('kid_id', kidId);
      if (error) alert("Error unenrolling: " + error.message);
    } else {
      const { error } = await supabase.from('class_enrollments').insert({ class_id: classId, kid_id: kidId });
      if (error) alert("Error enrolling: " + error.message);
    }
    loadDashboard();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className={styles.dashboard}>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.card} style={{ maxWidth: '900px' }}>
        <h1 className={styles.title}>Parent Management Portal</h1>
        <p className={styles.subtitle}>Track your skaters and manage their class enrollments.</p>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', textAlign: 'left' }}>
          
          {/* Kids Management */}
          <div style={{ flex: 1, background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e3c72' }}>My Skaters</h2>
            {kids.length === 0 ? <p style={{fontSize: '0.9rem'}}>No skaters added yet.</p> : (
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                {kids.map(k => <li key={k.id} style={{marginBottom: '0.5rem'}}><strong>{k.name}</strong></li>)}
              </ul>
            )}
            
            <form onSubmit={handleAddKid} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" placeholder="Enter Child's Name" value={newKidName} onChange={e => setNewKidName(e.target.value)} required className={styles.input} />
              <button type="submit" className={styles.button} style={{ padding: '0.6rem' }}>Add Skater</button>
            </form>
          </div>

          {/* Classes Catalog & Enrollment */}
          <div style={{ flex: 2 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Class Catalog</h2>
            {classes.length === 0 ? <p>No classes available.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {classes.map(c => (
                  <div key={c.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3 style={{ margin: 0, color: '#1e3c72' }}>{c.level} (Cap: {c.capacity})</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#555' }}>Time: {c.day_of_week} at {c.time} | Skills: {c.skill_set || 'N/A'}</p>
                    
                    {kids.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                        <p style={{ fontSize: '0.8rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Enrollment Actions:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {kids.map(kid => {
                            const isEnrolled = enrollments.some(e => e.class_id === c.id && e.kid_id === kid.id);
                            return (
                              <button 
                                key={kid.id} 
                                onClick={() => handleEnrollMenu(c.id, kid.id)}
                                style={{ 
                                  padding: '4px 12px', 
                                  borderRadius: '20px', 
                                  border: 'none', 
                                  cursor: 'pointer',
                                  background: isEnrolled ? '#28a745' : '#e0e0e0',
                                  color: isEnrolled ? 'white' : '#333'
                                }}
                              >
                                {isEnrolled ? `✓ ${kid.name}` : `+ ${kid.name}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        <button className={styles.button} onClick={handleLogout} style={{ marginTop: '3rem', background: '#333' }}>Log Out</button>
      </div>
    </div>
  );
}
