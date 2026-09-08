import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Bezel, Button, Eyebrow, Reveal, WindowMark } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Interne Übersicht der Design-Tokens und UI-Primitives.',
  // Internal reference page — never part of the public index.
  robots: { index: false, follow: false },
};

/* -------------------------------------------------------------------------
   Local scaffolding. These helpers exist only to lay out the styleguide and
   are not part of the design system.
   ------------------------------------------------------------------------- */

function Section({
  eyebrow,
  title,
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="border-t border-t-brand-050 pt-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-title-lg">{title}</h2>
      {note ? (
        <p className="mt-3 max-w-copy text-body-sm text-neutral-500">
          {note}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </Reveal>
  );
}

function Token({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <code className="font-mono text-micro text-brand-700">{name}</code>
      <span className="font-mono text-micro text-neutral-400">{value}</span>
    </div>
  );
}

function Swatch({
  name,
  value,
  contrast,
  className,
}: {
  name: string;
  value: string;
  contrast: string;
  className: string;
}) {
  return (
    <Bezel radius="sm" inset="sm" elevation="sm" innerClassName="p-1.5">
      {/* Third concentric step, written out: shell 20px − inset 4px = core
          16px, minus the core's own 6px padding = 10px. */}
      <div className={`h-20 rounded-[0.625rem] ${className}`} />
      <div className="px-2.5 pb-1.5 pt-3">
        <Token name={name} value={value} />
        <p className="mt-1.5 text-micro text-neutral-500">{contrast}</p>
      </div>
    </Bezel>
  );
}

/* ------------------------------------------------------------------------- */

const COLORS = [
  {
    name: '--color-brand-900',
    value: '#14547e',
    className: 'bg-brand-900',
    contrast: '7.9:1 auf Paper — AAA',
  },
  {
    name: '--color-brand-700',
    value: '#1c6b9c',
    className: 'bg-brand-700',
    contrast: '5.6:1 auf Paper — AA',
  },
  {
    name: '--color-brand-500',
    value: '#2e86c1',
    className: 'bg-brand-500',
    contrast: '3.9:1 — Fokusring, nur Nicht-Text',
  },
  {
    name: '--color-brand-300',
    value: '#45b3e7',
    className: 'bg-brand-300',
    contrast: '2.3:1 — Akzent, nie auf Text angewendet',
  },
  {
    name: '--color-brand-050',
    value: '#eaf4fa',
    className: 'bg-brand-050',
    contrast: 'Flächen, Hover, Bezel-Hülle',
  },
  {
    name: '--color-neutral-700',
    value: '#4a4d50',
    className: 'bg-neutral-700',
    contrast: '8.3:1 auf Paper — Fließtext',
  },
  {
    name: '--color-neutral-500',
    value: '#6a6e72',
    className: 'bg-neutral-500',
    contrast: '5.0:1 auf Paper — kleinster AA-sicherer Grauton',
  },
  {
    name: '--color-neutral-400',
    value: '#8a8f94',
    className: 'bg-neutral-400',
    contrast: '3.2:1 — nicht für Fließtext',
  },
  {
    name: '--color-ink',
    value: '#0f1b24',
    className: 'bg-ink',
    contrast: '17.0:1 auf Paper — Headlines',
  },
  {
    name: '--color-paper',
    value: '#fbfcfd',
    className: 'bg-paper',
    contrast: 'Seitenhintergrund, kein reines Weiß',
  },
];

const TYPE_SCALE = [
  { cls: 'text-display', name: '--text-display', spec: 'clamp 48 → 96 px · 500 · −0.035em' },
  { cls: 'text-title-xl', name: '--text-title-xl', spec: 'clamp 38 → 64 px · 500 · −0.03em' },
  { cls: 'text-title-lg', name: '--text-title-lg', spec: 'clamp 30 → 46 px · 500 · −0.025em' },
  { cls: 'text-title-md', name: '--text-title-md', spec: 'clamp 22 → 28 px · 500 · −0.018em' },
  { cls: 'text-title-sm', name: '--text-title-sm', spec: '18 px · 500 · −0.012em' },
  { cls: 'text-lead', name: '--text-lead', spec: 'clamp 18 → 21 px · 400 · 1.55' },
  { cls: 'text-body', name: '--text-body', spec: '17 px · 400 · 1.65 — Lesegröße' },
  { cls: 'text-body-sm', name: '--text-body-sm', spec: '15 px · 400 · 1.6' },
  { cls: 'text-micro', name: '--text-micro', spec: '13 px · 400 · 1.45' },
];

const SPACING = [
  { name: '--spacing-section', value: '6rem', util: 'py-section', px: 96 },
  { name: '--spacing-section-md', value: '7.5rem', util: 'py-section-md', px: 120 },
  { name: '--spacing-section-lg', value: '9rem', util: 'py-section-lg', px: 144 },
  { name: '--spacing-section-xl', value: '10rem', util: 'py-section-xl', px: 160 },
];

const SHADOWS = [
  { name: '--shadow-ambient-xs', cls: 'shadow-[var(--shadow-ambient-xs)]' },
  { name: '--shadow-ambient-sm', cls: 'shadow-[var(--shadow-ambient-sm)]' },
  { name: '--shadow-ambient-md', cls: 'shadow-[var(--shadow-ambient-md)]' },
  { name: '--shadow-ambient-lg', cls: 'shadow-[var(--shadow-ambient-lg)]' },
  { name: '--shadow-ambient-xl', cls: 'shadow-[var(--shadow-ambient-xl)]' },
  { name: '--shadow-ambient-brand', cls: 'shadow-[var(--shadow-ambient-brand)]' },
];

const RADII = [
  { radius: 'sm' as const, name: '--radius-bezel-sm', outer: '20 px' },
  { radius: 'md' as const, name: '--radius-bezel-md', outer: '32 px' },
  { radius: 'lg' as const, name: '--radius-bezel-lg', outer: '40 px' },
  { radius: 'xl' as const, name: '--radius-bezel-xl', outer: '48 px' },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-shell px-gutter py-section lg:px-gutter-lg">
      <header className="max-w-copy">
        <Eyebrow>Interne Referenz</Eyebrow>
        <h1 className="mt-6 text-display">Design-System</h1>
        <p className="mt-8 text-lead text-neutral-700">
          Alle Tokens und Primitives für die Website der Imperial
          Gebäudeservice GmbH. Diese Seite ist die verbindliche Referenz — was
          hier nicht steht, wird nicht verwendet.
        </p>
        <p className="mt-4 text-body-sm text-neutral-500">
          Hell, kein Dark Mode. Eine Schrift (Geist), eine Icon-Familie
          (Phosphor Light), zwei Easing-Kurven.
        </p>
      </header>

      <div className="mt-24 flex flex-col gap-24">
        <Section
          eyebrow="Farbe"
          title="Markenpalette"
          note="Akzentblau bleibt sparsam: CTA-Hover, aktive States, Icon-Details — nie als Fläche. Kontraste sind gegen --color-paper gerechnet."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {COLORS.map((color) => (
              <Swatch key={color.name} {...color} />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Typografie"
          title="Geist, eine Familie"
          note="Hierarchie entsteht über Gewicht und Laufweite, nicht über einen zweiten Schnitt. Display-Größen sind fluid, Lesegrößen fest — so bleibt die Zeilenlänge über alle Breakpoints kalkulierbar."
        >
          <div className="flex flex-col gap-8">
            {TYPE_SCALE.map((step) => (
              <div
                key={step.name}
                className="flex flex-col gap-2 border-t border-t-brand-050 pt-6 first:border-t-0 first:pt-0"
              >
                <Token name={step.name} value={step.spec} />
                <p className={`${step.cls} text-ink`}>
                  Zuverlässige Gebäudereinigung
                </p>
              </div>
            ))}

            <div className="flex flex-col gap-2 border-t border-t-brand-050 pt-6">
              <Token
                name="--text-eyebrow"
                value="10 px · 500 · 0.2em — via <Eyebrow>"
              />
              <div>
                <Eyebrow>Unterhaltsreinigung</Eyebrow>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-t-brand-050 pt-6">
              <Token
                name="font-variant-numeric: tabular-nums"
                value="automatisch auf table, time und [data-numeric]"
              />
              <p className="text-title-md text-ink" data-numeric>
                10.000.000 € · 07:00–18:00 · 47051
              </p>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Abstand"
          title="Makro-Whitespace"
          note="Benannte Section-Rhythmen statt Ad-hoc-Zahlen pro Datei. py-section entspricht py-24, py-section-xl entspricht py-40."
        >
          <div className="flex flex-col gap-4">
            {SPACING.map((step) => (
              <div key={step.name} className="flex items-center gap-5">
                <div
                  className="h-3 shrink-0 rounded-pill bg-brand-300/40"
                  style={{ width: `${step.px}px` }}
                />
                <Token name={step.name} value={`${step.value} · ${step.util}`} />
              </div>
            ))}
            <div className="mt-4 flex flex-col gap-1">
              <Token name="--container-shell" value="78rem · max-w-shell" />
              <Token
                name="--container-copy"
                value="40rem · max-w-copy — ca. 72 Zeichen"
              />
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Tiefe"
          title="Ambient-Schatten"
          note="Ausschließlich weit gestreute, tintengetönte Schatten mit niedriger Deckkraft. Kein shadow-md, keine harten Drops. Hairlines sind Inset-Ringe, keine 1px-grauen Borders."
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {SHADOWS.map((shadow) => (
              <div key={shadow.name} className="flex flex-col gap-4">
                <div
                  className={`h-28 rounded-bezel-md bg-white ${shadow.cls}`}
                />
                <Token name={shadow.name} value="" />
              </div>
            ))}
            <div className="flex flex-col gap-4">
              <div className="h-28 rounded-bezel-md bg-white shadow-[var(--shadow-hairline)]" />
              <Token name="--shadow-hairline" value="inset ring, ink 6 %" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-28 rounded-bezel-md bg-brand-050 shadow-[var(--shadow-hairline-brand)]" />
              <Token
                name="--shadow-hairline-brand"
                value="inset ring, brand 12 %"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-28 rounded-bezel-md bg-white shadow-[var(--shadow-bevel),var(--shadow-hairline)]" />
              <Token name="--shadow-bevel" value="inset Lichtkante oben" />
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Geometrie"
          title="Squircle-Radien und Double-Bezel"
          note="Der Kern-Radius wird konzentrisch aus der Hülle berechnet: core = shell − inset. Damit bleiben die Ecken bei jeder Kombination aus Radius und Rahmenbreite exakt parallel."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {RADII.map((item) => (
              <Bezel
                key={item.radius}
                radius={item.radius}
                elevation="md"
                innerClassName="flex h-40 flex-col justify-end p-6"
              >
                <Token name={item.name} value={item.outer} />
                <p className="mt-2 text-micro text-neutral-500">
                  Kern: calc({item.outer} − 6 px)
                </p>
              </Bezel>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Bezel tone="paper" innerClassName="p-7">
              <h3 className="text-title-sm">tone=&quot;paper&quot;</h3>
              <p className="mt-2 text-body-sm text-neutral-500">
                Standard. Getönte Hülle, weißer Kern mit Lichtkante.
              </p>
            </Bezel>
            <Bezel tone="tinted" innerClassName="p-7">
              <h3 className="text-title-sm">tone=&quot;tinted&quot;</h3>
              <p className="mt-2 text-body-sm text-neutral-500">
                Ruhiger Blaublock für eingelassene Panels.
              </p>
            </Bezel>
            <Bezel tone="ink" elevation="lg" innerClassName="p-7">
              <h3 className="text-title-sm text-paper">tone=&quot;ink&quot;</h3>
              <p className="mt-2 text-body-sm text-brand-050/80">
                Dunkles Panel für den Abschluss-CTA.
              </p>
            </Bezel>
          </div>

          <div className="mt-8 flex flex-wrap gap-6">
            {(['sm', 'md', 'lg'] as const).map((inset) => (
              <Bezel
                key={inset}
                inset={inset}
                elevation="sm"
                innerClassName="grid h-24 w-40 place-items-center"
              >
                <Token
                  name={`inset="${inset}"`}
                  value={
                    inset === 'sm' ? '4 px' : inset === 'md' ? '6 px' : '8 px'
                  }
                />
              </Bezel>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Bewegung"
          title="Zwei Kurven, drei Dauern"
          note="Kein linear, kein ease-in-out. Animiert werden ausschließlich transform und opacity. Die Skala steht doppelt — als CSS-Variablen hier und als JS-Werte in lib/motion.ts, weil Motion Sekunden liest; wer eine ändert, ändert beide. Unter prefers-reduced-motion werden alle Reveals und Springs abgeschaltet — Inhalte rendern dann ohne versteckten Ausgangszustand."
        >
          <div className="flex flex-col gap-1">
            <Token name="--ease-imperial" value="cubic-bezier(0.32, 0.72, 0, 1)" />
            <Token
              name="--ease-imperial-soft"
              value="cubic-bezier(0.22, 1, 0.36, 1)"
            />
            <div className="h-4" />
            <Token
              name="--duration-swift"
              value="200 ms — jeder Hover und Fokus, ausnahmslos: Farbe, Schatten, Karten-Lift"
            />
            <Token
              name="--duration-base"
              value="420 ms — ein Zustand, den der Nutzer geändert hat"
            />
            <Token
              name="--duration-slow"
              value="760 ms — inszenierte Auftritte, Scroll-Reveals"
            />
          </div>
        </Section>

        <Section
          eyebrow="Primitives"
          title="Button"
          note="Die Magnetik sitzt auf einer äußeren Hülle, das interaktive Element bleibt ein echtes <button> beziehungsweise <Link>. Der Pfeil sitzt immer in seinem eigenen runden Wrapper und läuft dem Zeiger leicht voraus. Nur mit Maus aktiv, nie bei Touch oder reduzierter Bewegung."
        >
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-center gap-5">
              <Button href="#angebot">Angebot anfordern</Button>
              <Button href="#leistungen" variant="secondary">
                Leistungen ansehen
              </Button>
              <Button href="#kontakt" variant="ghost">
                Weitere Kontaktwege
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <Button size="md">Größe md</Button>
              <Button size="md" variant="secondary">
                Größe md
              </Button>
              <Button size="md" variant="secondary" icon={null}>
                Ohne Icon
              </Button>
              <Button size="md" variant="secondary" magnetic={false}>
                Ohne Magnetik
              </Button>
              <Button size="md" disabled>
                Deaktiviert
              </Button>
            </div>

            <Bezel tone="ink" elevation="lg" innerClassName="p-10">
              <h3 className="max-w-copy text-title-md text-paper">
                Auf dunklem Panel behält der primäre Button seinen Kontrast.
              </h3>
              <div className="mt-8 flex flex-wrap gap-5">
                <Button href="#angebot" variant="secondary">
                  Angebot anfordern
                </Button>
              </div>
            </Bezel>
          </div>
        </Section>

        <Section
          eyebrow="Primitives"
          title="Eyebrow"
          note="Steht vor jeder H2. Der Marker ist das Fenster-Raster aus dem Logo-Icon — das Motiv der Marke statt eines generischen Punkts."
        >
          <div className="flex flex-wrap items-center gap-8">
            <Eyebrow>Variante pill</Eyebrow>
            <Eyebrow variant="bare">Variante bare</Eyebrow>
            <Eyebrow variant="bare" showMark={false}>
              Ohne Marker
            </Eyebrow>
            <span className="flex items-center gap-3 text-neutral-400">
              <WindowMark className="size-6 text-brand-500" />
              <code className="font-mono text-micro">&lt;WindowMark /&gt;</code>
            </span>
          </div>
        </Section>

        <Section
          eyebrow="Primitives"
          title="Reveal"
          note="Scroll-Reveal über Motions whileInView, das intern auf IntersectionObserver läuft — nie über einen Scroll-Listener. Jede Section dieser Seite ist bereits ein Reveal; die Karten unten sind zusätzlich gestaffelt."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {['delay 0', 'delay 0.08', 'delay 0.16'].map((label, index) => (
              <Reveal key={label} delay={index * 0.08}>
                <Bezel elevation="md" innerClassName="grid h-36 place-items-center">
                  <code className="font-mono text-micro text-brand-700">
                    {label}
                  </code>
                </Bezel>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
