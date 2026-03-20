export default async function TermsPage() {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const res = await fetch(`${baseUrl}/api/legal`, {
    cache: "no-store",
  });

  const legal = await res.json();

  return (
    <main className="container" style={{ maxWidth: 900 }}>
      <h1>Terms & Conditions</h1>
      <div dangerouslySetInnerHTML={{ __html: legal.terms }} />
    </main>
  );
}