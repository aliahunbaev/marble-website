import { DailyQuote } from "@/components/quote/DailyQuote";
import { PhoneFrame } from "@/components/primitives/PhoneFrame";
import { Wordmark } from "@/components/primitives/Wordmark";
import { FeatureSection } from "./FeatureSection";

/** Live app screen — the daily quote computed in-browser, app-style. */
function TrainScreenMock() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-paper p-5">
        <div className="flex items-center justify-between">
          <Wordmark className="text-[0.85rem]" />
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-taupe">
            Train
          </span>
        </div>
        <div className="mt-9 flex-1">
          <DailyQuote variant="frame" />
        </div>
        <div className="mt-auto flex h-11 w-full items-center justify-center border border-ink/15 bg-card text-[0.72rem] font-normal tracking-tight text-ink">
          Start Workout
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Abstract screenshot placeholder — suggests the screen without rebuilding it. */
function ScreenPlaceholder({
  label,
  caption,
  rows,
}: {
  label: string;
  caption: string;
  rows: React.ReactNode;
}) {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-paper p-5">
        <div className="flex items-center justify-between">
          <Wordmark className="text-[0.85rem]" />
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-taupe">
            {label}
          </span>
        </div>
        <div className="mt-7 flex-1">{rows}</div>
        <span className="mt-auto text-center font-mono text-[0.5rem] uppercase tracking-[0.16em] text-taupe/70">
          {caption}
        </span>
      </div>
    </PhoneFrame>
  );
}

function Bar({ w }: { w: string }) {
  return <div className={`h-2.5 ${w} bg-field`} />;
}

export function Features() {
  return (
    <>
      <FeatureSection
        layout="centered"
        title="A line a day."
        sub="Marble opens with philosophy, not a streak counter. Every day, one line — Stoics, Mishima, the classics."
        media={<TrainScreenMock />}
      />

      <FeatureSection
        layout="split"
        mediaSide="right"
        title="Log the work."
        sub="The mechanics serious lifters know — templates, live sets, your previous numbers shown as you go — rebuilt as something calm and crafted."
        media={
          <ScreenPlaceholder
            label="Workout"
            caption="Active workout — screen recording"
            rows={
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono text-[0.5rem] uppercase tracking-[0.16em] text-taupe">
                  <span>Set</span>
                  <span>Lbs</span>
                  <span>Reps</span>
                  <span>✓</span>
                </div>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b border-hairline pb-3"
                  >
                    <Bar w="w-4" />
                    <Bar w="w-10" />
                    <Bar w="w-8" />
                    <div className="ml-auto size-3 border border-ink/20" />
                  </div>
                ))}
              </div>
            }
          />
        }
      />

      <FeatureSection
        layout="split"
        mediaSide="left"
        title="A record worth keeping."
        sub="A finished session becomes a journal entry — a title, a progress photo, a note. Not a discarded log."
        media={
          <ScreenPlaceholder
            label="Record"
            caption="Saved entry — screenshot"
            rows={
              <div className="flex flex-col gap-3">
                <div className="aspect-[4/3] w-full bg-field" />
                <Bar w="w-2/3" />
                <Bar w="w-1/2" />
                <div className="mt-1 flex flex-col gap-2">
                  <div className="h-2 w-full bg-field" />
                  <div className="h-2 w-5/6 bg-field" />
                  <div className="h-2 w-4/6 bg-field" />
                </div>
              </div>
            }
          />
        }
      />
    </>
  );
}
