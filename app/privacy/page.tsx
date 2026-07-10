import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/primitives/Container";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "Privacy — Marble",
  description:
    "What Marble collects, how it's stored and used, and the controls you have.",
};

/** Emphasis inside body copy — ink against the taupe running text. */
function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-normal text-ink">{children}</strong>;
}

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: "The short version",
    body: (
      <p>
        Marble stores your training data so you can keep a record of your
        workouts and access it across your devices. Your data is yours. We do
        not sell it, share it with advertisers, or use it for advertising or
        tracking. You can delete it at any time.
      </p>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        <p>
          Marble requires an account, so your data is tied to your account and
          backed up so it isn&rsquo;t lost.
        </p>
        <ul className="mt-5 space-y-4">
          <li>
            <Strong>Account information.</Strong> When you sign in with Apple
            or with an email and password, we collect your email address and
            the name on your profile.
          </li>
          <li>
            <Strong>Training data.</Strong> The workouts, templates, exercises,
            sets, weights, reps, bodyweight entries, and notes you enter — the
            core content of the app.
          </li>
          <li>
            <Strong>Progress photos.</Strong> If you attach a photo to a
            workout or set a profile picture, that image is stored. The app
            requests camera and photo-library access only when you actively add
            a photo, and only the photos you choose are used.
          </li>
          <li>
            <Strong>Account identifier.</Strong> A unique ID for your account,
            used to keep your data associated with you and synced across your
            devices.
          </li>
        </ul>
        <p className="mt-5">
          We do <Strong>not</Strong> collect location, contacts, usage
          analytics, advertising identifiers, or diagnostic data, and Marble
          contains no advertising or tracking SDKs.
        </p>
      </>
    ),
  },
  {
    title: "How your data is stored",
    body: (
      <>
        <p>
          Your data is stored on your device and in our cloud backend so it can
          sync across your devices and be restored if you reinstall the app.
          The cloud backend is Google Firebase — Firebase Authentication for
          sign-in, Cloud Firestore for training data, and Firebase Storage for
          photos. Sign in with Apple is provided by Apple. Their handling of
          data is governed by Google&rsquo;s and Apple&rsquo;s respective
          privacy practices.
        </p>
        <p className="mt-5">
          Your data is stored under your account and is not accessible to other
          users.
        </p>
      </>
    ),
  },
  {
    title: "How your data is used",
    body: (
      <p>
        Your data is used solely to run the app: recording and displaying your
        training history, syncing across your devices, and restoring your
        record if you reinstall. We do not use your data for advertising,
        profiling, tracking across apps or websites, or any purpose unrelated
        to running the app, and we do not sell or rent it to anyone.
      </p>
    ),
  },
  {
    title: "Your choices and controls",
    body: (
      <ul className="space-y-4">
        <li>
          <Strong>Delete individual items.</Strong> Workouts, templates, and
          photos can be deleted within the app at any time.
        </li>
        <li>
          <Strong>Delete your account.</Strong> Settings includes a
          &ldquo;Delete account&rdquo; action that permanently deletes your
          account, profile, and the training data and photos stored in the
          cloud under your account.
        </li>
      </ul>
    ),
  },
  {
    title: "Children",
    body: (
      <p>
        Marble is not directed at children under 13 and does not knowingly
        collect information from them.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        If this policy changes, the updated version will be posted at this URL
        with a new effective date.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions about this policy or your data can be sent to{" "}
        <a
          href="mailto:alizahunbaev@gmail.com"
          className="font-normal text-ink underline underline-offset-[3px]"
        >
          alizahunbaev@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-paper pb-32 pt-40 text-ink">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>Privacy</Eyebrow>
            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[0.98] tracking-[-0.03em]">
              Privacy Policy
            </h1>
            <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe">
              Effective · July 9, 2026
            </p>
            <p className="mt-10 text-base font-light leading-relaxed text-taupe">
              Marble (&ldquo;the app,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us&rdquo;) is a personal training journal. This policy
              explains what the app collects, how it&rsquo;s used, and the
              choices you have. We&rsquo;ve kept it short and plain because the
              app collects little and does simple things with it.
            </p>
          </div>

          <ul className="mt-16 max-w-3xl sm:mt-20">
            {SECTIONS.map((s) => (
              <li
                key={s.title}
                className="grid grid-cols-1 gap-2 border-t border-hairline py-8 md:grid-cols-12 md:gap-8"
              >
                <div className="md:col-span-4">
                  <h2 className="text-xl font-light tracking-tight">
                    {s.title}
                  </h2>
                </div>
                <div className="text-base font-light leading-relaxed text-taupe md:col-span-7 md:col-start-6">
                  {s.body}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-16">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-taupe transition-colors hover:text-ink"
            >
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to Marble
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
