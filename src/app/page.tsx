import RegisterGenerator from "@/components/register-generator";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Device Register Generator</h1>
      <RegisterGenerator />
    </main>
  );
}
