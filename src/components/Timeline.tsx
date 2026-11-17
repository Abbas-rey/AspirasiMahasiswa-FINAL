import React from 'react';
import { AspirationStatus } from '@prisma/client';
import { STATUS_META } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { Clock, RefreshCw, ArrowUpRight, CheckCircle2, MessageSquare, ShieldCheck, User } from 'lucide-react';

export interface TimelineLogItem {
  id: string;
  status: AspirationStatus;
  note?: string | null;
  updated_by_name: string;
  changed_at: string | Date;
}

export interface TimelineResponseItem {
  id: string;
  response_text: string;
  responded_at: string | Date;
  responder?: {
    name: string;
    role?: string;
    scope_level?: string | null;
  };
}

interface TimelineProps {
  logs: TimelineLogItem[];
  responses?: TimelineResponseItem[];
  currentStatus: AspirationStatus;
}

export function Timeline({ logs, responses = [], currentStatus }: TimelineProps) {
  // Combine logs and responses sorted chronologically
  const items: Array<{
    id: string;
    type: 'log' | 'response';
    date: Date;
    status?: AspirationStatus;
    note?: string | null;
    author: string;
    subAuthor?: string;
  }> = [];

  logs.forEach((log) => {
    items.push({
      id: `log-${log.id}`,
      type: 'log',
      date: new Date(log.changed_at),
      status: log.status,
      note: log.note,
      author: log.updated_by_name || 'Petugas Peninjau',
      subAuthor: 'Pembaruan Status Laporan',
    });
  });

  responses.forEach((resp) => {
    items.push({
      id: `resp-${resp.id}`,
      type: 'response',
      date: new Date(resp.responded_at),
      note: resp.response_text,
      author: resp.responder?.name || 'Tanggapan Resmi Akademisi',
      subAuthor: resp.responder?.scope_level
        ? `Unit ${resp.responder.scope_level}`
        : 'Tanggapan Resmi Pengelola',
    });
  });

  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  const getStepIcon = (status?: AspirationStatus, type?: 'log' | 'response') => {
    if (type === 'response') {
      return <MessageSquare size={12} className="text-zinc-700" />;
    }
    switch (status) {
      case 'DITERIMA':
        return <Clock size={12} className="text-zinc-600" />;
      case 'DIPROSES':
        return <RefreshCw size={12} className="text-zinc-700" />;
      case 'DITINDAKLANJUTI':
        return <ArrowUpRight size={12} className="text-zinc-800" />;
      case 'SELESAI':
        return <CheckCircle2 size={12} className="text-zinc-950" />;
      default:
        return <ShieldCheck size={12} className="text-zinc-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
      {items.map((item, idx) => {
        const isLatest = idx === items.length - 1;
        const meta = item.status ? STATUS_META[item.status] : null;

        return (
          <div key={item.id} className="relative">
            {/* Dot / Icon */}
            <div
              className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ring-1 ${
                isLatest
                  ? 'bg-zinc-900 ring-zinc-900 text-white'
                  : 'bg-zinc-100 ring-zinc-200 text-zinc-700'
              }`}
            >
              {item.type === 'response' ? (
                <MessageSquare size={11} className={isLatest ? 'text-white' : 'text-zinc-700'} />
              ) : (
                getStepIcon(item.status, item.type)
              )}
            </div>

            {/* Content Card */}
            <div
              className={`p-3.5 rounded-lg border transition-colors ${
                isLatest
                  ? 'bg-white border-zinc-300'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-900">{item.author}</span>
                  {item.subAuthor && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {item.subAuthor}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {formatDateTime(item.date)}
                </span>
              </div>

              {item.status && (
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center text-[11px] font-normal px-2 py-0.5 rounded border ${
                      meta?.badgeClass || 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    Status: {meta?.label || item.status}
                  </span>
                </div>
              )}

              {item.note && (
                <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
