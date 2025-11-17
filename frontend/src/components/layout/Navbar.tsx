'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, FileText, User, Clock, LogOut, Stethoscope } from 'lucide-react';
import { useState } from 'react';

const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => (
  <Link 
    href={href} 
    className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground hover:bg-accent px-3 py-2 rounded-md"
  >
    {Icon && <Icon className="size-4" />}
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
          <NavLink href="/appointments" icon={Calendar}>Appointments</NavLink>
          <NavLink href="/records" icon={FileText}>Records</NavLink>
        </>
      );
    }
    if (userRole === 'DOCTOR') {
      return (
        <>
          <NavLink href="/appointments" icon={Calendar}>Appointments</NavLink>
          <NavLink href="/schedule" icon={Clock}>Schedule</NavLink>
        </>
      );
    }
    return (
      <>
        <NavLink href="/find-doctor" icon={Stethoscope}>Find Doctor</NavLink>
        <NavLink href="/book-appointment" icon={Calendar}>Book Appointment</NavLink>
      </>
    );
  };

  const UserProfile = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        </div>
      );
    }
    
    if (session) {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="hidden sm:flex items-center gap-2"
          >
            <Link href="/account">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{session.user?.name}</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="gap-2"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center">
        <Button asChild size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">HealthPlus</span>
          <span className="font-bold text-lg sm:hidden">HP</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {renderNavLinks()}
        </nav>

        {/* Desktop User Profile */}
        <div className="hidden md:flex items-center">
          <UserProfile />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-1">
              {renderNavLinks()}
            </nav>
            
            {/* Mobile User Profile */}
            <div className="pt-3 border-t">
              {session && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full mb-2 justify-start gap-2"
                >
                  <Link href="/account">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{session.user?.name}</span>
                  </Link>
                </Button>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};