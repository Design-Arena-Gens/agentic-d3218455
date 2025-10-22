"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useRef, useState } from "react";

type Choice = {
  id: string;
  label: string;
  summary: string;
  nextId?: string;
  resonance: string;
};

type NarrativeNode = {
  id: string;
  title: string;
  prompt: string;
  description: string;
  choices: Choice[];
};

type BranchStep = {
  nodeId: string;
  choiceId: string;
};

type Branch = {
  id: string;
  label: string;
  path: BranchStep[];
  currentNodeId: string | null;
};

const narrativeGraph: Record<string, NarrativeNode> = {
  origin: {
    id: "origin",
    title: "The Harmonic Crossroads",
    prompt:
      "The quantum atelier gifts you a canvas that rethreads reality. How do you begin the composition?",
    description:
      "City-sized algorithms sway overhead, waiting to resonate with a guiding intention. The path you intend to follow will ripple into parallel futures.",
    choices: [
      {
        id: "origin-logic",
        label: "Chart a crystalline logic",
        summary:
          "Architect a precise lattice of cause and effect to stabilize the city.",
        resonance: "Glasswork drones pulse with geometric certainty.",
        nextId: "logic",
      },
      {
        id: "origin-empathy",
        label: "Let empathy sculpt the frame",
        summary:
          "Invite every citizen to project feelings into the structure.",
        resonance: "A chorus of heartbeats harmonizes across quantum channels.",
        nextId: "empathy",
      },
      {
        id: "origin-chaos",
        label: "Trust the luminous chaos engine",
        summary:
          "Surrender the controls to stochastic waves and see what forms emerge.",
        resonance: "Particles bloom like auroras, skipping across dimensions.",
        nextId: "chaos",
      },
    ],
  },
  logic: {
    id: "logic",
    title: "Symmetry Architects",
    prompt:
      "Your crystalline map renders deterministic brilliance. The city seeks the next refinement.",
    description:
      "Every citizen now navigates through a lattice of predictable light. Yet a whisper of doubt questions the absence of improvisation.",
    choices: [
      {
        id: "logic-balance",
        label: "Seed deliberate anomalies",
        summary:
          "Introduce controlled imperfections to keep curiosity alive.",
        resonance:
          "Microfractures glow teal as they spawn creative detours.",
        nextId: "logic-balance",
      },
      {
        id: "logic-archive",
        label: "Archive every possible outcome",
        summary:
          "Index the future to defend against uncertainty forever.",
        resonance: "Holographic shelves swirl, indexing destinies in real time.",
        nextId: "logic-archive",
      },
    ],
  },
  empathy: {
    id: "empathy",
    title: "The Resonant Commons",
    prompt:
      "The citizens co-create waves of kindness. The fabric begins to shimmer with collective dreams.",
    description:
      "Every shared story threads a new beam of light. Perspectives entangle, yet contradictions begin to surface.",
    choices: [
      {
        id: "empathy-pulse",
        label: "Weave a planetary pulse",
        summary: "Synchronize emotions into a communal breathing ritual.",
        resonance:
          "Soft magenta tides roll through the skyline, calming restless minds.",
        nextId: "empathy-pulse",
      },
      {
        id: "empathy-mirror",
        label: "Reflect divergent truths",
        summary:
          "Project contrasting memories side-by-side to invite radical empathy.",
        resonance:
          "Mirrored timelines glitter, inviting people to walk within another's steps.",
        nextId: "empathy-mirror",
      },
    ],
  },
  chaos: {
    id: "chaos",
    title: "Entropy Conductors",
    prompt:
      "The stochastic matrix paints explosive beauty. Patterns spark and dissolve every second.",
    description:
      "Unscripted wonders appear, but fragments of the city fear the loss of anchor points.",
    choices: [
      {
        id: "chaos-fractal",
        label: "Teach citizens to surf entropy",
        summary:
          "Offer tools to ride the wave and choreograph with randomness.",
        resonance:
          "Prismatic trails form where dancers imprint footsteps on nothingness.",
        nextId: "chaos-fractal",
      },
      {
        id: "chaos-stillness",
        label: "Freeze a single perfect moment",
        summary:
          "Capture the most dazzling state and let it echo through infinity.",
        resonance:
          "A suspended bloom hums quietly, bending time into a crystalline orb.",
        nextId: "chaos-stillness",
      },
    ],
  },
  "logic-balance": {
    id: "logic-balance",
    title: "Curated Serendipity",
    prompt:
      "The lattice now hosts curated glitches where curiosity grows wild.",
    description:
      "Guided chance turns the city into a living theorem of wonder. The citizens learn to trust the gentle asymmetry.",
    choices: [],
  },
  "logic-archive": {
    id: "logic-archive",
    title: "The Vault of Every Tomorrow",
    prompt:
      "Every potential pathway is cataloged. Probability bows to the archive.",
    description:
      "Stability reigns, though the thrill of unexpectedness is dim. The city hums with confident, measured light.",
    choices: [],
  },
  "empathy-pulse": {
    id: "empathy-pulse",
    title: "A Shared Luminal Heartbeat",
    prompt:
      "Millions breathe together. The skyline sways to the rhythm of care.",
    description:
      "Conflicts soften as resonance replaces argument. The city glows in warm fractal breaths.",
    choices: [],
  },
  "empathy-mirror": {
    id: "empathy-mirror",
    title: "Hall of Divergent Echoes",
    prompt:
      "Contradictions embrace each other, creating rooms where paradox thrives.",
    description:
      "People wander through mirrored universes to discover perspectives unlike their own. Compassion multiplies.",
    choices: [],
  },
  "chaos-fractal": {
    id: "chaos-fractal",
    title: "Surfing the Infinite",
    prompt:
      "Citizens choreograph unrepeatable dances, mastering the rhythm of entropy.",
    description:
      "With newfound fluency, the city becomes a playground of empowered improvisation.",
    choices: [],
  },
  "chaos-stillness": {
    id: "chaos-stillness",
    title: "The Captured Bloom",
    prompt:
      "Time bends around a single perfect state, preserved like a living reliquary.",
    description:
      "The city gathers beneath the frozen aurora, mesmerized by a beauty that may never evolve again.",
    choices: [],
  },
};

const branchPalette = [
  "#5eead4",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#a855f7",
  "#34d399",
];

const quantumIntro = [
  "Trace the ripples between intention and improvisation.",
  "Compare futures as they bloom in parallel light.",
  "Split reality as often as you wish; the canvas adapts.",
];

const makeBranchId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `branch-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;

const getBranchLabel = (index: number) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const primary = alphabet[index % alphabet.length];
  const tier = Math.floor(index / alphabet.length);
  return tier === 0 ? `Timeline ${primary}` : `Timeline ${primary}${tier}`;
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const createParticleField = (count: number) => {
  const random = mulberry32(123456);
  return Array.from({ length: count }).map((_, index) => ({
    id: `particle-${index}`,
    top: `${random() * 100}%`,
    left: `${random() * 100}%`,
    delay: `${random() * 10}s`,
    duration: `${18 + random() * 12}s`,
    scale: 0.6 + random() * 1.2,
  }));
};

const particlesField = createParticleField(24);

export default function Home() {
  const [branches, setBranches] = useState<Branch[]>(() => [
    {
      id: "branch-root",
      label: getBranchLabel(0),
      path: [],
      currentNodeId: "origin",
    },
  ]);
  const branchCounterRef = useRef(1);
  const particles = particlesField;

  const handleChoice = useCallback((branchId: string, choice: Choice) => {
    setBranches((previous) =>
      previous.map((branch) => {
        if (branch.id !== branchId) return branch;
        const nextNode = choice.nextId ?? null;
        const currentNodeId = branch.currentNodeId;
        if (!currentNodeId) return branch;
        return {
          ...branch,
          path: [...branch.path, { nodeId: currentNodeId, choiceId: choice.id }],
          currentNodeId: nextNode,
        };
      }),
    );
  }, []);

  const handleSplit = useCallback((branchId: string) => {
    setBranches((previous) => {
      const source = previous.find((branch) => branch.id === branchId);
      if (!source) return previous;
      const label = getBranchLabel(branchCounterRef.current);
      branchCounterRef.current += 1;
      const clone: Branch = {
        id: makeBranchId(),
        label,
        path: [...source.path],
        currentNodeId: source.currentNodeId,
      };
      return [...previous, clone];
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <QuantumBackground particles={particles} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="relative px-6 pb-10 pt-16 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-slate-950/40 p-8 backdrop-blur-3xl sm:p-12">
              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                    Parallel Dialogue Studio
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Quantum Choice Observatory
                  </h1>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
                  Explore Divergent Timelines
                </span>
              </div>
              <div className="grid gap-4 text-base text-slate-300 sm:grid-cols-3 sm:gap-6">
                {quantumIntro.map((line) => (
                  <p
                    key={line}
                    className="rounded-3xl border border-slate-700/40 bg-slate-900/40 p-4 leading-relaxed shadow-[0_24px_80px_-60px_rgba(56,189,248,0.6)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-10 flex-1 px-6 pb-16 sm:px-12 lg:px-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_60px_140px_-80px_rgba(96,165,250,0.45)] backdrop-blur-2xl sm:p-10">
              <div className="quantum-thread" />
              <div className="flex flex-col gap-8 sm:gap-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Active Universes
                    </h2>
                    <p className="mt-1 text-sm text-slate-300 sm:text-base">
                      Duplicate a timeline at any decision to compare how each
                      path refracts intention.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900/70 px-4 py-2 text-xs font-medium tracking-[0.2em] text-slate-400">
                    {branches.length} OPEN STATES
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex min-h-[28rem] gap-6 overflow-x-auto rounded-3xl pb-6">
                    {branches.map((branch, index) => (
                      <BranchColumn
                        key={branch.id}
                        branch={branch}
                        index={index}
                        onSplit={handleSplit}
                        onChoose={handleChoice}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

type BackgroundProps = {
  particles: {
    id: string;
    top: string;
    left: string;
    delay: string;
    duration: string;
    scale: number;
  }[];
};

function QuantumBackground({ particles }: BackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,255,0.25),transparent_55%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.32),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.28),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(2,6,23,0.92))]" />
      <div className="absolute inset-0 mix-blend-screen opacity-60">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="quantum-particle"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              transform: `scale(${particle.scale})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

type BranchColumnProps = {
  branch: Branch;
  index: number;
  onSplit: (branchId: string) => void;
  onChoose: (branchId: string, choice: Choice) => void;
};

function BranchColumn({
  branch,
  index,
  onSplit,
  onChoose,
}: BranchColumnProps) {
  const accent = branchPalette[index % branchPalette.length];
  const activeNode = branch.currentNodeId
    ? narrativeGraph[branch.currentNodeId]
    : null;

  const projectGlow = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--x", `${x}%`);
    event.currentTarget.style.setProperty("--y", `${y}%`);
  };

  const resetGlow = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.removeProperty("--x");
    event.currentTarget.style.removeProperty("--y");
  };

  return (
    <article
      className="quantum-card group relative flex min-w-[320px] flex-1 flex-col gap-6 border-white/15"
      style={{ "--branch-accent": accent } as CSSProperties}
      data-active={Boolean(activeNode)}
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {branch.label}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {branch.currentNodeId
              ? narrativeGraph[branch.currentNodeId].title
              : "Resolved Horizon"}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onSplit(branch.id)}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition duration-300 hover:bg-white/15 hover:text-white"
        >
          Split
        </button>
      </header>

      <ul className="relative flex flex-col gap-4 border-l border-slate-500/40 pl-5">
        {branch.path.length === 0 && (
          <li className="relative">
            <span className="absolute -left-[23px] top-1 h-10 w-10 rounded-full border border-white/15 bg-white/10 shadow-[0_0_40px_-12px_rgba(96,165,250,0.65)]" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Zero Point
              </p>
              <p className="mt-2 text-base text-slate-200">
                Decision horizon awaiting its first ripple.
              </p>
            </div>
          </li>
        )}
        {branch.path.map((step) => {
          const node = narrativeGraph[step.nodeId];
          const choice = node.choices.find((item) => item.id === step.choiceId);
          if (!choice) {
            return null;
          }
          return (
            <li key={step.choiceId} className="relative">
              <span className="absolute -left-[23px] top-1 h-10 w-10 rounded-full border border-white/15 bg-white/10 shadow-[0_0_42px_-12px_rgba(94,234,212,0.55)]" />
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                  {node.title}
                </p>
                <h4 className="text-lg font-semibold text-white">
                  {choice.label}
                </h4>
                <p className="text-sm text-slate-200/90">{choice.summary}</p>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  {choice.resonance}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {activeNode ? (
        <div className="space-y-6 rounded-3xl border border-white/15 bg-black/40 p-6 shadow-[0_60px_120px_-90px_rgba(56,189,248,0.8)] backdrop-blur-2xl transition duration-500 group-hover:border-white/25 group-hover:bg-black/35">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {activeNode.title}
            </p>
            <p className="text-base text-slate-200">{activeNode.prompt}</p>
            <p className="text-sm text-slate-400">{activeNode.description}</p>
          </div>
          {activeNode.choices.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activeNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="quantum-choice text-left text-sm text-slate-100"
                  onClick={() => onChoose(branch.id, choice)}
                  onMouseMove={projectGlow}
                  onMouseLeave={resetGlow}
                >
                  <span className="block text-xs uppercase tracking-[0.28em] text-slate-300">
                    {choice.label}
                  </span>
                  <span className="mt-1 block text-sm text-slate-200">
                    {choice.summary}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {choice.resonance}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-slate-700/40 bg-slate-900/60 p-4 text-center text-sm uppercase tracking-[0.32em] text-slate-300">
              Timeline settled. Split to revisit another inflection.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm uppercase tracking-[0.34em] text-slate-200">
          Timeline resolved. Duplicate this universe to explore a new angle.
        </div>
      )}
    </article>
  );
}
