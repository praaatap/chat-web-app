import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-full bg-zinc-100 dark:bg-zinc-950 px-6 py-10">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-100/40 dark:shadow-indigo-950/20">
          <div className="bg-indigo-600 px-8 py-10 text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Privacy Policy</h1>
            <p className="mt-3 max-w-2xl text-indigo-100 text-sm md:text-base">
              How Tars Connect collects, uses, and protects your data while you use messaging features.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Legal</p>
              <Link
                href="/"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Back to Home
              </Link>
            </div>

            <div className="space-y-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. Information We Collect</h2>
                <p>
                  We collect account details you provide during sign-up, such as name,
                  email address, and profile information. We also collect usage data needed
                  to operate and improve messaging features.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. How We Use Information</h2>
                <p>
                  Your information is used to authenticate users, deliver messages,
                  maintain security, and improve product experience. We do not sell personal
                  information.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Data Sharing</h2>
                <p>
                  We may share data with trusted service providers required to operate the
                  platform, such as authentication, hosting, and analytics providers.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Data Retention</h2>
                <p>
                  We retain account and messaging data for as long as your account is active,
                  unless a longer retention period is required by law.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Your Rights</h2>
                <p>
                  You may request access, correction, or deletion of your data by contacting
                  us. You may also close your account at any time.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Contact</h2>
                <p>
                  For privacy-related questions, contact: privacy@tarssocial.com
                </p>
              </section>

              <p className="pt-4 text-xs text-zinc-500 dark:text-zinc-400">Last updated: March 2, 2026</p>
            </div>
          </div>
        </div>
      </main>
  );
}