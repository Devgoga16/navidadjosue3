import { useState, useEffect } from "react";

interface BibleVerseProps {
  className?: string;
  interval?: number; // En milisegundos, default 10 segundos
}

export default function BibleVerse({
  className = "",
  interval = 10000, // 10 segundos por defecto
}: BibleVerseProps) {
  const [currentVerse, setCurrentVerse] = useState(() => getRandomVerse());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVerse(getRandomVerse());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div
      className={`text-center italic text-sm py-3 px-4 bg-gradient-to-r from-blue-900/40 to-slate-900/40 rounded-lg border border-blue-500/20 backdrop-blur-sm transition-all duration-500 ${className}`}
    >
      <p className="mb-1 text-blue-200">"{currentVerse.verse}"</p>
      <p className="text-xs font-semibold text-blue-300/70">— {currentVerse.reference}</p>
    </div>
  );
}

// ============================================================
// AGREGA TUS VERSÍCULOS BÍBLICOS AQUÍ
// ============================================================
// Cada versículo debe tener: verse (el texto), reference (la cita), y theme (opcional)
// ============================================================

export const familiaJosueVerses = [
  {
    verse:
      "¡Mira qué bueno y qué agradable es que los hermanos convivan en armonía!",
    reference: "Salmos 133:1",
    theme: "harmony",
  },
  {
    verse: "Amados, amémonos unos a otros, porque el amor viene de Dios.",
    reference: "1 Juan 4:7",
    theme: "love",
  },
  {
    verse:
      "Un solo cuerpo, un solo Espíritu, así como fuisteis llamados en una misma esperanza de vuestra vocación.",
    reference: "Efesios 4:4",
    theme: "unity",
  },
  {
    verse:
      "No tengan miedo. Les anuncio una gran alegría, que es para todo el pueblo.",
    reference: "Lucas 2:10",
    theme: "christmas",
  },
  {
    verse:
      "Y sobre todo esto, vístanse de amor, que es lo que nos une perfectamente.",
    reference: "Colosenses 3:14",
    theme: "love",
  },
  {
    verse:
      "Celebren juntos con gozo porque el Señor los ha hecho de un mismo corazón y de una misma alma.",
    reference: "Filipenses 2:2",
    theme: "celebration",
  },
  {
    verse:
      "Que la paz de Cristo reine en vuestros corazones, a la cual asimismo fuisteis llamados en un solo cuerpo.",
    reference: "Colosenses 3:15",
    theme: "peace",
  },
  {
    verse:
      "Porque donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.",
    reference: "Mateo 18:20",
    theme: "unity",
  },
];

// ============================================================
// FIN DE LA SECCIÓN DE VERSÍCULOS
// ============================================================

export function getVerseByTheme(theme: string) {
  const filtered = familiaJosueVerses.filter((v) => v.theme === theme);
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : familiaJosueVerses[Math.floor(Math.random() * familiaJosueVerses.length)];
}

export function getRandomVerse() {
  return familiaJosueVerses[
    Math.floor(Math.random() * familiaJosueVerses.length)
  ];
}
