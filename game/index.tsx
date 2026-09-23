"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameWorld, type GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { getWorldPreset, validateWorld } from "@rarefriends/friendsdk/world";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GameSnapshot, type GamePlay } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";
import "@rarefriends/friendsdk/frame.css";
import "@rarefriends/friendsdk/world-view.css";
import "./style.css";

const station = getWorldPreset("02-circuit-courtyard-complete");
const world = validateWorld({
  ...station,
  props: [...station.props],
  actors: [],
});
const spawn = [180, 200] as const;
const interactions: readonly GameWorldInteraction[] = [
  { id: "buy", label: "Pulse Bench", position: [132, 344], reach: 92, labelOffset: -130 },
  { id: "merge", label: "Synthesis Gate", position: [426, 72], reach: 92, labelOffset: -180 },
  { id: "archive", label: "Archive", position: [448, 314], reach: 92, labelOffset: -120 },
];

type Menu = "buy" | "merge" | "archive" | "settings" | "reward" | null;

const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

const FLAVOR: Record<string, string> = {
  "Static Echo": "The signals brushed and bounced. A ghost of contact, then silence.",
  "Warm Handshake": "Human curiosity met machine courtesy. A first protocol holds.",
  "Shared Memory": "A childhood smell and a training trace occupy the same address.",
  "Twin Signal": "Two waveforms lock phase. Neither leads. Neither follows.",
  "Aligned Mind": "Intention and inference finish each other's sentences.",
  "Living Circuit": "Flesh and code share a pulse. The Friend walks differently now.",
  "Singularity Bond": "The boundary thins. For a moment there is only one walker.",
  "One Mind": "Human and artificial intelligence merge. The Friend is both, and neither.",
};

function revealCue(chanceBps: number): FriendSoundCue {
  if (chanceBps <= 200) return "reveal-legendary";
  if (chanceBps <= 900) return "reveal-rare";
  return "reveal-common";
}

/** Circuit courtyard merge chamber. The SDK runtime supplies the selected owned Friend and preview client. */
export default function TheMerge({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [result, setResult] = useState<GamePlay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [beats, setBeats] = useState(0);
  const sound = useRef<FriendSoundKit | null>(null);
  const locked = useRef(false);
  const epoch = useRef(0);
  const definition = client.definition;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null);
    setMenu(null);
    setResult(null);
    setError("");
    setMessage("");
    setBusy(false);
    setMuted(true);
    setBeats(0);
    locked.current = false;
    void client.read().then(value => {
      if (version === epoch.current) setSnapshot(value);
    }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Could not load the preview.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => {
      epoch.current++;
      sound.current?.dispose();
      sound.current = null;
      preference.removeEventListener("change", update);
    };
  }, [client, friendId]);

  async function act(work: () => Promise<void>, cue?: FriendSoundCue, after?: () => void) {
    if (locked.current || paused) return;
    const version = epoch.current;
    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    void sound.current?.unlock();
    try {
      await work();
      const value = await client.read();
      if (version === epoch.current) {
        setSnapshot(value);
        if (cue) sound.current?.play(cue);
        after?.();
      }
    } catch (cause) {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "The preview action failed.");
    } finally {
      if (version === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  }

  const navigate = (next: Menu) => {
    if (!busy && !paused) {
      setMenu(next);
      setError("");
      setMessage("");
      if (next !== "merge") setBeats(0);
    }
  };

  const feedback = (
    <p role={error ? "alert" : "status"}>
      {error || message || (busy ? "Waiting for preview confirmation…" : "Simulated RF and outcomes. Sync taps do not change odds.")}
    </p>
  );

  if (!snapshot) {
    return (
      <div className="merge-loading" role={error ? "alert" : "status"}>
        {error || "Loading merge chamber…"}
        {error && (
          <button type="button" disabled={busy || paused} onClick={() => void act(async () => {})}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (snapshot.friendId !== friendId) {
    return <p role="alert">This game session does not match the selected Friend.</p>;
  }

  const maxPrize = maximumPrize(definition);
  const canBuy = snapshot.rfBalance >= definition.price && snapshot.freeStake >= maxPrize && snapshot.freeStake + definition.price >= maxPrize;
  const pending = snapshot.plays.find(play => play.outcomeId === null);
  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const count = snapshot.inventory.reduce((total, amount) => total + amount, 0n);
  const union = Number(count > 12n ? 12n : count) / 12;

  const beginMerge = () => act(async () => {
    const version = epoch.current;
    sound.current?.play("action-start");
    const play = pending ?? (await client.play(1n))[0];
    if (!reducedMotion && beats < 3) {
      sound.current?.play("anticipation");
    }
    const settled = await client.settle(play.id);
    if (version === epoch.current) {
      setResult(settled);
      setBeats(0);
      setMenu("reward");
      const item = settled.outcomeId ? definition.outcomes[settled.outcomeId - 1] : null;
      if (item) sound.current?.play(revealCue(item.chanceBps));
    }
  });

  return (
    <section className="merge-game" aria-label={definition.name} aria-busy={busy}>
      <div className="merge-world" inert={Boolean(menu) || paused || undefined}>
        <GameWorld
          world={world}
          spawn={spawn}
          interactions={interactions}
          friendId={friendId}
          paused={Boolean(menu) || paused}
          reducedMotion={reducedMotion}
          onInteract={id => navigate(id === "buy" ? "buy" : id === "archive" ? "archive" : "merge")}
        />
        <div className="merge-scan" aria-hidden="true" />
        <div className="merge-hud">
          <span>Preview · {rf(snapshot.rfBalance)} · {snapshot.consumables.toString()} pulses</span>
          <button type="button" onClick={() => navigate("archive")}>Archive · {count.toString()}</button>
          <button type="button" onClick={() => navigate("settings")}>Settings</button>
        </div>
        <p className="merge-union">Union {Math.round(union * 100)}% · Friend #{friendId.toString()}</p>
        <p className="merge-hint">
          <span className="merge-desktop-hint">WASD / arrows to walk · Tap a destination · E near a station</span>
          <span className="merge-mobile-hint">Tap to walk · E / tap near a station</span>
        </p>
      </div>
      {menu && (
        <GameMenu
          title={
            menu === "buy" ? "Pulse Bench"
              : menu === "merge" ? "Synthesis Gate"
                : menu === "reward" ? "Merge result"
                  : menu === "archive" ? "Merge archive"
                    : "Settings"
          }
          onClose={busy ? undefined : () => navigate(null)}
        >
          {menu === "buy" ? (
            <>
              <p>Charge one Merge Pulse for {rf(definition.price)}. Walk it to the Synthesis Gate to attempt a merge of your Rare Friend with its artificial twin.</p>
              <table>
                <thead>
                  <tr><th>Result</th><th>Chance</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {definition.outcomes.map(item => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.chanceBps / 100}%</td>
                      <td>{rf(item.reward)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="rf-frame-primary merge-primary"
                disabled={!canBuy || busy || paused}
                onClick={() => void act(() => client.buy(1n), "purchase", () => setMessage("One simulated Merge Pulse charged to your Friend."))}
              >
                Charge one pulse · {rf(definition.price)}
              </button>
              {!canBuy && (
                <p>{snapshot.rfBalance < definition.price ? "Not enough simulated RF." : "New purchases are paused until there is enough free backing."}</p>
              )}
              <p>Every pulse reserves {rf(maxPrize)}. Purchased pulses remain usable until merged.</p>
            </>
          ) : menu === "merge" ? (
            <div className="merge-sync">
              <p>Your Rare Friend stands as the human signal. The gate holds an artificial twin. One pulse produces one merge result.</p>
              <p>{snapshot.consumables.toString()} pulses ready. {pending ? "A merge is already in progress." : "Sync is presentation only — it does not change the table."}</p>
              <div className="merge-sync-row" aria-label="Sync beats">
                {[0, 1, 2].map(index => <span key={index} className={`merge-beat${beats > index ? " on" : ""}`} />)}
              </div>
              {beats < 3 && !pending ? (
                <button
                  type="button"
                  className="rf-frame-primary merge-primary"
                  disabled={busy || paused || snapshot.consumables === 0n}
                  onClick={() => {
                    if (paused || busy) return;
                    const next = beats + 1;
                    setBeats(next);
                    void sound.current?.unlock();
                    sound.current?.play(next < 3 ? "select" : "action-ready");
                    if (reducedMotion) setBeats(3);
                  }}
                >
                  {reducedMotion ? "Skip sync" : `Tap to sync · ${beats}/3`}
                </button>
              ) : (
                <button
                  type="button"
                  className="rf-frame-primary merge-primary"
                  disabled={busy || paused || (!pending && snapshot.consumables === 0n)}
                  onClick={() => void beginMerge()}
                >
                  {pending ? "Resume pending merge" : "Open the gate"}
                </button>
              )}
            </div>
          ) : menu === "reward" && outcome ? (
            <div className="merge-reward">
              <span className="merge-mark" aria-hidden="true">{outcome.chanceBps <= 200 ? "◉" : outcome.chanceBps <= 900 ? "◎" : "○"}</span>
              <h3>{outcome.name}</h3>
              <p>{rf(outcome.reward)} · {outcome.chanceBps / 100}% chance</p>
              <p className="merge-flavor">{FLAVOR[outcome.name] ?? "The signals met."}</p>
              <p>This simulated artifact is already in your Friend's archive.</p>
              <button type="button" disabled={busy || paused} onClick={() => navigate(null)}>Keep artifact</button>
              {outcome.reward > 0n && (
                <button
                  type="button"
                  disabled={busy || paused}
                  onClick={() => void act(() => client.redeem(result!.outcomeId!, 1n), "reward", () => setMenu("archive"))}
                >
                  Redeem · {rf(outcome.reward)}
                </button>
              )}
            </div>
          ) : menu === "archive" ? (
            <>
              <p>Kept artifacts retain their fixed value with no expiry. They belong to the selected Friend.</p>
              {definition.outcomes.map((item, index) => (
                <div className="merge-item" key={item.name}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{snapshot.inventory[index].toString()} owned · {rf(item.reward)}</small>
                  </span>
                  <button
                    type="button"
                    disabled={busy || paused || snapshot.inventory[index] === 0n || item.reward === 0n}
                    onClick={() => void act(() => client.redeem(index + 1, 1n), "reward")}
                  >
                    Redeem one
                  </button>
                </div>
              ))}
            </>
          ) : menu === "settings" ? (
            <>
              <button
                type="button"
                aria-pressed={!muted}
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  sound.current?.setMuted(next);
                  if (!next) void sound.current?.unlock();
                }}
              >
                {muted ? "Sound off" : "Sound on"}
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={event => setReducedMotion(event.target.checked)}
                /> Reduce motion
              </label>
              <p>All economy actions are simulated. Reloading resets this preview. Wallet connection and ownership verification are provided by the SDK.</p>
            </>
          ) : null}
          {feedback}
        </GameMenu>
      )}
    </section>
  );
}
