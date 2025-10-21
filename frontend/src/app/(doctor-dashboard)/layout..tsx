import Link from "next/link";
import React from "react";

export default function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-100 p-4">
                <h2 className="text-lg font-bold mb-4">Doctor Menu</h2>
                <nav className="flex flex-col space-y-2">
                    <Link href={"/schedule"} className="hover:underline">My Schedule</Link>
                    <Link href={"/appointments"} className="hover:underline">Appointments</Link>
                </nav>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    )
}