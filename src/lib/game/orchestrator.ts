// ── Game Orchestrator ─────────────────────────────────────────────────
// Owns the trial loop state machine, pause/resume, and demo logic.
// Pure TypeScript — no Svelte, no DOM. Pages pass callbacks.

import type { GameState, OrientKey } from "./types";
import type { CalibrationProfile } from "./calibration";
import type { SessionState } from "./session";
import {
    createGameState,
    nextTrial,
    processAnswer,
    skipTrial,
    getAccuracy,
    updateStimulusDuration,
} from "./state";
import {
    createSessionState,
    updateSessionTimer,
    shouldAdvancePhase,
    advanceSessionPhase,
    formatTime,
} from "./session";
import { ORIENTATIONS, MODES } from "$lib";

export interface OrchestratorCallbacks {
    /** Called when fixation cross should appear */
    onFixationStart: () => void;
    /** Called when stimulus should be rendered */
    onStimulusShow: () => void;
    /** Called when canvas should go blank (ISI) */
    onBlank: () => void;
    /** Called when the system is waiting for user input */
    onWaitingForResponse: () => void;
    /** Called after answer — shows feedback */
    onFeedback: (correct: boolean, correctLabel: string) => void;
    /** Called when all trials are done or session expires */
    onDone: (results: {
        accuracy: string;
        correct: number;
        total: number;
        invalidTrials: number;
        difficulty: number;
        elapsed: number;
    }) => void;
    /** Called when session timer display should update */
    onSessionUpdate?: (display: string, phase: string) => void;
    /** Called when pause state changes */
    onPauseChange?: (paused: boolean) => void;
    /** Called when demo orientation changes */
    onDemoLabel?: (label: string) => void;
}

export interface OrchestratorTimers {
    setLoopTimeout: (fn: () => void, ms: number) => void;
    setResumeInterval: (fn: () => void, ms: number) => void;
    clearTimers: () => void;
}

export interface Orchestrator {
    getState: () => GameState;
    getSession: () => SessionState | null;
    start: () => void;
    handleAnswer: (key: string) => void;
    handleSkip: () => void;
    handleRepeat: () => void;
    pause: () => void;
    resume: (onResumed?: () => void) => void;
    startDemo: () => void;
}

export function createOrchestrator(
    mode: string,
    numTrials: number,
    eye: string,
    isDemo: boolean,
    isSession: boolean,
    callbacks: OrchestratorCallbacks,
    timers: OrchestratorTimers,
    profile: CalibrationProfile | null = null,
): Orchestrator {
    let gs = createGameState(mode, numTrials, eye as any, profile);
    let session: SessionState | null = isSession && !isDemo ? createSessionState() : null;
    let isPaused = false;
    let resumeCountdown = 0;

    // Demo state
    const demoOrients: OrientKey[] = ["horiz", "diag1", "vert", "diag2"];
    let demoIndex = 0;

    function gameLoop() {
        if (!gs.running || isPaused) return;

        // Session timer update
        if (session && session.running) {
            updateSessionTimer(session);
            callbacks.onSessionUpdate?.(formatTime(session.elapsed), session.phase);

            if (session.elapsed >= 30 * 60 * 1000) {
                session.phase = "complete";
                session.running = false;
                endTraining();
                return;
            }

            if (shouldAdvancePhase(session)) {
                advanceSessionPhase(session);
            }
        }

        if (gs.phase === "fixation") {
            gs.replayCount = 0;
            callbacks.onFixationStart();
            timers.setLoopTimeout(() => {
                gs.phase = "stimulus";
                callbacks.onStimulusShow();

                timers.setLoopTimeout(() => {
                    callbacks.onBlank();
                    timers.setLoopTimeout(() => {
                        gs.waitingForResponse = true;
                        gs.phase = "waiting";
                        callbacks.onWaitingForResponse();
                    }, gs.isi);
                }, gs.stimulusDuration);
            }, 300);
        } else if (gs.phase === "feedback") {
            timers.setLoopTimeout(() => {
                nextTrial(gs);
                updateStimulusDuration(gs);
                if (gs.phase === "done") {
                    endTraining();
                } else {
                    gameLoop();
                }
            }, 700);
        } else if (gs.phase === "done") {
            endTraining();
        }
    }

    function endTraining() {
        gs.running = false;
        callbacks.onDone({
            accuracy: getAccuracy(gs),
            correct: gs.correct,
            total: gs.total,
            invalidTrials: gs.invalidTrials,
            difficulty: gs.difficulty,
            elapsed: Math.round((Date.now() - gs.startTime) / 1000),
        });
    }

    function handleAnswer(key: string) {
        if (!gs.waitingForResponse || !gs.running || isPaused) return;
        processAnswer(gs, key);
        const correctLabel = gs.lastAnswerCorrect
            ? "✓"
            : "✗ → " + getCorrectAnswerLabel(gs);
        callbacks.onFeedback(gs.lastAnswerCorrect ?? false, correctLabel);
        gameLoop();
    }

    function handleSkip() {
        if (!gs.waitingForResponse || !gs.running || isPaused) return;
        skipTrial(gs);
        gameLoop();
    }

    function handleRepeat() {
        if (!gs.waitingForResponse || gs.replayCount >= gs.maxReplays) return;
        gs.replayCount++;
        callbacks.onStimulusShow();
    }

    function pause() {
        if (isPaused || !gs.running) return;
        isPaused = true;
        gs.paused = true;
        timers.clearTimers();
        callbacks.onPauseChange?.(true);
    }

    function resume(onResumed?: () => void) {
        if (!isPaused) return;
        resumeCountdown = 3;
        timers.setResumeInterval(() => {
            resumeCountdown--;
            if (resumeCountdown <= 0) {
                timers.clearTimers();
                isPaused = false;
                gs.paused = false;
                callbacks.onPauseChange?.(false);
                onResumed?.();
                gameLoop();
            }
        }, 800);
    }

    function demoLoop() {
        if (demoIndex >= demoOrients.length) {
            // Demo done — caller handles navigation
            endTraining();
            return;
        }
        const key = demoOrients[demoIndex];
        const o = ORIENTATIONS[key];
        callbacks.onDemoLabel?.(o.symbol + " " + o.labelKey);
        callbacks.onBlank();
        timers.setLoopTimeout(() => {
            callbacks.onStimulusShow();
            demoIndex++;
            timers.setLoopTimeout(demoLoop, 1500);
        }, 400);
    }

    function getCorrectAnswerLabel(state: GameState): string {
        if (!state.currentTrial) return "";
        const mode = MODES[state.currentMode as keyof typeof MODES];
        if (mode.type === "2afc") {
            return state.currentTrial.correct === 'left' ? '◀ Left' : 'Right ▶';
        }
        const orientKey = state.currentTrial.correct as OrientKey;
        const o = ORIENTATIONS[orientKey];
        return o.symbol + " " + o.labelKey.split(".").pop();
    }

    return {
        getState: () => gs,
        getSession: () => session,
        start: () => {
            if (isDemo) {
                demoLoop();
            } else {
                nextTrial(gs);
                gameLoop();
            }
        },
        handleAnswer,
        handleSkip,
        handleRepeat,
        pause,
        resume,
        startDemo: demoLoop,
    };
}
