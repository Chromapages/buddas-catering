"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search, LogOut, User as UserIcon, ChevronDown, Info, CheckCircle2, AlertTriangle, XCircle, Building2, HelpCircle, X } from "lucide-react";
import { Input } from "@/components/shared/Input";
import { useAuth } from "@/lib/firebase/context/auth";
import { 
  subscribeToUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  searchCrm
} from "@/lib/firebase/services/crm";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";
import { cn } from "@/lib/utils";
import { CRMNotification } from "@/types/crm";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, role, signOut } = useAuth();
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const isAdmin = role === 'owner' || role === 'admin' || role === 'marketing' || role === 'ops';

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2 && user && role) {
        setIsSearching(true);
        const results = await searchCrm(searchQuery, user.uid, role);
        setSearchResults(results);
        setIsSearching(false);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user, role]);

  const unreadCount = notifications.filter((n: CRMNotification) => !n.read).length;

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  };

  return (
    <header className={cn(
      "sticky top-0 z-[70] flex shrink-0 items-center justify-between transition-all duration-500",
      isAdmin 
        ? "h-20 bg-v-primary/95 lg:bg-chef-prep/30 lg:backdrop-blur-xl border-b border-chef-charcoal/5 shadow-soft-low lg:shadow-none" 
        : "h-20 border-b border-chef-charcoal/5 bg-white/60 backdrop-blur-xl",
      "px-6 lg:px-12"
    )}>
      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        {/* Mobile Branded Header for Admin */}
        {isAdmin && (
          <div className="flex lg:hidden items-center gap-4">
             <button 
                className="p-3 -ml-2 text-white active:scale-95 duration-200 hover:bg-white/10 rounded-full transition-all"
                aria-label="Open sidebar menu"
             >
                <Menu className="h-6 w-6" />
             </button>
             <h1 className="text-xl font-black text-white tracking-tight">Budda&apos;s</h1>
          </div>
        )}

        {/* Search Mobile Toggle - Hidden for Admin on mobile */}
        {!isAdmin && (
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search database"
            className="lg:hidden p-3 -ml-2 text-chef-muted hover:text-chef-charcoal transition-all focus:outline-none"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        <div className={cn(
          "relative flex-1 items-center transition-all duration-300",
          !isMobileSearchOpen && "hidden lg:flex",
          isMobileSearchOpen && "fixed inset-0 z-[80] bg-chef-prep/95 backdrop-blur-3xl lg:bg-transparent lg:inset-auto lg:relative flex p-4 lg:p-0 animate-in fade-in zoom-in duration-300"
        )}>
          <div className="relative w-full lg:max-w-2xl">
            <Search
              className={cn(
                "pointer-events-none absolute inset-y-0 left-6 h-full w-4",
                isAdmin ? "text-white/40 lg:text-chef-muted" : "text-chef-muted"
              )}
              aria-hidden="true"
            />
            <input
              id="search-field"
              className={cn(
                "block h-14 my-auto w-full border border-transparent py-0 pl-14 pr-12 transition-all rounded-[28px] font-medium text-sm focus:border-accent-fresh/30 focus:ring-0",
                isAdmin 
                  ? "bg-white/10 placeholder:text-white/40 text-white lg:bg-white lg:text-chef-charcoal lg:placeholder:text-chef-muted lg:shadow-soft-low" 
                  : "bg-white placeholder:text-chef-muted text-chef-charcoal shadow-soft-low"
              )}
              placeholder="Search records, contacts, or deals..."
              type="search"
              name="search"
              autoFocus={isMobileSearchOpen}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            />
            
            {/* Close Button Mobile */}
            {isMobileSearchOpen && (
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-chef-charcoal/5 rounded-full"
              >
                <X className="h-5 w-5 text-chef-muted" />
              </button>
            )}

            {showSearchResults && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
                <div className={cn(
                  "absolute z-20 w-full lg:max-w-xl origin-top-left rounded-[32px] bg-white shadow-soft-high border border-chef-charcoal/5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                  "top-16 lg:top-18"
                )}>
                  <div className="p-5 border-b border-chef-charcoal/5 bg-chef-prep/30">
                    <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.3em] px-2">Quantum Search Results</p>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto divide-y divide-chef-charcoal/[0.03] custom-scrollbar">
                    {isSearching ? (
                      <div className="p-12 text-center text-sm text-chef-muted italic flex flex-col items-center gap-3">
                         <div className="h-2 w-12 bg-accent-fresh/20 rounded-full animate-shimmer" />
                         Scanning Data Matrix...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result: { id: string, type: 'LEAD' | 'COMPANY', title: string, subtitle: string, link: string }) => (
                        <a
                          key={`${result.type}-${result.id}`}
                          href={result.link}
                          className="flex items-center gap-5 p-5 hover:bg-chef-prep/50 transition-all group active:scale-[0.99]"
                          onClick={() => {
                            setShowSearchResults(false);
                            setIsMobileSearchOpen(false);
                          }}
                        >
                          <div className={`h-12 w-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-soft-low border border-chef-charcoal/5 transition-transform group-hover:scale-110 ${result.type === 'LEAD' ? 'bg-accent-heat/10 text-accent-heat' : 'bg-accent-fresh/10 text-accent-fresh'}`}>
                            {result.type === 'LEAD' ? <UserIcon size={20} /> : <Building2 size={20} />}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-[15px] font-black text-chef-charcoal leading-tight tracking-tight">{result.title}</p>
                            <p className="text-[10px] font-black text-chef-muted uppercase tracking-[0.2em] mt-1">{result.subtitle}</p>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="p-12 text-center text-sm text-chef-muted italic">No results found for &ldquo;{searchQuery}&rdquo;</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-x-2 lg:gap-x-4">
          <div className="hidden lg:flex">
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                aria-label={`You have ${unreadCount} unread notifications`}
                className={cn(
                  "-m-2.5 p-3.5 transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-accent-fresh rounded-2xl active:scale-90",
                  isAdmin ? "text-white lg:text-chef-muted hover:bg-white/10 lg:hover:bg-chef-prep/50 lg:hover:text-chef-charcoal" : "text-chef-muted hover:bg-chef-prep/50 hover:text-chef-charcoal"
                )}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className={cn(
                    "absolute top-3.5 right-3.5 h-2 w-2 rounded-full",
                    isAdmin ? "bg-accent-heat ring-2 ring-v-primary lg:ring-white" : "bg-accent-heat ring-2 ring-white"
                  )} />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[440px] p-0 overflow-hidden rounded-[32px] bg-white shadow-soft-high border border-chef-charcoal/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-8 py-6 border-b border-chef-charcoal/5 bg-chef-prep/30 flex items-center justify-between">
                <h3 className="text-[11px] font-black text-chef-charcoal uppercase tracking-[0.25em]">Notifications Hub</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      markAllNotificationsAsRead(user!.uid);
                    }}
                    className="text-[10px] font-black text-accent-fresh hover:text-chef-charcoal uppercase tracking-[0.2em] transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-[440px] overflow-y-auto divide-y divide-chef-charcoal/[0.03] custom-scrollbar">
                {notifications.length > 0 ? notifications.map((n: CRMNotification) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    asChild
                    className={cn(
                      "p-6 flex gap-4 cursor-pointer items-start focus:bg-chef-prep/50 transition-colors",
                      !n.read && "bg-accent-fresh/[0.03]"
                    )}
                  >
                    <a href={n.link || "#"}>
                      <div className="shrink-0 mt-1">
                        {n.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-accent-fresh" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-accent-heat" />}
                        {n.type === 'ERROR' && <XCircle className="w-5 h-5 text-red-500" />}
                        {n.type === 'INFO' && <Info className="w-5 h-5 text-chef-charcoal" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] ${!n.read ? 'font-black' : 'font-bold'} text-chef-charcoal leading-tight tracking-tight`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-chef-muted mt-1.5 leading-relaxed line-clamp-2 font-medium">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[10px] text-chef-muted/60 font-bold uppercase tracking-wider">
                            {n.createdAt?.seconds ? formatDistanceToNow(n.createdAt.seconds * 1000, { addSuffix: true }) : 'just now'}
                          </span>
                          {!n.read && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markNotificationAsRead(n.id);
                              }}
                              className="text-[10px] font-black text-accent-fresh hover:underline uppercase tracking-[0.2em]"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </a>
                  </DropdownMenuItem>
                )) : (
                  <div className="p-16 text-center text-chef-muted text-sm italic flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-chef-prep rounded-full flex items-center justify-center opacity-40">
                      <Bell size={24} />
                    </div>
                    No active transmissions.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="hidden lg:block lg:h-8 lg:w-px lg:bg-chef-charcoal/5" aria-hidden="true" />

          <button 
            type="button" 
            className="hidden lg:flex -m-2.5 p-3.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-fresh rounded-2xl hover:bg-chef-prep/50 text-chef-muted hover:text-chef-charcoal active:scale-90"
          >
            <span className="sr-only">Help</span>
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button"
                aria-label="User account and profile settings"
                className="flex items-center gap-x-4 outline-none group focus-visible:ring-2 focus-visible:ring-accent-fresh rounded-[20px] p-1.5 hover:bg-white/10 lg:hover:bg-chef-prep/50 transition-all ml-2 active:scale-95"
              >
                <div className="hidden lg:flex flex-col items-end mr-1">
                  <span className="text-sm font-black text-chef-charcoal tracking-tight transition-colors line-clamp-1 max-w-[120px]" aria-hidden="true">
                    {user?.displayName || (user?.email?.split('@')[0]) || 'Member'}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-chef-muted leading-none mt-1.5 opacity-60">
                    {role || 'MEMBER'}
                  </span>
                </div>
                <div className={cn(
                  "h-11 w-11 rounded-[16px] flex items-center justify-center font-bold text-xs shadow-soft-low border border-chef-charcoal/5 overflow-hidden transition-all group-hover:scale-105",
                  isAdmin ? "bg-white/10 text-white lg:bg-chef-charcoal lg:text-white" : "bg-chef-charcoal text-white"
                )}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    isAdmin ? <UserIcon size={20} className="text-white" /> : getInitials(user?.displayName, user?.email)
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden rounded-[32px] bg-white shadow-soft-high border border-chef-charcoal/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-6 bg-chef-prep/30 border-b border-chef-charcoal/5">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-black leading-tight text-chef-charcoal tracking-tight">{user?.displayName || 'Member'}</p>
                  <p className="text-[10px] font-bold leading-none text-chef-muted truncate uppercase tracking-widest mt-1 opacity-60">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem asChild className="rounded-[18px] p-4 focus:bg-chef-prep/50 cursor-pointer">
                  <a href="/app/settings" className="flex items-center gap-3">
                    <UserIcon size={18} className="text-chef-muted" />
                    <span className="text-sm font-bold text-chef-charcoal">Account Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-chef-charcoal/[0.03] my-1" />
                <DropdownMenuItem 
                  className="rounded-[18px] p-4 text-accent-heat focus:bg-accent-heat/5 focus:text-accent-heat cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowLogoutConfirm(true);
                  }}
                >
                  <LogOut size={18} className="mr-3" />
                  <span className="text-sm font-bold">Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={signOut}
        title="Sign Out?"
        description="Are you sure you want to log out of the CRM dashboard? Any unsaved changes may be lost."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
      />
    </header>
  );
}
