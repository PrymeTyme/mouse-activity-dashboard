# Smart Pest Tracking Dashboard (Proof of Concept)

Ein interaktives Web-Dashboard zur Visualisierung und Auswertung von KI-gestuetztem Schaedlings- und Verhaltens-Tracking. Dieses Projekt dient als Proof of Concept (PoC) fuer eine vollstaendige End-to-End-Pipeline von der OpenCV-Videoanalyse bis zum cloudbasierten Reporting.

**Live Demo:** [mouse-activity-dashboard.vercel.app](https://mouse-activity-dashboard.vercel.app/)  
**Computer-Vision Pipeline:** Liegt direkt im Repository unter [`cv/tracker.py`](./cv/tracker.py)

---

## Konzept & Architektur

Das System automatisiert die Erkennung, Zonenauswertung und Praeferenzanalyse:

```text
[Kamera / Videomaterial]
       |
[cv/tracker.py (OpenCV)] -> Erkennt Bewegung, Zonenaufenthalt & Koederkontakt
       |
       |--> 1. Schreibt Events & Metriken in Supabase Database (PostgreSQL)
       |--> 2. Generiert & laedt Heatmap + Video in Supabase Storage
                                       |
                         [React Dashboard auf Vercel]
```

---

## Dashboard-Features

- **KPI-Uebersicht:** Gesamtsichtungen, durchschnittliche Verweildauer, Koeder-Interaktionsrate und automatisch errechnete Peak-Aktivitaetszeit.
- **Zonen- & Praeferenzanalyse:**
  - Aufenthaltsdauer nach Zonen (_Mauseloch vs. Koederzone_) als Balkendiagramm.
  - A/B-Test-Praeferenz (_Koeder A vs. Koeder B_) als Donut-Chart.
- **Synchrone Medienansicht:** Parallele Anzeige des analysierten Videoclips und der generierten Aktivitaets-Heatmap.
- **Ereignis-Protokoll:** Filterbare Historie aller Einzelsichtungen mit Verweildauer und Interaktionsstatus (mit kompakter Card-Ansicht fuer mobile Endgeraete).

---

## Projektstruktur

```text
.
|-- cv/
|   |-- tracker.py          # OpenCV Videoanalyse, Zonen-Kollision & Supabase-Sync
|   `-- requirements.txt    # Python-Abhaengigkeiten (opencv-python, supabase, etc.)
|-- src/                    # React Frontend (Dashboard, Charts, MediaViewer)
|-- public/                 # Statische Assets
`-- README.md
```

---

## Verwendete Technologien

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Visualisierung:** Recharts, Lucide React
- **Backend & Storage:** Supabase (PostgreSQL & Object Storage)
- **Hosting:** Vercel
- **Computer Vision:** Python, OpenCV, NumPy

---

## Lizenz

Dieses Projekt ist als Proof of Concept unter der [MIT License](LICENSE) veroeffentlicht.
