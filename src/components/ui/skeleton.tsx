import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-brand-green/5 border border-brand-green/20 shadow-[0_0_10px_rgba(172,229,4,0.08)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
