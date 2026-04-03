/**
 * WeightTracking.tsx — Clinical Sanctuary Edition
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, Weight as WeightIcon, TrendingUp, TrendingDown, Minus, Trash2, Scale } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, subMonths, isAfter, isBefore } from 'date-fns';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddWeightModal } from '@/components/modals/AddWeightModal';
import { usePet } from '@/hooks/usePets';
import { useWeightEntries, useDeleteWeight } from '@/hooks/useWeight';
import { formatDate } from '@/utils/dateUtils';

type Range = '1M' | '3M' | '6M' | '1Y';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const WeightTracking = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('6M');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: weightData, isLoading } = useWeightEntries(petId!);
  const deleteWeight = useDeleteWeight();

  const pet = petData?.data;
  const weights = weightData?.data ?? [];

  const rangeMonths: Record<Range, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };

  const sortedWeights = useMemo(() => {
    return [...weights].sort((a, b) => 
      new Date(a.recordedDate || a.date || 0).getTime() - new Date(b.recordedDate || b.date || 0).getTime());
  }, [weights]);

  const filteredWeights = useMemo(() => {
    const cutoff = subMonths(new Date(), rangeMonths[range]);
    return sortedWeights
      .filter((w) => isAfter(new Date(w.recordedDate || w.date || 0), cutoff));
  }, [sortedWeights, range]);

  const chartData = filteredWeights.map((w) => ({
    date: format(new Date(w.recordedDate || w.date || 0), 'MMM d'),
    weight: w.weight,
  }));

  const latest = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1] : null;
  
  // Find record closest to 30 days ago
  const monthAgo = subMonths(new Date(), 1);
  const monthAgoRecord = latest 
    ? [...sortedWeights].reverse().find(w => isBefore(new Date(w.recordedDate || w.date || 0), monthAgo)) || sortedWeights[sortedWeights.length - 2]
    : null;

  const change = latest && monthAgoRecord 
    ? ((latest.weight - monthAgoRecord.weight) / monthAgoRecord.weight * 100).toFixed(1)
    : null;
  const isMonthComp = monthAgoRecord && isBefore(new Date(monthAgoRecord.recordedDate || monthAgoRecord.date || 0), monthAgo);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(189,201,199,.4)',
            cursor: 'pointer',
            color: '#3d4948',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#eaf6f5'; e.currentTarget.style.borderColor = '#4fb6b2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(189,201,199,.4)'; }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1
            className="font-black tracking-tight"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#131d1e',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Weight Tracking
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: '#6d7978' }}>{pet.name}'s growth & weight history</p>}
        </div>
        <Button size="sm" pill className="gap-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Record
        </Button>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader variant="card" />
      ) : weights.length === 0 ? (
        <EmptyState
          icon={WeightIcon}
          title="No weight data"
          description="Start recording your pet's weight to track trends over time."
          actionLabel="Record Weight"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* ── Current Weight Hero ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card className="flex items-center gap-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #006a67, #4fb6b2)',
                  boxShadow: '0 6px 20px rgba(0,106,103,0.3)',
                }}
              >
                <Scale className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#bdc9c7' }}>Current Weight</p>
                <p
                  className="text-4xl font-black leading-none"
                  style={{ color: '#131d1e', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.03em' }}
                >
                  {latest!.weight}
                  <span className="text-base font-semibold ml-1.5" style={{ color: '#6d7978' }}>{latest!.unit}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#bdc9c7' }}>{formatDate(latest!.recordedDate)}</p>
              </div>
              {change && (
                <div
                  className="flex flex-col items-end gap-1"
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      background: Number(change) > 0 ? 'rgba(79,182,178,.1)' : Number(change) < 0 ? 'rgba(231,111,81,.1)' : 'rgba(189,201,199,.1)',
                      color: Number(change) > 0 ? '#4fb6b2' : Number(change) < 0 ? '#E76F51' : '#6d7978',
                    }}
                  >
                    {Number(change) > 0 ? <TrendingUp className="h-4 w-4" /> : Number(change) < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    {Math.abs(Number(change))}%
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 px-1">
                    {isMonthComp ? 'vs last month' : 'vs previous'}
                  </span>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Chart ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#eaf6f5' }}>
                    <TrendingUp className="h-4 w-4 text-[#4fb6b2]" />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: '#131d1e' }}>Weight Trend</h3>
                </div>
                <div className="flex gap-1">
                  {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200"
                      style={{
                        background: range === r ? 'linear-gradient(135deg, #006a67, #4fb6b2)' : 'transparent',
                        color: range === r ? '#ffffff' : '#6d7978',
                        boxShadow: range === r ? '0 4px 12px rgba(0,106,103,0.25)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length < 2 ? (
                <div className="text-center py-10 rounded-2xl" style={{ background: '#eaf6f5' }}>
                  <p className="text-sm font-semibold" style={{ color: '#6d7978' }}>Need at least 2 entries to show a chart.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(189,201,199,.2)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#bdc9c7', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: 'rgba(189,201,199,.2)' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#bdc9c7', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: 'rgba(189,201,199,.2)' }} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{
                        background: '#004442',
                        border: 'none',
                        borderRadius: 16,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '8px 14px',
                        boxShadow: '0 8px 24px rgba(0,68,66,.3)',
                      }}
                      labelStyle={{ color: '#8ff3ef' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="url(#weightGrad)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#006a67', stroke: '#fff', strokeWidth: 2.5 }}
                      activeDot={{ r: 7, fill: '#4fb6b2', stroke: '#fff', strokeWidth: 2.5 }}
                    />
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#006a67" />
                        <stop offset="100%" stopColor="#4fb6b2" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>

          {/* ── Entry List ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #006a67, #4fb6b2)' }} />
                <h3 className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#6d7978' }}>
                  All Entries
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eaf6f5', color: '#4fb6b2' }}>
                  {weights.length}
                </span>
              </div>
              <div className="space-y-0">
                {[...sortedWeights].reverse().map((w, i) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between py-3 text-sm group"
                    style={{ borderTop: i > 0 ? '1px solid rgba(189,201,199,.12)' : 'none' }}
                  >
                    <div>
                      <span className="text-xs font-semibold" style={{ color: '#6d7978' }}>{formatDate(w.recordedDate)}</span>
                      {w.notes && <span className="text-xs ml-2 italic" style={{ color: '#bdc9c7' }}>— {w.notes}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm" style={{ color: '#131d1e' }}>{w.weight} {w.unit}</span>
                      <button
                        onClick={() => setDeleteTarget(w._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-40 group-hover:opacity-100"
                        style={{ background: 'rgba(231,111,81,.08)', cursor: 'pointer' }}
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[#E76F51]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {petId && (
        <AddWeightModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          petId={petId}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteWeight.mutate({ logId: deleteTarget, petId: petId! });
          setDeleteTarget(null);
        }}
        title="Delete Weight Entry"
        message="Are you sure you want to delete this weight log? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default WeightTracking;
