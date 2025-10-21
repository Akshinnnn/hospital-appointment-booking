import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (user) {
    return (
      <section className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center">
        <div>
        <h1 className="text-4xl font-bold mb-4">Welcome, {user.name}!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          What would you like to do today?
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/book-appointment">Book a New Appointment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/appointments">View My Appointments</Link>
          </Button>
        </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center">
      <div>
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Your Health, Simplified.
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Easily book and manage your medical appointments online.
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/book-appointment">Book</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Login</Link>
        </Button>
      </div>
      </div>
    </section>
  );
}