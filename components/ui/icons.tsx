import React from "react";
import {
  Eye, BrainCircuit, GitMerge, Scale, Database, Users, Mic, Lightbulb, Dice3, Hand,
  BadgePercent, HeartPulse, TrendingUp, Smile, AlertTriangle, MousePointerClick, Target,
  Search, PieChart, Building, Cpu, MessageSquare, Video, ClipboardCheck, Gauge, ShieldAlert,
  Clock, Gavel, Shapes
} from "lucide-react";

// Color Mapping for Bias Categories
export const categoryColors: Record<string, string> = {
  Perception: "var(--neon-cyan)",
  Cognition: "var(--neon-orange)",
  Décision: "var(--neon-purple)",
  Mémoire: "var(--neon-yellow)",
  Social: "var(--accent)",
  "UX Law": "var(--neon-green)",
  Persuasion: "var(--neon-red)",
  "Dark Pattern": "var(--destructive)",
  Organisation: "var(--primary)",
  Métacognition: "var(--info)",
  Probabilité: "var(--accent)",
  Possession: "var(--success)",
  Pricing: "var(--warning)",
  Addiction: "var(--neon-orange)",
  Motivation: "var(--neon-green)",
  Émotion: "var(--destructive)",
  Attention: "var(--neon-cyan)",
  Technologie: "var(--neon-purple)",
  Communication: "var(--neon-yellow)",
  Projection: "var(--warning)",
  Méthodologie: "var(--success)",
  Métriques: "var(--primary)",
  Risque: "var(--destructive)",
  Estimation: "var(--neon-green)",
  Jugement: "var(--neon-purple)",
  Analyse: "var(--muted-foreground)",
  Recherche: "var(--info)",
  Comportement: "var(--warning)",
};

// Icon Mapping for Bias Categories
const iconMap: { [key: string]: React.ElementType } = {
  Perception: Eye,
  Cognition: BrainCircuit,
  Décision: GitMerge,
  "UX Law": Scale,
  Mémoire: Database,
  Social: Users,
  Persuasion: Mic,
  Métacognition: Lightbulb,
  Probabilité: Dice3,
  Possession: Hand,
  Pricing: BadgePercent,
  Addiction: HeartPulse,
  Motivation: TrendingUp,
  Émotion: Smile,
  "Dark Pattern": AlertTriangle,
  Comportement: MousePointerClick,
  Attention: Target,
  Recherche: Search,
  Analyse: PieChart,
  Organisation: Building,
  Technologie: Cpu,
  Communication: MessageSquare,
  Projection: Video,
  Méthodologie: ClipboardCheck,
  Métriques: Gauge,
  Risque: ShieldAlert,
  Estimation: Clock,
  Jugement: Gavel,
};

export const BiasCategoryIcon = ({ category, className, title, style }: { category: string, className?: string, title?: string, style?: React.CSSProperties }) => {
  const Icon = iconMap[category] || Shapes;
  return (
    <>
      <Icon className={className || "w-4 h-4"} style={style} aria-hidden="true" />
      {title && <span className="sr-only">{title}</span>}
    </>
  );
};
