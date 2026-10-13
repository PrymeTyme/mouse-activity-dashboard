export type TrackingEvent = {
  id: string;
  video_name: string;
  total_time_in_frame: number;
  time_at_hole: number;
  time_at_bait: number;
  time_at_bait_a: number;
  time_at_bait_b: number;
  interacted_with_bait: boolean;
  created_at: string;
};
