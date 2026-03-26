# Project Carousel Asset Structure

Each project has its own folder in this directory.

## Naming convention

- Use ordered filenames so carousel order is obvious:
  - `01-...`
  - `02-...`
  - `03-...`
- Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`

## Current mapping

- `nsight-surgical/`
- `berfs-club/`
- `cca-fashion-experience/`
- `nsight-surgical-landing-page/`
- `queer-aesthetics/`
- `ucla-open-studios/`
- `laster-sans/`
- `ucla-new-wight-biennial/`
- `personal-experimentation/`
- `gtfo/`
- `gyst/`

## How to update a carousel

1. Drop new images into the right project folder using `01-`, `02-`, `03-` order.
2. Update that project's `<figure>` image `src` entries in `index.html`.
3. Update `figcaption` text for each slide in `index.html`.

Tip: if you keep one image only, keep just the `01-...` file and one `<figure>`.
