interface SkeletonLoaderProps {
  variant?: 'card' | 'list-item' | 'text-block' | 'circle' | 'line';
  count?: number;
  className?: string;
}

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-[#E6EEEE]/60 ${className}`}
  />
);

const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Shimmer className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
    </div>
    <Shimmer className="h-3 w-full" />
    <Shimmer className="h-3 w-5/6" />
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex items-center gap-3 py-3">
    <Shimmer className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-1/3" />
    </div>
    <Shimmer className="h-6 w-16 rounded-full" />
  </div>
);

const TextBlockSkeleton = () => (
  <div className="space-y-2">
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-5/6" />
    <Shimmer className="h-4 w-4/6" />
  </div>
);

const SkeletonLoader = ({
  variant = 'card',
  count = 1,
  className = '',
}: SkeletonLoaderProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((i) => {
        switch (variant) {
          case 'card':
            return <CardSkeleton key={i} />;
          case 'list-item':
            return <ListItemSkeleton key={i} />;
          case 'text-block':
            return <TextBlockSkeleton key={i} />;
          case 'circle':
            return <Shimmer key={i} className="h-12 w-12 rounded-full" />;
          case 'line':
            return <Shimmer key={i} className="h-4 w-full" />;
          default:
            return <CardSkeleton key={i} />;
        }
      })}
    </div>
  );
};

export { SkeletonLoader, Shimmer };
export type { SkeletonLoaderProps };
