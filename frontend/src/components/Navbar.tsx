import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              InterviewAce AI
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {!userId ? (
              <div className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
                <SignInButton mode="modal" />
              </div>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
