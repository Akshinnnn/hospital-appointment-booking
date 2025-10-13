import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Welcome to Our Hospital
          </CardTitle>
          <CardDescription className="pt-2">
            Your health is our priority. Easily book and manage your medical
            appointments online.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/find-doctor">Book an Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Patient & Doctor Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}