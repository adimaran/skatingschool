import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>❄️ Skating School</div>
        <nav className={styles.nav}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </nav>
      </header>
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Master the Ice</h1>
          <p className={styles.heroSubtitle}>
            Track your skills, manage your classes, and prepare for the big show. 
            The all-in-one administration platform for our local skating community.
          </p>
          <div className={styles.actionGroup}>
            <Link href="/signup" className={styles.primaryAction}>Get Started Today</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
