# Future Ideas

Not scheduled work — a place to capture options worth considering later,
with enough detail to revisit them without re-deriving context. Unlike
[ISSUES.md](ISSUES.md), nothing here is a problem to fix; it's optional
scope.

## Mini-game (NieR: Automata style)

**Status:** future consideration, raised by the owner on 2026-07-18. Not
scheduled, no target date.

**Motivation:** the site already leans hard into the NieR: Automata
aesthetic (terminal boot sequence, CRT scan lines, chromatic aberration,
monospace/glitch typography). A small playable feature would fit that
identity and give visitors something more memorable than a static resume —
without turning the portfolio into a game-dev showcase that overshadows the
actual engineering work.

### Options considered (easiest → most ambitious)

1. **"System Diagnostic" reflex game.** Random "glitches" appear briefly on
   screen; the visitor clicks/presses a key to "stabilize" each one before
   it times out, building a combo/score. Directly reuses two components
   that already exist in the codebase — [`ScanLineEffect`](../src/app/components/scan-line-effect/scan-line-effect.ts)
   and [`ChromaticAberration`](../src/app/components/chromatic-aberration/chromatic-aberration.ts)
   — as the visual "glitch" itself, and ties narratively into text the
   Loading screen already has (`Emotional Matrix: Desynchronized`,
   `Cognitive Kernel Status: Stable`, etc. — see
   [`loading.ts`](../src/app/components/loading/loading.ts)). Plain DOM +
   timers, no canvas or physics needed.
   **Effort:** smallest of the four — an afternoon to a day, mostly because
   it's built almost entirely out of pieces that already exist.

2. **Terminal typing-speed challenge.** Words scroll/fall down the screen
   (could pull from the site's own content — tech stack terms from
   `skills/*.md`, project names) and the visitor must type them before they
   scroll off. Reuses the existing [`TypingAnimation`](../src/app/services/typing-animation/typing-animation.ts)
   service's character-rendering approach and the monospace terminal font
   already used on the Loading screen. Doubles as a subtle "I'm fast and I
   built the typing effect too" flex.
   **Effort:** a bit more than option 1 — needs word-spawn timing and input
   matching, but still no physics/canvas.

3. **NieR hacking-minigame homage.** A simplified version of the game's
   iconic hacking sequence: a small pod dodges/shoots geometric wireframe
   enemies in a monochrome space. The single most recognizable reference to
   anyone who's played NieR: Automata — highest "they get it" payoff.
   **Effort:** the real jump in scope — needs an HTML5 Canvas game loop,
   collision detection, enemy spawning/pacing. A weekend project, not a
   quick add; the main risk is scope creep and it becoming its own
   mini-product instead of a portfolio flourish.

4. **Snake / 2048 reskinned in CRT/monochrome.** Trivial to implement —
   plenty of reference implementations exist — but thematically generic; it
   reads as "retro game" rather than "NieR," a weaker payoff for the same
   audience.

### Recommendation

Start with **option 1** if this ever gets picked up — it's the only one
that's genuinely a "quick add" (built mostly from existing components), and
it fits the site's established narrative (the Loading screen's diagnostic
text) rather than introducing a new theme. **Option 3** is the most
authentic nod to the game itself and worth it if there's a free weekend and
appetite for a real canvas-based mini-game, but it shouldn't be the first
attempt — building option 1 or 2 first would validate whether visitors
actually engage with an embedded game at all before investing a weekend in
the more ambitious one.

### Not yet decided

- Where it would live: a new route (`/game`)? An easter egg reachable only
  via a hidden key combo? A panel inside an existing section (e.g. Home)?
- Whether it needs to be mobile-playable or desktop/keyboard-only is
  acceptable (the rest of the site already treats mobile as a reduced,
  non-keyboard experience — see `Home`'s `isMobile` handling).
