# Plan: Calibration Profile Display & Flow Cleanup

## Context

After calibration, the user sees a "Calibration Complete" intermediate page with an ugly checkmark before reaching the actual results. The user wants to:
1. Skip the "complete" phase — go directly to results after the quality check
2. Show the calibration profile on the home screen if already calibrated
3. Future: localStorage persistence → account sync

## Changes

### Step 1: Remove "complete" phase from calibration page
- `src/routes/calibration/+page.svelte` — in `confirmCheck()`, after saving profile, navigate directly to `/results?mode=calibration` instead of setting `cs.phase = "complete"`
- Remove the "complete" phase template block from the page

### Step 2: Show profile badge on home screen
- `src/routes/+page.svelte` — read calibration profile from sessionStorage using `loadProfile()`, show quality badge + contrast range if profile exists, with a "Recalibrate" button

### Step 3: Future directions (doc only)
- Note in plan that localStorage and account sync are future work

## Validation
- `bun run check && bun run test && bun run build`
- Manual: run calibration → results page appears directly (no intermediate "complete" screen)
- Manual: go to home screen → profile badge visible if calibrated
