"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  Plus,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: FileText },
  { href: "/questions/create", label: "Create Question", icon: Plus },
  { href: "/tests", label: "Tests", icon: ClipboardList },
  { href: "/tests/create", label: "Create Test", icon: Plus },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "transition-all duration-300 border-r bg-sidebar",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <Link href="/dashboard" className="font-bold text-lg">
              QuizLM
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            variant="outline"
            className="justify-start gap-3"
            onClick={async () => {
              await signOut({ redirectUrl: "/" });
            }}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen }
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* User Profile - would integrate with Clerk here */}
            <div className="w-10 h-10 rounded-full bg-muted" />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
