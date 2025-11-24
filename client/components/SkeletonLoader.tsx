interface SkeletonProps {
  variant?: "text" | "input" | "button" | "card";
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonText({
  width = "w-full",
  height = "h-4",
  className = "",
}: Omit<SkeletonProps, "variant">) {
  return (
    <div
      className={`bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded animate-pulse ${width} ${height} ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
    />
  );
}

export function SkeletonInput({
  width = "w-full",
  className = "",
}: Omit<SkeletonProps, "variant">) {
  return (
    <div
      className={`bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-md h-10 ${width} ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
    />
  );
}

export function SkeletonButton({
  width = "w-full",
  className = "",
}: Omit<SkeletonProps, "variant">) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 rounded-lg h-10 ${width} ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
    />
  );
}

export function SkeletonCard({
  className = "",
}: Omit<SkeletonProps, "variant">) {
  return (
    <div className={`bg-slate-800/50 rounded-lg p-6 space-y-4 ${className}`}>
      <SkeletonText width="w-1/3" height="h-8" />
      <SkeletonText width="w-2/3" height="h-4" />
      <div className="space-y-3 pt-4">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonButton />
      </div>
    </div>
  );
}

export function FormSkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SkeletonText width="w-1/4" height="h-4" />
        <SkeletonInput />
      </div>
      <div className="space-y-2">
        <SkeletonText width="w-1/4" height="h-4" />
        <SkeletonInput />
      </div>
      <SkeletonButton />
    </div>
  );
}
