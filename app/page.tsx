import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <p>Home</p>
      <Link href="/register">Register</Link>
    </main>
  );
}
