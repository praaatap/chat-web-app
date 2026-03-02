"use client";

import Link from "next/link";
import { SignInButton, UserButton, useClerk } from "@clerk/nextjs";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MainHeader } from "./components/MainHeader";
import { AuthForm } from "./components/auth/AuthForm";

export default function Home() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="grid flex-1 grid-cols-1 bg-zinc-100 lg:grid-cols-2 min-h-0">
        <section className="relative hidden overflow-hidden bg-indigo-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[72px_72px]" />
          <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              💬
            </span>
            Tars Social
          </div>
          <div className="relative z-10 max-w-xl space-y-6">
            <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-white">
              Connect instantly. <br />Collaborate effortlessly.
            </h1>
            <p className="max-w-lg text-2xl text-white/90 leading-relaxed">
              A premium real-time messaging experience designed for high-performance teams.
            </p>
            <div className="inline-flex items-center gap-4 rounded-full bg-white/10 px-5 py-3 backdrop-blur-sm border border-white/5 shadow-inner">
              <div className="flex -space-x-2">
                <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop" alt="User 1" className="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover" width={32} height={32} />
                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop" alt="User 2" className="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover" width={32} height={32} />
                <Image src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop" alt="User 3" className="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover" width={32} height={32} />
              </div>
              <div className="text-left">
                <p className="text-xs text-yellow-300 font-bold tracking-widest">★★★★★</p>
                <p className="text-sm text-white/90 font-medium">Trusted by modern teams</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex gap-6 text-sm text-white/80">
            <span>© 2026 Tars Inc.</span>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/code-of-conduct" className="hover:text-white">
              Code of Conduct
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <AuthLoading>
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
                <p className="mt-4 text-sm text-zinc-500">Loading...</p>
              </div>
            </AuthLoading>

            <Unauthenticated>
              <div className="bg-white rounded-4xl p-10 shadow-2xl shadow-indigo-100/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <AuthForm />
              </div>
            </Unauthenticated>

            <Authenticated>
              <div className="bg-white rounded-4xl p-10 shadow-2xl shadow-indigo-100/50 border border-zinc-100 animate-in fade-in zoom-in-95 duration-500 text-center space-y-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center ring-8 ring-indigo-50/50 shadow-inner">
                      <span className="text-4xl animate-bounce duration-2000">👋</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none uppercase">Welcome back!</h2>
                    <p className="text-zinc-500 font-medium text-sm">Manage your account or jump into chat.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/chat"
                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-5 text-lg font-black text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[250%_250%] animate-[shimmer_3s_infinite]" />
                    <span className="relative z-10 flex items-center gap-3">
                      Open Messenger
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-red-500 hover:border-red-100 active:scale-[0.98]"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-50">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Account Profile</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </Authenticated>
          </div>
        </section>
      </main>
    </div>
  );
}
