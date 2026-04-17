"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  
  // New Class Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSessionId, setNewSessionId] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newCapacity, setNewCapacity] = useState("10");

  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, [router]);

  async function loadDashboard() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      router.push("/login");
      return;
    }
    const currentUser = session.user;
    setUser(currentUser);
    
    // Check missing Foreign Key
    const { data: userCheck } = await supabase.from('users').select('id').eq('id', currentUser.id).single();
    if (!userCheck) {
      await supabase.from('users').insert({ id: currentUser.id, role: 'admin' });
    }

    // Fetch Classes
    const { data: classesData } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (classesData) setClasses(classesData);

    // Fetch Sessions
    const { data: sessData } = await supabase.from('sessions').select('*');
    if (sessData) setSessions(sessData);

    // Fetch Instructors from 'users'
    const { data: instData } = await supabase.from('users').select('*').eq('role', 'instructor');
    if (instData) setInstructors(instData);
    
    if (selectedClassId) fetchRoster(selectedClassId);
  }

  const fetchRoster = async (classId: string) => {
    const { data: enrollData } = await supabase.from('class_enrollments').select('kid_id').eq('class_id', classId);
    if (!enrollData || enrollData.length === 0) {
      setRoster([]); return;
    }
    const kidIds = enrollData.map(e => e.kid_id);
    const { data: kidsData } = await supabase.from('kids').select('*').in('id', kidIds);
    if (kidsData) setRoster(kidsData);
  };

  const handleClassClick = (classId: string) => {
    if (selectedClassId === classId) {
      setSelectedClassId(null);
      setRoster([]);
    } else {
      setSelectedClassId(classId);
      fetchRoster(classId);
    }
  };

  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSessionId) {
      alert("Please select a session first!"); return;
    }
    await supabase.from('classes').insert({
      session_id: newSessionId,
      level: newLevel,
      skill_set: newTitle,
      time: newTime,
      day_of_week: newDay,
      capacity: Number(newCapacity)
    });
    setNewTitle(""); setNewLevel(""); setNewTime(""); setNewDay("");
    loadDashboard();
  };

  const handleAssignInstructor = async (classId: string, instructorId: string) => {
    await supabase.from('classes').update({ instructor_id: instructorId || null }).eq('id', classId);
    loadDashboard();
  };

  const handleDeleteClass = async (classId: string) => {
    await supabase.from('classes').delete().eq('id', classId);
    if (selectedClassId === classId) setSelectedClassId(null);
    loadDashboard();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className={styles.dashboard}>Loading Data...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.card} style={{ maxWidth: '900px' }}>
        <h1 className={styles.title}>Admin Logistics Portal</h1>
        <p className={styles.subtitle}>Full System Access: Schedule classes and assign instructors.</p>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', textAlign: 'left' }}>
          
          {/* Create Form */}
          <div style={{ flex: 1, background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e3c72' }}>Schedule New Class</h2>
            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <select value={newSessionId} onChange={e => setNewSessionId(e.target.value)} required className={styles.input}>
                <option value="">-- Select Session Term --</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <input type="text" placeholder="Skill Desc (e.g. Forward Gliding)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className={styles.input} />
              <input type="text" placeholder="Level (e.g. Basic 1)" value={newLevel} onChange={e => setNewLevel(e.target.value)} required className={styles.input} />
              <input type="text" placeholder="Day (e.g. Saturday)" value={newDay} onChange={e => setNewDay(e.target.value)} required className={styles.input} />
              <input type="text" placeholder="Time (e.g. 9:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} required className={styles.input} />
              <input type="number" placeholder="Capacity" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} required className={styles.input} />
              
              <button type="submit" className={styles.button} style={{ marginTop: '0.5rem' }}>Add Class to Roster</button>
            </form>
          </div>

          {/* Manage Grid */}
          <div style={{ flex: 2 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Master Class List</h2>
            {classes.length === 0 ? (
              <p>No classes found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {classes.map(c => {
                  const isExpanded = selectedClassId === c.id;
                  const instMatch = instructors.find(i => i.id === c.instructor_id);
                  const instLabel = instMatch ? instMatch.id.substring(0,6) + '...' : 'Unassigned';

                  return (
                    <div key={c.id} style={{ border: isExpanded ? '2px solid #1e3c72' : '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', background: isExpanded ? '#f0f4f8' : 'white', cursor: 'pointer' }} onClick={() => handleClassClick(c.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ margin: 0, color: '#1e3c72', fontSize: '1.1rem' }}>{c.level}: {c.skill_set || 'General'}</h3>
                          <span style={{ fontSize: '0.8rem', background: c.instructor_id ? '#d4edda' : '#f8d7da', padding: '2px 8px', borderRadius: '12px' }}>
                            Instr: {instLabel}
                          </span>
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#555' }}>{c.day_of_week} | {c.time} | Cap: {c.capacity}</p>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div style={{ padding: '1rem', borderTop: '1px solid #eee', background: '#fafafa' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Update Instructor Assignment: </label>
                            <select 
                              value={c.instructor_id || ""} 
                              onChange={(e) => handleAssignInstructor(c.id, e.target.value)}
                              style={{ padding: '4px', borderRadius: '4px', marginLeft: '0.5rem' }}
                            >
                              <option value="">-- Unassigned --</option>
                              {instructors.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.id.substring(0,6)}... (Instructor)</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Enrolled Students Roster:</p>
                            {roster.length === 0 ? (
                              <p style={{ fontSize: '0.85rem', color: '#777', fontStyle: 'italic', margin: 0 }}>No students enrolled in this class yet.</p>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                {roster.map(r => <li key={r.id}>{r.name}</li>)}
                              </ul>
                            )}
                          </div>

                          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.id); }} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete Class</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <button className={styles.button} onClick={handleLogout} style={{ marginTop: '3rem', background: '#333' }}>Log Out</button>
      </div>
    </div>
  );
}
