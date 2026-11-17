import React from 'react';
import { AspirationStatus } from '@prisma/client';
import { STATUS_META } from '@/lib/constants';
import { Clock, RefreshCw, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: AspirationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const meta = STATUS_META[status] || STATUS_META.DITERIMA;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 13 : 15;
    switch (status) {
      case 'DITERIMA':
        return <Clock size={iconSize} className="shrink-0" />;
      case 'DIPROSES':
        return <RefreshCw size={iconSize} className="shrink-0" />;
      case 'DITINDAKLANJUTI':
        return <ArrowUpRight size={iconSize} className="shrink-0" />;
      case 'SELESAI':
        return <CheckCircle2 size={iconSize} className="shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-normal ${meta.badgeClass} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
      {showIcon && getIcon()}
      <span className="tracking-tight">{meta.label}</span>
    </span>
  );
}
