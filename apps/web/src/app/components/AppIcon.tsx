import type { FC, CSSProperties, ComponentType } from 'react';
import * as Lucide from 'lucide-react';
import { ICON_ALIAS_MAP } from '@keep-accounts-app/domain';

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const getLucideIcon = (name: string): ComponentType<any> | undefined => {
  // 1. Check central domain alias map
  const mappedName = ICON_ALIAS_MAP[name];
  if (mappedName && (Lucide as any)[mappedName]) {
    return (Lucide as any)[mappedName];
  }

  // 2. Fallback to direct PascalCase conversion
  // e.g. "credit-card" -> "CreditCard"
  const pascalName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return (Lucide as any)[pascalName];
};

export const AppIcon: FC<AppIconProps> = ({
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
