"use client";

import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";

import { useLogout, useSession } from "../hooks/use-session";
import { dashboardPath } from "../roles";

/** Header auth area: login/register links for visitors, account menu for signed-in users. */
export function UserMenu() {
  const t = useTranslations("header");
  const { data: session, isPending } = useSession();
  const logout = useLogout();

  if (isPending) return <div className="h-8 w-40" aria-hidden />;

  if (!session?.isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">{t("login")}</Link>
        </Button>
        <Button asChild>
          <Link href="/register">{t("register")}</Link>
        </Button>
      </div>
    );
  }

  const { user } = session;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-56">
          <span className="truncate">{name}</span>
          <ChevronDown className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.email}</span>
          <span className="text-xs font-normal text-muted-foreground">{t(`roles.${user.role}`)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardPath(user.role)}>
            <LayoutDashboard aria-hidden />
            {t("dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut aria-hidden />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
