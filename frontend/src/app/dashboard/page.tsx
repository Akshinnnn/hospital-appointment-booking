import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { DoctorDashboardPage } from '@/components/doctor/dashboard/DoctorDashboardPage';
import { PatientDashboardPage } from '@/components/patient/dashboard/PatientDashboardPage';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const role = user?.role;

  if (role === 'DOCTOR') {
    return <DoctorDashboardPage />;
  }

  if (role === 'PATIENT') {
    return <PatientDashboardPage />;
  }

  // For other roles, redirect to home
  redirect('/');
}

