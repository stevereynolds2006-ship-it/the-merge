# The Merge

A Rare Friends Vibeathon game: your Generations NFT is the human signal. Walk it through a circuit courtyard, charge a Merge Pulse, and open the Synthesis Gate so human and artificial intelligence can meet.

**Builder:** Sharp / [@Sharpbigred](https://x.com/Sharpbigred)  
**Category:** Character Spotlight  
**SDK:** FriendSDK v0.1.2  
**Status:** Playable preview. Economy is simulated. Not submitted until you say it is ready.

## Play on your computer

Need Node.js 22+, Git, and a browser wallet on **Robinhood mainnet (chain 4663)** that owns a hardwired Rare Friends Generations NFT (generation ≥ 1).

```bash
git clone https://github.com/spokesz/friendsdk.git
cd friendsdk
git clone https://github.com/stevereynolds2006-ship-it/the-merge.git /tmp/the-merge
cp -R /tmp/the-merge/game/. games/merge
npm ci
npm run dev:game -- games/merge --host 0.0.0.0 --port 4173
```

Open the printed URL (usually `http://localhost:4173`). Connect the wallet, pick your Friend, walk.

## Play on your phone

Keep the dev server running with `--host 0.0.0.0`. On the same Wi-Fi, open `http://<your-computer-lan-ip>:4173` in the phone browser. Use a mobile wallet that can switch to Robinhood mainnet, or test the movement on desktop first.

Tap the courtyard to walk. Tap a station prompt when you are close.

## How you play

1. Walk to **Pulse Bench** and buy a Merge Pulse (1 simulated RF).
2. Walk to the **Synthesis Gate**. Tap three times to sync (cosmetic only).
3. Open the gate. Keep the artifact or redeem it from the **Archive**.

Sync taps do not change odds. Reloading resets the preview.

## Outcome table

| Result | Chance | Redemption |
| --- | --- | --- |
| Static Echo | 15% | 0 RF |
| Warm Handshake | 30% | 0.25 RF |
| Shared Memory | 22% | 0.50 RF |
| Twin Signal | 14% | 0.75 RF |
| Aligned Mind | 9% | 1.50 RF |
| Living Circuit | 5% | 2.50 RF |
| Singularity Bond | 3% | 5 RF |
| One Mind | 2% | 10 RF |

Expected reward: **0.90 RF** per pulse. Each pulse reserves 10 RF of backing.

## Project layout

```
game/
  index.tsx     chamber, walking, menus
  game.json     pulse price and outcome table
  style.css     chamber styling
  host.css      960 × 640 reference frame
  README.md     rules
```

## Checks already run

- `npx friendsdk check games/merge` — valid, EV 0.90 RF
- `npx friendsdk test games/merge` — PASS at 960px
- `npx friendsdk test games/merge --width 360` — PASS at phone width

## Submit later

When you are happy, ask to submit. Submission is a pull request to  
[spokesz/rarefriends-vibeathon](https://github.com/spokesz/rarefriends-vibeathon) adding `submissions/the-merge/README.md`. Official Rare Friends production publication is a separate review.
