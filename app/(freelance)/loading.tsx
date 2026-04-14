export default function Loading() {
  return (
    <div className="max-w-[600px] mx-auto p-6 lg:p-8 space-y-4 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-28 bg-bg-elevated rounded-lg" />
      {/* Cascade card skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-bg-elevated rounded-md" />
      ))}
    </div>
  )
}
