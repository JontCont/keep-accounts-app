import type { CSSProperties, FC, ReactNode } from 'react';

interface SharedTableRowProps {
  children: ReactNode;
  className?: string;
  dataTestId?: string;
  style?: CSSProperties;
}

export const SharedTableRow: FC<SharedTableRowProps> = ({
  children,
  className,
  dataTestId,
  style,
}) => (
  <div
    className={`shared-table-row${className ? ` ${className}` : ''}`}
    data-testid={dataTestId}
    style={style}
  >
    {children}
  </div>
);
