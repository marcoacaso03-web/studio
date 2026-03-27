import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-card/60 backdrop-blur-sm border border-neon-dim shadow-[0_0_15px_rgba(0,198,224,0.05)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
