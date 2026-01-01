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

export default async function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  const user = session?.user as SessionUser;

  if (!session || user?.role !== 'DOCTOR') {
    redirect('/login');
  }

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

