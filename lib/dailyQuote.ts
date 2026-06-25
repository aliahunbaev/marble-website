/**
 * The app's exact daily-quote system: a fixed list of 16, selected by
 * ordinal-day-of-year mod 16 — deterministic, no server, rotates once a day.
 *
 * Parity note: the iOS app uses Calendar.ordinality(of:.day, in:.year), which
 * is 1-BASED (Jan 1 = 1). We replicate that 1-based value so the website shows
 * the SAME line as the phone on any given day. Verbatim from TrainView.swift.
 */
export const QUOTES: readonly string[] = [
  "It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable.",
  "Man cannot remake himself without suffering, for he is both the marble and the sculptor.",
  "The world breaks everyone, and afterward, many are strong at the broken places.",
  "Courage is grace under pressure.",
  "Muscles have gradually become something akin to classical Greek. To revive the dead language, the discipline of the steel was required.",
  "My humanity is a constant self-overcoming.",
  "You have passed through life without an opponent — no one can ever know what you are capable of, not even you.",
  "The purpose of life is to be defeated by greater and greater things.",
  "Do not pray for an easy life, pray for the strength to endure a difficult one.",
  "The impediment to action advances action. What stands in the way becomes the way.",
  "Difficulties strengthen the mind, as labor does the body.",
  "Character is destiny.",
  "No man is free who is not master of himself.",
  "Become who you are.",
  "You have power over your mind — not outside events. Realize this, and you will find strength.",
  "Perfect purity is possible if you turn your life into a line of poetry written with a splash of blood.",
];

/** 1-based ordinal day of the LOCAL year (Jan 1 = 1) — mirrors the app. */
export function ordinalDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function quoteForDate(d: Date): string {
  return QUOTES[ordinalDayOfYear(d) % QUOTES.length];
}

/** Uppercase inscription date, absolute — e.g. "MONDAY · MAY 12". */
export function inscriptionDate(d: Date): string {
  const weekday = d
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  return `${weekday} · ${month} ${d.getDate()}`;
}
