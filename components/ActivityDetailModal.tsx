"use client";

import { getActivity } from "@/lib/activities";
import ActivityCard from "@/components/ActivityCard";
import Modal from "@/components/Modal";

export default function ActivityDetailModal({
  activityId,
  onClose,
}: {
  activityId: string;
  onClose: () => void;
}) {
  const activity = getActivity(activityId);
  if (!activity) return null;

  return (
    <Modal onClose={onClose} size="lg">
      <ActivityCard activity={activity} />
    </Modal>
  );
}
