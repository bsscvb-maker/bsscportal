# Self-paced editorial update — November 22, 2026

Todd authorized converting the complete Foundations training for independent use by every new member/prospect, keeping all substantive club material, all 89 slides, Arlo narration, seven sections, five questions each, 80% passing, required rewatch after failure, final attestation, and certificate.

## Completed

- Rewrote 40 narration passages; removed live audience assumptions, classroom housekeeping, timed breaks, spoken-response requests, presenter cues, and artificial live Q&A.
- Replaced narrator-as-President language with named leadership roles so the narrator does not imply that Arlo is the serving President. Historical 2026 references are identified as historical examples.
- Preserved every slide image and substantive policy topic. Recap slides replace live question periods; pauses are optional; completion instructions describe the quizzes, attestation, and printable certificate.
- Updated the original source PowerPoint in place on Drive, preserving its file ID and version history: https://docs.google.com/presentation/d/1dwKWk4-B6jaQUJOchZU-w-DQmcYFQYLy/edit
- Rendered and visually inspected all 89 slides. Read back the updated Drive source: 89 slide pages; no old room references, 15-minute breaks, Live walkthrough, or presenter production cues.
- Prepared `course-revised.json`, section narration scripts, and a complete narration master. These remain production inputs, not a claim that the live videos have changed.

## Audio and release boundary

Generate each section in Google AI Studio, gemini-3.8-flash-tts, single speaker Arlo (Confident and clear, Deep pitch), no paid API key selected. Download each finished WAV. The local browser saves downloads on Todd's computer; the browser download-event/path transfer did not complete. Do not fetch hidden app state, tokens, or browser internals. Chrome-internal download navigation was blocked by browser security policy and must not be worked around. Ask Todd for a single batch attachment of the seven exported WAVs when generation is finished.

Until the WAVs are available in the processing workspace, do not replace live MP4s or the live timestamped transcript with these drafts. After obtaining audio, independently transcribe/validate it, align all 89 slide boundaries, render and validate seven MP4s, update exact durations/timestamps/posters, rebuild the player and Apps Script service together, replace Classroom's existing Drive video IDs, publish versioned GitHub media/assets and matching transcript, and verify playback and quiz/attestation gates. Preserve recorded grades, immutable attempts, and membership status. Do not claim enrollment/reminder automation is active: it is still awaiting verified real password login and installed clock trigger from the prior rollout.

## Delivery references and checks

- Native editable master: https://docs.google.com/presentation/d/1O3suyMD3Q19whyp-8ivk7VVbomSE4ldSg0OpwIoVgLA/edit
- PDF review copy: https://drive.google.com/file/d/1GVRDcHQCngcn42tcoj4ZUzPM9cRImvaX/view
- Narration master: https://drive.google.com/file/d/1rWkXZm2kf26a-pkvBWu0pOVlTat99u9z/view
- Native Google Slides structural readback: 89 slides, matching outline and revised text. Native output issue checker reported zero issues. Rendered all 89 native slides via the standard export helper with a file-reference materialization adapter; inspected all five contact sheets. Original PPTX and native deck retain the artwork and editable text.
- `build_recorded_course.py` is a candidate-release builder prepared for the incoming audio. It performs independent speech recognition and coverage checks, aligns every slide, writes seven MP4s, and produces matching course metadata/transcript. It was syntax-checked only; no new videos have been built because the WAV transfer is pending.

## Audio generation completed — November 22, 2026

All seven revised scripts were submitted in the same Arlo voice session, and each finished with Download enabled. Download was clicked for each section. UI-displayed durations: 1 9:19, 2 7:19, 3 10:20, 4 11:28, 5 3:26, 6 6:50, 7 10:15. These are approximate UI readings, not measured final WAV/video durations. Script digests are in audio-production.json. No paid API key was selected. The first Download may have been initiated twice during transfer troubleshooting; deduplicate any identical attachments by SHA-256 rather than assuming eight different sections.

User handoff: attach today's newly generated `Generated Audio` WAV exports from the computer's Downloads folder. All of today's new exports are acceptable; identify/deduplicate them safely, and map the seven sections by independent transcription. Do not ask Todd to edit scripts or generate each voice again. The voice and updated native master tabs were retained for review. New videos, timestamped transcript, and live service asset references remain unchanged pending this one-time file transfer and media validation. The automatic roster invitation/reminder rollout also remains paused from the prior login-test handoff; do not claim it is scheduled or enabled.

## Media build completed — November 22, 2026

All seven November 22 WAVs were supplied and matched by SHA-256 in audio-receipt.json. Independent speech recognition found two concrete defects despite high overall similarity: an altered budgeting sentence in section 1, and an omitted work/health/family sentence in section 5. Restored those exact complete sentences from the club’s existing November 20 Arlo takes, leaving uploaded originals untouched; audio-repairs.json records the cuts and digests. Re-transcription confirmed both sentences. Remaining differences were reviewed as pronunciation/spelling/numeric transcription variants, not missing instruction.

Rebuilt seven videos and retained all 89 slide positions. All 89 midpoint frames matched the rendered source (minimum PSNR 34.53 dB). Final runtime 3543.86 seconds, displayed 59:04. Per-section exact duration: 560, 439.48, 620, 688.68, 210.38, 410.32, 615 seconds. Matched transcript, per-slide timestamps, and server watch durations have been rebuilt. All 25 gate, grade, identity, record, and lifecycle tests pass.

Existing Drive video file IDs and transcript ID were updated in place for Classroom attachment continuity. The website release uses new media filenames and asset hashes, retaining the previous media for the old private deployment/rollback. No grades, quiz attempts, completions, roster status, or certificate records were fabricated or changed. Deployment verification and Pages status will be appended after publication. Login-test and automatic enrollment/reminder activation remain separate pending work from the previous rollout.
