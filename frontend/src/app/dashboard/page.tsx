import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus, Clock, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-400">Ready for your next mock interview?</p>
        </div>
        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          New Interview
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-fuchsia-500/20 rounded-xl">
              <Trophy className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Average Score</p>
              <h2 className="text-2xl font-bold text-white">--/100</h2>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Interviews Completed</p>
              <h2 className="text-2xl font-bold text-white">0</h2>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Communication Skill</p>
              <h2 className="text-2xl font-bold text-white">--</h2>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Recent Interviews</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No interviews yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You haven't completed any mock interviews yet. Start one now to get personalized feedback and scoring!
          </p>
          <Link
            href="/interview/setup"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Start First Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
