"use client";

import React, { ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { AccountRole } from "@/lib/types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AccountRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role } = useUserRole();

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
