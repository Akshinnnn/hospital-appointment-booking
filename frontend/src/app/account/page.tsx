import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { AccountForm } from '@/components/account/AccountForm';
import { DoctorAccountForm } from '@/components/doctor/DoctorAccountForm';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const role = user?.role;

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Account Details</h1>
          <p className="text-muted-foreground text-lg">
            View and manage your profile information
          </p>
        </header>
        
        {role === 'DOCTOR' ? <DoctorAccountForm /> : <AccountForm />}
      </div>
    </div>
  );
}

