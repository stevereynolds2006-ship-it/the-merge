# The Merge · FriendSDK v0.1.2

Walk your Rare Friend across a circuit courtyard and attempt a merge with its artificial twin.

Your selected Generations NFT is the human signal. The Synthesis Gate holds the machine counterpart. Charge a Merge Pulse, sync the two waveforms, and open the gate. One pulse produces one artifact.

**Builder:** Sharp / @Sharpbigred · **Category:** Character Spotlight · **SDK:** FriendSDK v0.1.2

## How to play

1. Connect a browser wallet on Robinhood mainnet (chain 4663) that owns a hardwired Rare Friends Generations NFT (generation ≥ 1).
2. Select that Friend. The SDK verifies ownership before play.
3. Walk with WASD, arrow keys, or tap/click a destination.
4. At **Pulse Bench**, buy a simulated Merge Pulse (1 RF).
5. Walk to the **Synthesis Gate**. Tap three times to sync (presentation only), then **Open the gate**.
6. Keep the artifact or redeem it from the **Archive**.
7. Settings include mute and reduced motion.

On a phone, tap the deck to walk and tap a station prompt when you are close. Press E at a station on desktop.

## Run locally

From a FriendSDK v0.1.2 checkout with Node.js 22+:

```bash
git clone https://github.com/spokesz/friendsdk.git
cd friendsdk
npm ci
# copy this game folder to games/merge, then:
npm run dev:game -- games/merge --host 0.0.0.0 --port 4173
```

Open the printed URL on your computer, or `http://<your-lan-ip>:4173` on your phone (same Wi-Fi).

```bash
npx friendsdk check games/merge
npx friendsdk test games/merge
```

All balances, purchases, merges, artifacts and redemptions are **simulated**. Reloading resets the preview. No RF spend or transaction signature is required for this preview.

## Rules and rewards

| Result | Chance | Redemption value |
| --- | --- | --- |
| Static Echo | 15% | 0 RF |
| Warm Handshake | 30% | 0.25 RF |
| Shared Memory | 22% | 0.50 RF |
| Twin Signal | 14% | 0.75 RF |
| Aligned Mind | 9% | 1.50 RF |
| Living Circuit | 5% | 2.50 RF |
| Singularity Bond | 3% | 5 RF |
| One Mind | 2% | 10 RF |

- Pulse price: 1 RF (`1000000000000000000` base units)
- Expected reward: 0.90 RF per pulse
- Consumable: one pulse produces exactly one artifact
- Backing: each purchased or pending pulse reserves 10 RF; kept rewards reserve their fixed RF value
- Redemption: fixed value, no expiry
- Sync taps are cosmetic. They do not change weights.

Intended future integration: live ChanceGame purchases of Merge Pulses paid in $RAREFRIENDS, Dice settlement, and redemption to the Friend's canonical NFT wallet.

## Notes

World preset: Circuit Courtyard (`02-circuit-courtyard-complete`). Canonical Friend sprites remain the player's identity. Custom chamber styling does not replace the runtime ownership check.

No trading, creator fees or wearable NFTs are implemented.
