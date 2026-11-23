# MySirat — handover

MySirat is Summar's (SMR Digital, Luton) standalone Muslim toolkit app: an ad-free local alternative to Muslim Pro. It started as the Islamic toolbox inside the Inspire FM 105.1 app that SMR Digital built, and was split out as its own product. This repository is its home. It is kept separate from the SMR website and the games (Flappy Kabootar, Jummah Dash), which live in `summarshah1-creator/smr-website`.

## Where things are

| What | Where |
|---|---|
| The finished app (static web app, open `app/index.html`) | `app/` |
| Build script: makes `app/` from the sources | `build/build_app.py` (`python3 build/build_app.py`) |
| Inspire FM engine it's built from (a copy of the Inspire FM app as of 16 Nov 2026) | `sources/inspire-engine/` |
| MySirat skin: icons, manifest, logo marks, fonts, `mt.css` / `mt.js` | `sources/mysirat-skin/` |
| NGS Pathfinder + Skills & Training Finder (pulled in by the build) | `sources/ngs/` |
| Make or update the SMR Digital demo | `tools/make_smr_demo.py` |
| Old pitch-deck build scripts (Muslim Toolkit deck, artifact 577d069f-3f56-4a0c-83d9-129dd1c06dc4) | `build/pitch-deck/` |
| Screenshot helper | `build/snap.py` |

Published copy (Claude artifact): **"MySirat"**, slug `3cd65571-1075-4d49-99a5-6f8c31a5b331`, https://claude.ai/artifact/8WirZqStZEQeeh5taPT2UY (last published 16 Nov 2026). When the app changes, republish it from `app/` and keep this repo in step.

## How the build works

`build/build_app.py` copies the Inspire FM engine into `app/`, then:
- removes the radio (no live player, presenters, live room, studio, audio) and all Inspire FM branding;
- adds the MySirat skin (`app/mt/`, manifest, icons) and swaps names/footers to MySirat;
- adds the NGS Pathfinder and Skills & Training Finder (`app/ngs/`).
It prints a warning line (`!! not found in …`) for any replacement that no longer matches, which tells you when the engine has changed under it. Small changes to MySirat itself can also be made directly in `app/`, but anything you want to survive a rebuild belongs in `sources/mysirat-skin/` or in the build script.

## Owner decisions so far

- Name **MySirat**; grey-on-black ribbon logo; sleek look.
- **No radio.** Watch shows **only Islam / dawah videos**.
- Features: prayer times with adhan alerts and qibla (no ads), local masjid jamaat times and Jummah finder, Ayah a day, duas, Hajj & Umrah guide, zakat and inheritance calculators, Islamic entertainment, Luton news and resources, halal directory, NGS Pathfinder + Skills & Training Finder.
- Plan: release as a web app on his own server for people to trial, then try it as an iPhone app through TestFlight.
- Revenue idea: one main sponsor per area (users choose location and madhab, each area gets local extras) plus promoted listings in the halal directory.
- Still open: whether to add Shia opinions/content alongside the Sunni content.

## House rules (from the SMR projects)

- No real brand names or logos unless they're the client's own; use the owner's own art and sounds where he provides them.
- Mosque logos: always the latest set from the Inspire FM app (`img/m/full` in the engine); see the SMR logo library skill.
- Make only the change asked, check it on a phone-sized screen (390 px wide) and desktop, then publish.
- Plain, friendly British English in anything the user sees.
- End commits with the Claude co-author lines from the session.

## Making it an SMR Digital demo

The SMR site has a private Demo Manager (SMR Admin → My demos / Send). To put MySirat in it, or update it:

```bash
git clone https://github.com/summarshah1-creator/smr-website
python3 tools/make_smr_demo.py ../smr-website --ver 1.0      # add --hidden to ship it hidden
cd ../smr-website && git add .github/tools/seeds.json demo-data/seed && git commit -m "Update MySirat demo" && git push
```

Pushing `smr-website` to `main` deploys it. The demo (slug `mysirat`) then shows in SMR Admin → My demos with its icon, tagline and the "App features" tips, ready to send as a link. For later updates run the same command with the next version (1.1, 1.2 … 1.9, then 2.0: small fix +0.1, a few changes +0.2/0.3, a big redesign = next whole number). The demo name, tagline, description and tips live in `seeds.json` (first-time defaults are in `tools/make_smr_demo.py`). Pack is ~20 MB.

## Where this repository lives

Right now: the **`mysirat` branch of `summarshah1-creator/smr-website`** (its own history, nothing shared with the site; pushing it never deploys anything). Claude can't create new GitHub repositories from a chat, so if Summar makes an empty private repository called `mysirat` on GitHub, move it there with:

```bash
git clone -b mysirat https://github.com/summarshah1-creator/smr-website mysirat && cd mysirat
git push https://github.com/summarshah1-creator/mysirat.git mysirat:main
```

then update this section and delete the `mysirat` branch from smr-website.

## Starting a new chat

Open the MySirat project in Claude, start a chat, attach `summarshah1-creator/smr-website` (or `mysirat` once moved), check out the `mysirat` branch and read this file first. Commit and push MySirat work to that branch only, never to smr-website's `main` (except the demo pack made by `tools/make_smr_demo.py`).
