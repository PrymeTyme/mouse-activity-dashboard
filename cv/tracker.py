import os
import cv2
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client
from ultralytics import YOLO
from datetime import datetime, timedelta

# ==========================================
# 1. SETUP & KONFIGURATION
# ==========================================
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Fehler: SUPABASE_URL oder SUPABASE_KEY fehlt in der .env-Datei!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


VIDEO_PATH = "test2.mp4" 

OUTPUT_VIDEO = f"tracked_{os.path.basename(VIDEO_PATH)}"
HEATMAP_IMAGE = f"heatmap_{os.path.splitext(os.path.basename(VIDEO_PATH))[0]}.jpg"
MODEL_WEIGHTS = "rodent_best.pt"

CONFIDENCE_THRESHOLD = 0.25
INFERENCE_IMG_SIZE = 640
TRAIL_LENGTH = 30
MIN_FRAMES_THRESHOLD = 5

# ==========================================
# 2. VIDEOSPEZIFISCHE ZONEN-KONFIGURATION
# ==========================================
VIDEO_CONFIGS = {
    "test1.mp4": {
        "hole": {
            "polygon": np.array([[1480, 480], [1620, 480], [1620, 680], [1480, 650]], np.int32),
            "color": (255, 100, 0),  # Blau/Türkis
            "label": "Mauseloch"
        }
    },
    "test2.mp4": {
        "hole": {
            "polygon": np.array([[1430, 530], [1470, 600], [1400, 760], [1380, 680]], np.int32),
            "color": (255, 100, 0),
            "label": "Mauseloch"
        },
        "bait_a": {
            "polygon": np.array([[300, 400], [450, 400], [450, 460], [300, 500]], np.int32),
            "color": (0, 0, 255),    # Rot
            "label": "Koeder A"
        },
        "bait_b": {
            "polygon": np.array([[1170, 300], [1270, 300], [1270, 380], [1170, 390]], np.int32),
            "color": (0, 165, 255),  # Orange
            "label": "Koeder B"
        }
    }
}

video_name = os.path.basename(VIDEO_PATH)
CURRENT_ZONES = VIDEO_CONFIGS.get(video_name, {})

def is_point_in_zone(point, polygon):
    return cv2.pointPolygonTest(polygon, (float(point[0]), float(point[1])), False) >= 0

# ==========================================
# 3. VIDEO & TRACKING INITIALISIERUNG
# ==========================================
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise FileNotFoundError(f"Video {VIDEO_PATH} konnte nicht geoeffnet werden.")

fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

out = cv2.VideoWriter(OUTPUT_VIDEO, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))
model = YOLO(MODEL_WEIGHTS).to("cuda")

heatmap_accumulator = np.zeros((height, width), dtype=np.float32)
tracking_data = {}
first_frame = None
frame_idx = 0

print(f"Starte Tracking fuer {video_name} mit {len(CURRENT_ZONES)} aktiven Zonen...")

# ==========================================
# 4. HAUPT-VERARBEITUNGSSCHLEIFE
# ==========================================
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_idx += 1
    if first_frame is None:
        first_frame = frame.copy()

    # Zonen auf dem Frame visualisieren
    overlay = frame.copy()
    for z_key, z_info in CURRENT_ZONES.items():
        cv2.polylines(overlay, [z_info["polygon"]], isClosed=True, color=z_info["color"], thickness=2)
        cv2.putText(overlay, z_info["label"], 
                    (z_info["polygon"][0][0], max(20, z_info["polygon"][0][1] - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, z_info["color"], 2)
    cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)

    results = model.track(
        frame,
        persist=True,
        verbose=False,
        tracker="custom_tracker.yaml" if os.path.exists("custom_tracker.yaml") else "bytetrack.yaml",
        conf=CONFIDENCE_THRESHOLD,
        imgsz=INFERENCE_IMG_SIZE
    )

    boxes_data = results[0].boxes
    if boxes_data is not None and len(boxes_data) > 0:
        boxes = boxes_data.xyxy.int().cpu().tolist()
        class_ids = boxes_data.cls.int().cpu().tolist()
        confidences = boxes_data.conf.cpu().tolist()
        raw_ids = boxes_data.id.int().cpu().tolist() if boxes_data.id is not None else [-1] * len(boxes)

        for box, class_id, track_id, conf in zip(boxes, class_ids, raw_ids, confidences):
            x1, y1, x2, y2 = box
            cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)

            cx_clamped = max(0, min(width - 1, cx))
            cy_clamped = max(0, min(height - 1, cy))
            cv2.circle(heatmap_accumulator, (cx_clamped, cy_clamped), 18, 1.0, -1)

            current_zone_label = None

            if track_id != -1:
                if track_id not in tracking_data:
                    tracking_data[track_id] = {
                        "path": [],
                        "first_frame": frame_idx,
                        "last_frame": frame_idx,
                        "zone_frames": {z_key: 0 for z_key in CURRENT_ZONES}
                    }

                tracking_data[track_id]["path"].append((cx, cy))
                tracking_data[track_id]["last_frame"] = frame_idx

                # Zonen-Pruefung
                for z_key, z_info in CURRENT_ZONES.items():
                    if is_point_in_zone((cx, cy), z_info["polygon"]):
                        tracking_data[track_id]["zone_frames"][z_key] += 1
                        current_zone_label = z_info["label"]

            # Bounding Box & Label
            zone_text = f" [{current_zone_label}]" if current_zone_label else ""
            label = f"Maus #{track_id}{zone_text} ({conf:.2f})"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, max(18, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Pfad-Trail
            if track_id in tracking_data:
                trail = tracking_data[track_id]["path"][-TRAIL_LENGTH:]
                for i in range(1, len(trail)):
                    cv2.line(frame, trail[i - 1], trail[i], (0, 255, 0), 2)

    out.write(frame)

cap.release()
out.release()
print(f"Tracking beendet. Video gespeichert unter: {OUTPUT_VIDEO}")

# ==========================================
# 5. FINALE HEATMAP GENERIEREN
# ==========================================
if np.max(heatmap_accumulator) > 0:
    heatmap_blurred = cv2.GaussianBlur(heatmap_accumulator, (65, 65), 0)
    heatmap_norm = (heatmap_blurred / np.max(heatmap_blurred) * 255).astype(np.uint8)
    heatmap_color = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_JET)

    mask = (heatmap_norm > 10).astype(np.uint8)
    mask_3ch = cv2.merge([mask, mask, mask])

    base_frame = first_frame if first_frame is not None else np.zeros((height, width, 3), dtype=np.uint8)
    overlay = cv2.addWeighted(base_frame, 0.6, heatmap_color, 0.4, 0)
    final_heatmap = np.where(mask_3ch == 1, overlay, base_frame)

    # Zonen in Heatmap einzeichnen
    for z_key, z_info in CURRENT_ZONES.items():
        cv2.polylines(final_heatmap, [z_info["polygon"]], True, z_info["color"], 2)
        cv2.putText(final_heatmap, z_info["label"], 
                    (z_info["polygon"][0][0], max(20, z_info["polygon"][0][1] - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, z_info["color"], 2)

    cv2.imwrite(HEATMAP_IMAGE, final_heatmap)
    print(f"Heatmap gespeichert: {HEATMAP_IMAGE}")

# ==========================================
# 6. SUPABASE-UPLOAD (MIT ECHTEN ZEITSTEMPELN)
# ==========================================
payloads = []


video_length_sec = frame_idx / fps
video_start_time = datetime.now() - timedelta(seconds=video_length_sec)

for track_id, data in tracking_data.items():
    if len(data["path"]) < MIN_FRAMES_THRESHOLD:
        continue

    duration_frames = data["last_frame"] - data["first_frame"] + 1
    total_time = round(duration_frames / fps, 2)
    
    # Berechne Sekunden fuer vorhandene Zonen
    time_hole = round(data["zone_frames"].get("hole", 0) / fps, 2)
    time_bait_a = round(data["zone_frames"].get("bait_a", 0) / fps, 2)
    time_bait_b = round(data["zone_frames"].get("bait_b", 0) / fps, 2)
    total_bait_time = round(time_bait_a + time_bait_b, 2)

    # Berechne die exakte Uhrzeit, wann das Tier im Video aufgetaucht ist
    seconds_into_video = data["first_frame"] / fps
    event_time = video_start_time + timedelta(seconds=seconds_into_video)

    payload = {
        "video_name": video_name,
        "total_time_in_frame": total_time,
        "time_at_hole": time_hole,
        "time_at_bait": total_bait_time,
        "time_at_bait_a": time_bait_a,
        "time_at_bait_b": time_bait_b,
        "interacted_with_bait": total_bait_time > 0.0,
        "movement_path": data["path"],
      
        "created_at": event_time.isoformat()
    }
    payloads.append(payload)
    print(f"ID #{track_id}: Gesamt {total_time}s | Loch {time_hole}s | Köder {total_bait_time}s (A: {time_bait_a}s, B: {time_bait_b}s)")

if payloads:
    try:
        supabase.table("pest_tracking_events").insert(payloads).execute()
        print(f"Erfolgreich {len(payloads)} Event(s) nach Supabase synchronisiert.")
    except Exception as e:
        print(f"Fehler beim Supabase-Upload: {e}")