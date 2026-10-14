export type TypingStep = { at: number; text: string; composing: string }

const TONES = "ˊˇˋ˙"

/**
 * The keystrokes of `text`, timed. `zhuyin` gives each Chinese character's
 * reading, such as { 開: "ㄎㄞ", 我: "ㄨㄛˇ" }; a character without one is
 * typed as a single key. 100ms a key is about 120 words a minute.
 */
export function typingSteps(
  text: string,
  {
    zhuyin = {},
    msPerKey = 100,
    jitter = 0.3,
    seed = 1,
  }: {
    zhuyin?: Record<string, string>
    msPerKey?: number
    /** How far each keystroke may stray from msPerKey, as a fraction. */
    jitter?: number
    /** The same seed gives the same timing, so replays and renders agree. */
    seed?: number
  } = {}
): TypingStep[] {
  // mulberry32: small, fast and seeded.
  let state = seed >>> 0
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let r = Math.imul(state ^ (state >>> 15), 1 | state)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
  const key = () => msPerKey * (1 + (random() * 2 - 1) * jitter)

  const steps: TypingStep[] = [{ at: 0, text: "", composing: "" }]
  let at = 0
  let typed = ""
  for (const char of text) {
    const reading = zhuyin[char]
    if (!reading) {
      at += key()
      typed += char
      steps.push({ at, text: typed, composing: "" })
      continue
    }
    // Phonetic keys show as they are typed; the tone key, or the space bar
    // for the first tone, turns them into the character.
    const sounds = Array.from(reading).filter((c) => !TONES.includes(c))
    let composing = ""
    for (const sound of sounds) {
      at += key()
      composing += sound
      steps.push({ at, text: typed, composing })
    }
    at += key()
    typed += char
    steps.push({ at, text: typed, composing: "" })
  }
  return steps
}

/** What the screen shows `ms` into the animation. */
export function typedAt(steps: TypingStep[], ms: number) {
  let shown = steps[0]
  for (const step of steps) {
    if (step.at > ms) break
    shown = step
  }
  return shown
}

/** How long the whole animation takes, in ms. */
export function typingDuration(steps: TypingStep[]) {
  return steps[steps.length - 1].at
}
