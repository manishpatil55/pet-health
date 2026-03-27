import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Weight as WeightIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddWeightModal } from '@/components/modals/AddWeightModal';
import { usePet } from '@/hooks/usePets';
import { useWeightEntries } from '@/hooks/useWeight';
import { formatDate } from '@/utils/dateUtils';

type Range = '1M' | '3M' | '6M' | '1Y';

const WeightTracking = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('6M');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: petData } = usePet(petId!);
  const { data: weightData, isLoading } = useWeightEntries(petId!);

  const pet = petData?.data;
  const weights = weightData?.data ?? [];

  const rangeMonths: Record<Range, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };

  const filteredWeights = useMemo(() => {
    const cutoff = subMonths(new Date(), rangeMonths[range]);
    return weights
      .filter((w) => isAfter(new Date(w.recordedDate), cutoff))
      .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime());
  }, [weights, range]);

  const chartData = filteredWeights.map((w) => ({
    date: format(new Date(w.recordedDate), 'MMM d'),
    weight: w.weight,
  }));

  const latest = weights.length > 0 ? weights[weights.length - 1] : null;
  const prev = weights.length > 1 ? weights[weights.length - 2] : null;
  const change = latest && prev ? ((latest.weight - prev.weight) / prev.weight * 100).toFixed(1) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Weight Tracking</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" /> Add Weight</Button>
      </div>

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
        <>
          {/* Current Weight */}
          <Card className="flex items-end gap-6">
            <div>
              <p className="text-xs text-[#7A8A8A] mb-1">Current Weight</p>
              <p className="text-4xl font-bold text-[#2F3A3A]">
                {latest!.weight}
                <span className="text-base font-normal text-[#7A8A8A] ml-1">{latest!.unit}</span>
              </p>
              <p className="text-xs text-[#7A8A8A] mt-1">{formatDate(latest!.recordedDate)}</p>
            </div>
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium pb-2 ${
                Number(change) > 0 ? 'text-[#E76F51]' : Number(change) < 0 ? 'text-[#6BCB77]' : 'text-[#7A8A8A]'
              }`}>
                {Number(change) > 0 ? <TrendingUp className="h-4 w-4" /> : Number(change) < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {Math.abs(Number(change))}% vs previous
              </div>
            )}
          </Card>

          {/* Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#2F3A3A]">Weight Trend</h3>
              <div className="flex gap-1">
                {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      range === r ? 'bg-[#4FB6B2] text-white' : 'text-[#7A8A8A] hover:bg-[#F7FAFA]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length < 2 ? (
              <p className="text-sm text-[#7A8A8A] py-8 text-center">Need at least 2 entries in this range to show a chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EEEE" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A8A8A' }} tickLine={false} axisLine={{ stroke: '#E6EEEE' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#7A8A8A' }} tickLine={false} axisLine={{ stroke: '#E6EEEE' }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      background: '#2F3A3A',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#CFEDEA' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#4FB6B2"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4FB6B2', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#4FB6B2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Entry List */}
          <Card>
            <h3 className="text-base font-semibold text-[#2F3A3A] mb-3">All Entries</h3>
            <div className="divide-y divide-[#E6EEEE]">
              {[...weights].reverse().map((w) => (
                <div key={w._id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="text-[#7A8A8A]">{formatDate(w.recordedDate)}</span>
                    {w.notes && <span className="text-xs text-[#7A8A8A] ml-2 italic">— {w.notes}</span>}
                  </div>
                  <span className="font-medium text-[#2F3A3A]">{w.weight} {w.unit}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {petId && (
        <AddWeightModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          petId={petId}
        />
      )}
    </motion.div>
  );
};

export default WeightTracking;
