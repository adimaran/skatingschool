"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function InstructorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Roster details
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [skillsPassed, setSkillsPassed] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, [router]);

  async function loadDashboard() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      router.push("/login"); return;
    }
    setUser(session.user);

    // Fetch classes the instructor is assigned to
    const { data: classesData } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (classesData) setClasses(classesData);
  }

  async function fetchRoster(classObj: any) {
    setSelectedClass(classObj);
    
    // Get all enrollments for this class from NEW SCHEMA (class_enrollments)
    const { data: enrollData } = await supabase.from('class_enrollments').select('kid_id').eq('class_id', classObj.id);
    if (!enrollData || enrollData.length === 0) {
      setRoster([]); return;
    }
    
    const kidIds = enrollData.map(e => e.kid_id);
    const { data: kidsData } = await supabase.from('kids').select('*').in('id', kidIds);
    if (kidsData) setRoster(kidsData);

    const { data: skillsData } = await supabase.from('skills_passed').select('*').eq('class_id', classObj.id);
    if (skillsData) setSkillsPassed(skillsData);
  }

  const handleToggleSkill = async (kidId: string, skillName: string) => {
    if (!selectedClass) return;
    const hasPassed = skillsPassed.some(s => s.kid_id === kidId && s.skill_name === skillName);
    
    if (hasPassed) {
      const { error } = await supabase.from('skills_passed').delete().eq('kid_id', kidId).eq('skill_name', skillName);
      if (error) alert("Error striking skill: " + error.message);
    } else {
      const { error } = await supabase.from('skills_passed').insert({
        kid_id: kidId,
        class_id: selectedClass.id,
        skill_name: skillName
      });
      if (error) alert("Error marking skill passed: " + error.message);
    }
    fetchRoster(selectedClass); // Refresh roster state
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return <div className={styles.dashboard}>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.card} style={{ maxWidth: '900px' }}>
        <h1 className={styles.title}>Instructor Portal</h1>
        <p className={styles.subtitle}>Manage your class rosters, attendance, and skill tracking.</p>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', textAlign: 'left' }}>
          
          {/* Class List Menu */}
          <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e3c72' }}>Select a Class</h2>
            {classes.length === 0 ? <p>No classes available.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {classes.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => fetchRoster(c)}
                    style={{ 
                      padding: '1rem', 
                      textAlign: 'left',
                      background: selectedClass?.id === c.id ? '#1e3c72' : '#f9f9f9',
                      color: selectedClass?.id === c.id ? 'white' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <strong>{c.level}</strong><br/>
                    <span style={{ fontSize: '0.8rem' }}>{c.day_of_week} | {c.time}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Roster View */}
          <div style={{ flex: 2 }}>
            {selectedClass ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>Roster: {selectedClass.level}</h2>
                <p style={{ margin: '0 0 1.5rem 0', color: '#666' }}>Skills: {selectedClass.skill_set || 'General'}</p>

                {roster.length === 0 ? (
                  <div style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                     No skaters have been enrolled by parents yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {roster.map(kid => {
                      const levelPassed = skillsPassed.some(s => s.kid_id === kid.id && s.skill_name === 'Level Passed');
                      return (
                        <div key={kid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{kid.name}</span>
                          <button 
                            onClick={() => handleToggleSkill(kid.id, 'Level Passed')}
                            style={{ 
                              padding: '0.5rem 1rem', 
                              borderRadius: '20px', 
                              border: 'none', 
                              cursor: 'pointer',
                              background: levelPassed ? '#28a745' : '#e0e0e0',
                              color: levelPassed ? 'white' : '#333'
                            }}
                          >
                            {levelPassed ? '🏆 Level Passed' : 'Mark as Passed'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '8px' }}>
                Select a class from the left to view its roster and manage skills.
              </div>
            )}
          </div>
        </div>
        
        <button className={styles.button} onClick={handleLogout} style={{ marginTop: '3rem', background: '#333' }}>Log Out</button>
      </div>
    </div>
  );
}
