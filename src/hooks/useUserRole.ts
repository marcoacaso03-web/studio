import { useAuthStore } from "@/store/useAuthStore";
import { AccountRole } from "@/lib/types";

export function useUserRole() {
  const user = useAuthStore((state) => state.user);
  const role: AccountRole = user?.role || 'coach';

  return {
    role,
    isDeveloper: role === 'developer',
    isDirector: role === 'director',
    isCoach: role === 'coach',
    isPlayer: role === 'player',
    // Convenience checks
    isCoachOrAbove: ['coach', 'director', 'developer'].includes(role),
    isDirectorOrAbove: ['director', 'developer'].includes(role),
  };
}
