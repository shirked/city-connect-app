
"use client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { LogOut, PlusCircle, UserCircle, Map, LayoutList, Users, Menu, Home, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppLogo } from "./icons/app-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 md:mr-8 flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/"><Home className="mr-2 h-4 w-4" />Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard"><LayoutList className="mr-2 h-4 w-4" />My Reports</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/community"><Users className="mr-2 h-4 w-4" />Community</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/new"><PlusCircle className="mr-2 h-4 w-4" />New Report</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Link href="/" className="flex items-center space-x-2">
            <AppLogo />
            <span className="font-bold text-lg font-headline">Civic Connect</span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )}
          >
            My Reports
          </Link>
          <Link
            href="/community"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/community" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Community
          </Link>
          <Link
            href="/new"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/new" ? "text-primary" : "text-muted-foreground"
            )}
          >
            New Report
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-muted-foreground" />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.name}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Mobile navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="grid grid-cols-5 items-center justify-around gap-2">
             <Link href="/" className={cn("flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-muted", pathname === "/" ? "text-primary" : "text-muted-foreground")}>
                <Map className="h-5 w-5"/>
                <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="/dashboard" className={cn("flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-muted", pathname === "/dashboard" ? "text-primary" : "text-muted-foreground")}>
                <LayoutList className="h-5 w-5"/>
                <span className="text-xs font-medium">Reports</span>
            </Link>
             <Link href="/new" className="flex justify-center">
                <div className="flex h-14 w-14 -translate-y-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
                    <PlusCircle className="h-8 w-8"/>
                </div>
            </Link>
            <Link href="/community" className={cn("flex flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-muted", pathname === "/community" ? "text-primary" : "text-muted-foreground")}>
                <Users className="h-5 w-5"/>
                <span className="text-xs font-medium">Community</span>
            </Link>
            <button onClick={logout} className="flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted">
                <LogOut className="h-5 w-5"/>
                <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
      </div>
    </header>
  );
}
