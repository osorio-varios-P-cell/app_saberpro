export type AreaId = "matematicas" | "lectura" | "ciencias" | "sociales" | "ingles";

export interface Area {
  id: AreaId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
}

export const AREAS: Area[] = [
  {
    id: "matematicas",
    name: "Matemáticas",
    shortName: "Mat",
    color: "#4C9BE8",
    icon: "calculator",
    description: "Álgebra, geometría y estadística",
  },
  {
    id: "lectura",
    name: "Lectura Crítica",
    shortName: "LC",
    color: "#9B59B6",
    icon: "book",
    description: "Comprensión e interpretación de textos",
  },
  {
    id: "ciencias",
    name: "Ciencias Naturales",
    shortName: "CN",
    color: "#27AE60",
    icon: "flask",
    description: "Física, química y biología",
  },
  {
    id: "sociales",
    name: "Sociales y Ciudadanas",
    shortName: "SC",
    color: "#F5A623",
    icon: "globe",
    description: "Historia, geografía y constitución",
  },
  {
    id: "ingles",
    name: "Inglés",
    shortName: "Ing",
    color: "#E94560",
    icon: "chatbubbles",
    description: "Comprensión lectora en inglés",
  },
];

export function getArea(id: AreaId): Area {
  return AREAS.find((a) => a.id === id) ?? AREAS[0];
}
