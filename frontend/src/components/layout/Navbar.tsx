'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </Link>
);

export const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = (session?.user as any)?.role;

  const renderNavLinks = () => {
    if (userRole === 'PATIENT') {
      return (
        <>
          <NavLink href="/appointments">My Appointments</NavLink>
          <NavLink href="/records">My Records</NavLink>
          <NavLink href="/account">My Account</NavLink>
        </>
      );
    }
    if (userRole === 'DOCTOR') {
      return (
        <>
          <NavLink href="/appointments">Appointments</NavLink>
          <NavLink href="/schedule">My Schedule</NavLink>
          <NavLink href="/account">My Account</NavLink>
        </>
      );
    }
    return (
      <>
        <NavLink href="/find-doctor">Doctors</NavLink>
        <NavLink href="/book-appointment">Appointment</NavLink>
      </>
    );
  };

  const UserProfile = () => {
    if (status === 'loading') {
      return <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />; // Skeleton loader
    }
    if (session) {
      return (
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm font-medium">
            Welcome, {session.user?.name}
          </span>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
            Logout
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 font-bold text-lg">
            HealthPlus
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Right side of Navbar for Desktop */}
        <div className="hidden flex-1 items-center justify-end md:flex">
          <UserProfile />
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden container py-4 border-t">
          <nav className="flex flex-col gap-4">
            {renderNavLinks()}
          </nav>
          <div className="mt-4 pt-4 border-t">
             <UserProfile />
          </div>
        </div>
      )}
    </header>
  );
};