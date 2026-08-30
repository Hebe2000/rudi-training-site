import { Activity } from "@/lib/activities";

const STATUS_STYLE: Record<Activity["content_status"], string> = {
  complete: "bg-sage/10 text-sage-strong",
  placeholder: "bg-clay/10 text-clay-strong",
  external: "bg-sky/10 text-sky-strong",
};

const STATUS_LABEL: Record<Activity["content_status"], string> = {
  complete: "Method written",
  placeholder: "Needs method",
  external: "See linked guide",
};

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div
      id={activity.id}
      className="scroll-mt-20 rounded-2xl border border-mist bg-canvas-card p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold text-ink">
          {activity.number}. {activity.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_STYLE[activity.content_status]
          }`}
        >
          {STATUS_LABEL[activity.content_status]}
        </span>
      </div>

      <p className="mt-1 font-serif text-sm text-ink-muted">
        {activity.summary}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mid">
        {activity.cue_example && <span>Cue: "{activity.cue_example}"</span>}
        {activity.duration_mins && (
          <span>
            Time: {activity.duration_mins[0]}–{activity.duration_mins[1]} min
          </span>
        )}
        {activity.equipment.length > 0 && (
          <span>Kit: {activity.equipment.join(", ")}</span>
        )}
        {activity.requires_helper && <span>Needs a helper</span>}
        {activity.has_video && <span>Video available</span>}
      </div>

      {activity.steps.length > 0 && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 font-serif text-sm text-ink">
          {activity.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {activity.tips.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 font-serif text-sm text-ink-muted">
          {activity.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}

      {activity.placeholder_note && (
        <p className="mt-3 rounded-lg bg-clay/10 px-3 py-2 font-serif text-sm text-clay-strong">
          {activity.placeholder_note}
        </p>
      )}

      {activity.reference_url && (
        <a
          href={activity.reference_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-clay underline hover:text-clay-strong"
        >
          Reference material →
        </a>
      )}
    </div>
  );
}
