"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./header.module.css";
import { getCookie, clearAuthSession } from "@/shared/auth/session";

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getCookie("username"));
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUsername(null);
    router.push("/");
  };

  if (!username) {
    return <header className={styles.header} />;
  }

  return (
    <header className={styles.header}>
      <div className={styles.userMenu}>
        <span className={styles.user}>{username}</span>
        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
