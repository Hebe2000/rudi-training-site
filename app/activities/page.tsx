import Link from "next/link";
import {
  CATEGORIES,
  FOOD_GUIDANCE,
  WEEK_PLAN,
  activitiesByCategory,
  getActivity,
} from "@/lib/activities";
import ActivityCard from "@/components/ActivityCard";
import ScrollToHash from "@/components/ScrollToHash";

const DAY_ORDER = [
  "day_1",
  "day_2",
  "day_3",
  "day_4",
  "day_5",
  "day_6",
  "day_7",
];

function dayLabel(key: string): string {
  return `Day ${key.replace("day_", "")}`;
}

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <ScrollToHash />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-ink-muted hover:text-clay hover:underline"
          >
            ← Back to week
          </Link>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
            Activity library
          </h1>
          <p className="font-serif text-sm text-ink-muted">
            35 exercises from the training guide, grouped by focus area.
          </p>
        </header>

        <section className="flex flex-col gap-3 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm">
          <h2 className="font-sans text-lg font-semibold text-ink">
            Week 1 focus
          </h2>
          <p className="font-serif text-sm text-ink-muted">
            Priorities: {WEEK_PLAN.priorities.join(", ")}
          </p>
          <ul className="list-disc space-y-1 pl-5 font-serif text-sm text-ink-muted">
            {WEEK_PLAN.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>

          <div className="mt-2 flex flex-col gap-2">
            {DAY_ORDER.map((day) => {
              const ids = WEEK_PLAN.suggested_week[day] ?? [];
              const note = WEEK_PLAN.suggested_week_notes[day];
              return (
                <div key={day} className="font-serif text-sm">
                  <span className="font-sans font-medium text-ink">
                    {dayLabel(day)}:
                  </span>{" "}
                  {ids.length > 0 ? (
                    <span className="text-ink-muted">
                      {ids
                        .map((id) => getActivity(id)?.name ?? id)
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="text-ink-muted">{note}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {CATEGORIES.map((cat) => {
          const activities = activitiesByCategory(cat.id);
          if (activities.length === 0) return null;
          return (
            <section key={cat.id} className="flex flex-col gap-3">
              <div>
                <h2 className="font-sans text-lg font-semibold text-ink">
                  {cat.name}
                </h2>
                {cat.note && (
                  <p className="font-serif text-sm text-ink-muted">
                    {cat.note}
                  </p>
                )}
                {cat.id === "food-games" && (
                  <p className="mt-1 font-serif text-sm text-ink-muted">
                    {FOOD_GUIDANCE.text}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {activities.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
