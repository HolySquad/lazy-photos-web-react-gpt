"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./header.module.css";

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  return (
    <header className={styles.header}>
      {username ? (
        <span className={styles.user}>{username}</span>
      ) : (
        <nav className={styles.nav}>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
          <Link href="/register" className={styles.register}>
            Register
          </Link>
        </nav>
      )}
    </header>
  );
}
