/**
 * @file sound-manager.ts
 * @description Web Audio API singleton for instant notification sound playback.
 *
 * WAV files are fetched once, decoded to AudioBuffers, and cached in memory.
 * Playback creates a lightweight AudioBufferSourceNode (~0 ms latency).
 * AudioContext is resumed on first user gesture to satisfy autoplay policies.
 * SSR-safe: all browser APIs are guarded behind `typeof window` checks.
 */

export enum SoundId {
  BOOKING_CREATED = "booking_created",
  BOOKING_CONFIRMED = "booking_confirmed",
  BOOKING_CANCELLED = "booking_cancelled",
  BOOKING_COMPLETED = "booking_completed",
  QUEUE_IN_SERVICE = "queue_in_service",
  QUEUE_COMPLETED = "queue_completed",
  QUEUE_ABSENT = "queue_absent",
  QUEUE_AUTO_CANCELLED = "queue_auto_cancelled",
  QUEUE_BACK_IN_QUEUE = "queue_back_in_queue",
  QUEUE_REMINDER = "queue_reminder",
  DEFAULT = "default",
}

const ALL_SOUND_IDS = Object.values(SoundId)
const toPath = (id: SoundId) => `/sounds/${id}.wav`
const GESTURE_EVENTS = ["click", "touchstart", "keydown"] as const

class SoundManager {
  private static instance: SoundManager | null = null
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  private buffers = new Map<SoundId, AudioBuffer>()

  private constructor() {
    if (typeof window === "undefined") return

    this.ctx = new AudioContext()
    this.gain = this.ctx.createGain()
    this.gain.gain.value = 0.5
    this.gain.connect(this.ctx.destination)

    this.preloadAll()
    this.listenForGesture()
  }

  static getInstance(): SoundManager {
    return (SoundManager.instance ??= new SoundManager())
  }

  play(id: SoundId): void {
    const buffer = this.buffers.get(id)
    if (!this.ctx || !this.gain || !buffer) return

    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {})

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.gain)
    source.start(0)
  }

  setVolume(volume: number): void {
    if (this.gain) this.gain.gain.value = Math.max(0, Math.min(1, volume))
  }

  private preloadAll(): void {
    for (const id of ALL_SOUND_IDS) {
      fetch(toPath(id))
        .then((r) => r.arrayBuffer())
        .then((buf) => this.ctx!.decodeAudioData(buf))
        .then((decoded) => this.buffers.set(id, decoded))
        .catch(() => {})
    }
  }

  private listenForGesture(): void {
    const cleanup = () =>
      GESTURE_EVENTS.forEach((e) =>
        document.removeEventListener(e, resume, true),
      )

    const resume = () => {
      if (!this.ctx || this.ctx.state !== "suspended") {
        cleanup()
        return
      }
      this.ctx
        .resume()
        .then(cleanup)
        .catch(() => {})
    }

    GESTURE_EVENTS.forEach((e) =>
      document.addEventListener(e, resume, { capture: true }),
    )
  }
}

export function getSoundManager(): SoundManager {
  return SoundManager.getInstance()
}
