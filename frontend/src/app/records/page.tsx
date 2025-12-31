import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { RecordList } from '@/components/records/RecordList';
import { MedicalRecordList } from '@/components/doctor/records/MedicalRecordList';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default async function RecordsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const role = user?.role;

  if (role === 'DOCTOR') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Upload and manage medical records for your patients.
          </p>
        </div>
        <MedicalRecordList />
      </div>
    );
  }

  // Patient view
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground text-lg">
            View your medical history and notes from your doctors
          </p>
        </header>
        <RecordList />
      </div>
    </div>
  );
}

