// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className=" border flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Let's Fix your Dementia
        </h1>
        <p className="text-xl text-gray-600">
          Help you remember the things worth remembering
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
