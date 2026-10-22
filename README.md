# GATEKEEPER: Zero Trust Checkpoint

A game that teaches **Authentication, Authorization, Conditional Access and Accounting/Auditing**.
Students work a checkpoint, deciding who gets in, who needs extra proof (step-up) and who is turned away.
Every shift is randomised, and letting the wrong person in produces an incident report explaining why.

## Run it

Double-click **`index.html`**. No install, server or internet connection is needed.

## Project layout

```
index.html            page skeleton; loads the CSS and the scripts below, in order
css/
  styles.css          all styling (aqua and mint theme, Calibri)
js/
  main.js             entry point: keyboard controls and game start
  core/
    utils.js          DOM helper, seeded random (class codes), formatters
    data.js           names, countries, roles, resources + ACLs, the four concepts
    state.js          the game-state object (G) and sound
  engine/             game rules with no screen code
    requests.js       builds a request, plus the FLAWS table (what can be wrong)
    policy.js         RULES + evaluate(): the single source of truth for allow / step-up / deny
    generator.js      makeReq() and buildQueue(): builds each shift, verified against the policy
    stories.js        incident reports: who the bad user really was and the lesson
  ui/                 everything drawn on screen
    dossier.js        the four-part dossier
    screens.js        start screen, automatic shift briefings, play screen, HUD
    modals.js         incident pop-ups and the "fired" screen
    rulebook.js       the in-game policy drawer
    endscreens.js     celebration, certificate, game over
  game/
    timer.js          per-request countdown
    decisions.js      allow / step-up / deny handling, scoring, shields, firing rule
tests/
  logic.test.js       4,200 random requests: the right answer always matches the policy
  ui.test.js          plays the real page: shifts, DENY, shields, firing, celebration
tools/
  build-single.js     bundles everything into dist/gatekeeper-single.html
```

The scripts are plain `<script>` files (not ES modules) on purpose: browsers block modules
on `file://`, so this keeps "double-click to run" working. They share one global scope,
so **the order of the `<script>` tags in `index.html` matters**.

## Common changes

| To change... | Edit |
|---|---|
| A rule (what is allowed / step-up / denied) | `js/engine/policy.js` (add a matching flaw in `requests.js` and a story in `stories.js`) |
| Users, countries, resources, who may access what | `js/core/data.js` |
| Colours and fonts | top of `css/styles.css` (`:root` variables) |
| Shift length, timer, difficulty ramp | `buildQueue` in `js/engine/generator.js`, `startTimer` in `js/game/timer.js` |
| Scoring, shield and firing rules | `js/game/decisions.js` |
| Briefing time (currently 2 minutes) | `const secs=120` in `js/ui/screens.js` |

## Tests and build

```
npm install     # once, installs jsdom for the UI test
npm test        # logic test + UI test
npm run build   # writes dist/gatekeeper-single.html (one file, for emailing or an LMS)
```

## Classroom tip

Type the same **class code** on every student's start screen and everyone gets the same
customers, which makes a debrief easy ("who let in the 14:02 request?").
