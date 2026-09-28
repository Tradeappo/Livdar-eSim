# Rank Tracker, 2026-09-28

125 keywords tracked, 0 units to read.

**1 of 125 ranks.** `livdar esim`, United States, position 1, organic,
answering with `https://livdar.com/ro/esim/turcia/`. It is a brand term at
volume 0, and the URL it ranks with is the Romanian Turkey page, which is
not the page anybody searching that phrase wants.

The other 124 have `position: null` and `traffic: 0`. Every one has
`keyword_has_data: true`, so the SERPs were checked and Livdar was not in
them.

## Coverage against the surfaces

All 125 tracked keywords are eSIM keywords. Coverage of the Atlas surfaces
is zero:

| Surface | Tracked keywords |
| --- | --- |
| eSIM (legacy) | 125 |
| Pulse | 0 |
| Areas | 0 |
| Work | 0 |
| Move | 0 |
| Sport | 0 |
| Stay | 0 |
| Tools | 0 |
| Climate | 0 |

So the Rank Tracker cannot detect an Atlas signal at all, in any market. It
is measuring only the surface that was already there.

## Markets

United States 22, Japan 18, Germany 16, Taiwan 15, United Kingdom 9,
France 9, Italy 9, Netherlands 9, Poland 7, Brazil 7, Spain 5.

Eleven markets, which matches the eleven the brief asks about. The
languages are en, ja, zh, de, fr, it, es, nl, pl, pt.

## Proposed additions

`proposed-additions-2026-09-28.tsv`, **125 keywords, nothing deleted.**

Every one is a keyword a live Atlas page already targets, so a first ranking
lands on a page that exists. They were chosen by covering each surface in
each market it publishes in, best first, where best is highest volume and
then lowest difficulty: 58 surface and market pairs, so a signal appearing in
any surface in any market becomes visible rather than being averaged away.

Their combined volume is **1,882,740**, which is 80 per cent of all the
demand the 500 pages target.

| Surface | Proposed |
| --- | --- |
| pulse | 28 |
| tools | 27 |
| move | 18 |
| areas | 16 |
| work | 15 |
| climate | 10 |
| sport | 6 |
| stay | 5 |

Tags on each row: `atlas`, `surface-<surface>`, `family-<family>`,
`lang-<locale>`, `market-<iso>`, `cohort-<001|002>`. The existing eSIM tags
are untouched and no existing keyword is affected.

### This cannot be applied from here

The Ahrefs API is read-only for Rank Tracker keywords.
`management-project-keywords` lists them and there is no endpoint that adds
one, so the additions have to be made in the Ahrefs interface by a signed-in
account. The file is formatted for that: keyword, country, language, volume,
KD, tags, and the page each one belongs to.

Note on slots: 125 tracked now plus 125 proposed is 250, and whether the plan
allows that was not checked because the subscription endpoint does not report
a Rank Tracker allowance. If the allowance is lower, cut from the bottom of
the file, which is sorted by volume descending, and the coverage degrades
gracefully rather than losing a surface entirely.

See `reports/USER-ACTIONS-REQUIRED.md`.
