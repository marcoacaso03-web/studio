import { useUserRole } from "./useUserRole";

export function usePermissions() {
  const { isDeveloper, isDirectorOrAbove, isCoach, isCoachOrAbove } = useUserRole();

  return {
    canImportTuttocampo: isDeveloper,
    canAccessScoutingDirector: isDirectorOrAbove,
    canCreateGlobalExercises: isDeveloper,
    canEditRoster: isCoach || isDeveloper,
    canViewAggregatedStats: isDirectorOrAbove,
    canEditMatchEvents: isCoach || isDeveloper,
  };
}
