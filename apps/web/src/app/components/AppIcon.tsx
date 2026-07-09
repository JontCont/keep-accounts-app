import React from 'react';
import * as Lucide from 'lucide-react';

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Pre-defined friendly alias map for easy lookups
const iconMap: Record<string, React.ComponentType<any>> = {
  // Navigation Tabs
  'home': Lucide.Home,
  'book-open': Lucide.BookOpen,
  'bar-chart': Lucide.BarChart2,
  'settings': Lucide.Settings,

  // Default Account Groups
  'credit-card': Lucide.CreditCard,
  'trending-up': Lucide.TrendingUp,
  'piggy-bank': Lucide.PiggyBank,

  // Actions
  'plus': Lucide.Plus,
  'trash': Lucide.Trash2,
  'edit': Lucide.Edit2,
  'close': Lucide.X,
  'database': Lucide.Database,
  'download': Lucide.Download,
  'upload': Lucide.Upload,
  'refresh': Lucide.RefreshCw,
  'check-circle': Lucide.CheckCircle2,
  'alert-triangle': Lucide.AlertTriangle,
  'layout-template': Lucide.LayoutTemplate,
  'trash-2': Lucide.Trash2,

  // Default Categories
  'shopping-cart': Lucide.ShoppingCart,
  'coffee': Lucide.Coffee,
  'car': Lucide.Car,
  'film': Lucide.Film,
  'briefcase': Lucide.Briefcase,
  'arrow-up-right': Lucide.ArrowUpRight,
  'arrow-down-left': Lucide.ArrowDownLeft,
};

const getLucideIcon = (name: string): React.ComponentType<any> | undefined => {
  // 1. Check alias map
  if (iconMap[name]) return iconMap[name];

  // 2. Check direct case-insensitive match or PascalCase conversion
  // e.g. "credit-card" -> "CreditCard"
  const pascalName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return (Lucide as any)[pascalName];
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  className,
  style,
}) => {
  const IconComponent = getLucideIcon(name);

  if (IconComponent) {
    return <IconComponent size={size} className={className} style={style} />;
  }

  // Fallback to raw string / Unicode emoji
  return (
    <span
      className={className}
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block',
        ...style,
      }}
    >
      {name}
    </span>
  );
};

export default AppIcon;
