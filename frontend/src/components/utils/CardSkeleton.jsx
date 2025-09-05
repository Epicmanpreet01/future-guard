const CardSkeleton = () => (
  <div className="border border-slate-200 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-6 bg-slate-200 rounded w-1/2 mb-6"></div>
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-1"></div>
      <div className="h-10 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-1"></div>
      <div className="h-10 bg-slate-200 rounded"></div>
    </div>
  </div>
);

export default CardSkeleton