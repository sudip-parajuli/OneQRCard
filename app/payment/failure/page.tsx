import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment didn&apos;t go through</h1>
      <p className="text-stone-500 mb-6">
        No amount was charged. You can try again, or reach out to us on
        WhatsApp if you keep running into issues.
      </p>
      <Link
        href="/create"
        className="inline-block bg-stone-900 text-white px-6 py-3 rounded-xl font-medium"
      >
        Try again
      </Link>
    </main>
  );
}
