"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Removed custom role injection per feedback. Backend DB logic handles default permission assignments.
    });

    if (error) {
      setError(error.message);
    } else {
      // Default to student/parent routing, admin promotions happen through database
      router.push("/student");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Join the Skating School</h1>
        <p className={styles.subtitle}>Create your account to get started</p>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleSignUp} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className={styles.input}
              placeholder="••••••••"
            />
          </div>
          
          <div className={styles.inputGroup} style={{marginBottom: "1rem"}}>
            {/* Role dropdown removed. All accounts begin as Parents/Students until promoted by an Admin. */}
          </div>
          
          <button type="submit" className={styles.button}>Create Account</button>
        </form>
        
        <p className={styles.footerText}>
          Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
