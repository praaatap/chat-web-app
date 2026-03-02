import Link from "next/link";

export default function CodeOfConductPage() {
  return (
    <main className="min-h-full bg-zinc-100 dark:bg-zinc-950 px-6 py-10">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-100/40 dark:shadow-indigo-950/20">
          <div className="bg-indigo-600 px-8 py-10 text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Code of Conduct</h1>
            <p className="mt-3 max-w-2xl text-indigo-100 text-sm md:text-base">
              Our standards for respectful, safe, and inclusive communication in Tars Connect.
            </p>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Community</p>
              <Link
                href="/"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Back to Home
              </Link>
            </div>

            <div className="space-y-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. Be Respectful</h2>
                <p>
                  Communicate with empathy and professionalism. Harassment, discrimination,
                  hate speech, and personal attacks are not allowed.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. Keep It Safe</h2>
                <p>
                  Do not share harmful, abusive, or illegal content. Avoid posting sensitive
                  personal information that could put others at risk.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Respect Privacy</h2>
                <p>
                  Only share data and media you have permission to share. Respect direct
                  messages, group boundaries, and confidentiality expectations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. No Spam or Abuse</h2>
                <p>
                  Do not send unsolicited bulk messages, scams, phishing links, or repeated
                  unwanted invites. Misuse of automation is prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Enforcement</h2>
                <p>
                  Violations may result in warnings, content removal, feature restrictions,
                  or account suspension depending on severity and repetition.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Report Concerns</h2>
                <p>
                  If you experience or witness misconduct, contact: conduct@tarssocial.com.
                  Include relevant context so we can review quickly.
                </p>
              </section>

              <p className="pt-4 text-xs text-zinc-500 dark:text-zinc-400">Last updated: March 2, 2026</p>
            </div>
          </div>
        </div>
      </main>
  );
}
