'use client';

import Link from 'next/link';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  Shield,
  HelpCircle,
  FileCheck,
  Clock
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors shadow-sm">
                <Stethoscope className="size-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">HealthPlus</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your trusted partner in healthcare. Book appointments, manage records, and access quality medical care with ease.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center size-9 rounded-md bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-accent transition-all duration-200"
                  >
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Quick Links
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="/find-doctor" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group w-fit"
              >
                <User className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Find Doctor</span>
              </Link>
              <Link 
                href="/book-appointment" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group w-fit"
              >
                <Calendar className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Book Appointment</span>
              </Link>
              <Link 
                href="/appointments" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group w-fit"
              >
                <Calendar className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>My Appointments</span>
              </Link>
              <Link 
                href="/records" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group w-fit"
              >
                <FileText className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Medical Records</span>
              </Link>
            </nav>
          </div>

          {/* Support & Resources */}
          <div className="space-y-5">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              Support
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="/account" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
              >
                My Account
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
              >
                Help Center
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 w-fit group"
              >
                <Shield className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Privacy Policy</span>
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 w-fit group"
              >
                <FileCheck className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Terms of Service</span>
              </Link>
            </nav>
          </div>

          {/* Contact Information */}
          <div className="space-y-5">
            <h3 className="font-semibold text-base text-foreground">Contact Us</h3>
            <div className="flex flex-col gap-4 text-sm">
              <a 
                href="mailto:info@healthplus.com"
                className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="size-5 text-primary/70 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                <span className="leading-relaxed">info@healthplus.com</span>
              </a>
              <a 
                href="tel:+15551234567"
                className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone className="size-5 text-primary/70 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                <span className="leading-relaxed">+1 (555) 123-4567</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="size-5 text-primary/70 mt-0.5 shrink-0" />
                <address className="not-italic leading-relaxed">
                  123 Medical Center Drive<br />
                  Healthcare City, HC 12345<br />
                  United States
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                © {currentYear} HealthPlus. All rights reserved.
              </p>
              <span className="hidden md:inline">•</span>
              <p className="flex items-center gap-1.5">
                Made with <Heart className="size-3.5 text-primary fill-primary" /> for better healthcare
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
