import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { DoctorDashboardSidebar } from '@/components/doctor/DoctorDashboardSidebar';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default async function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const role = user?.role;

  // If doctor, render with sidebar; otherwise render plain
  if (role === 'DOCTOR') {
    return (
      <div className="flex min-h-screen bg-background">
        <DoctorDashboardSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // For patients and other roles, render without sidebar
  return <>{children}</>;
}

