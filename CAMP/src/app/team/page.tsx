import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your team members
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <a
            href="/team/invite"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Invite Member
          </a>
        </div>
      </div>

      {/* Team members list will go here */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No team members found. Invite your first team member to get started.</p>
        </div>
      </div>
    </div>
  );
} 