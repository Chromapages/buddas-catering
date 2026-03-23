import { useEffect, useState } from "react";
import { Bell, Menu, Search, LogOut, User as UserIcon, ChevronDown, Info, CheckCircle2, AlertTriangle, XCircle, Building2 } from "lucide-react";
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
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";
import { CRMNotification } from "@/types/crm";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchCrm(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const unreadCount = notifications.filter((n: CRMNotification) => !n.read).length;

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-border bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-brown lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-gray-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-brown/40"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-brown placeholder:text-brown/40 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Search leads, companies, or events..."
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />

          {showSearchResults && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
              <div className="absolute top-16 left-0 z-20 w-full max-w-md origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-gray-border focus:outline-none overflow-hidden">
                <div className="p-2 border-b border-gray-border/50 bg-gray-bg/30">
                  <p className="text-[10px] font-bold text-brown/40 uppercase tracking-widest px-2">Search Results</p>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-border/50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-brown/40 italic">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result: { id: string, type: 'LEAD' | 'COMPANY', title: string, subtitle: string, link: string }) => (
                      <a
                        key={`${result.type}-${result.id}`}
                        href={result.link}
                        className="flex items-center gap-3 p-3 hover:bg-teal-base/5 transition-colors group"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${result.type === 'LEAD' ? 'bg-orange/10 text-orange' : 'bg-teal-base/10 text-teal-base'}`}>
                          {result.type === 'LEAD' ? <UserIcon size={16} /> : <Building2 size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brown group-hover:text-teal-dark">{result.title}</p>
                          <p className="text-xs text-brown/60">{result.subtitle}</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-brown/40 italic">No results found for "{searchQuery}"</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                className="-m-2.5 p-2.5 text-brown/60 hover:text-brown transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-teal-base rounded-full"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-border/50 bg-gray-bg/30 flex items-center justify-between">
                <h3 className="text-sm font-bold text-brown uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      markAllNotificationsAsRead(user!.uid);
                    }}
                    className="text-[10px] font-bold text-teal-base hover:text-teal-dark uppercase tracking-widest"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-border/50">
                {notifications.length > 0 ? notifications.map((n: CRMNotification) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    asChild
                    className={cn(
                      "p-4 flex gap-3 cursor-pointer items-start focus:bg-teal-base/5",
                      !n.read && "bg-teal-base/5"
                    )}
                  >
                    <a href={n.link || "#"}>
                      <div className="shrink-0 mt-1">
                        {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-teal-base" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-orange" />}
                        {n.type === 'ERROR' && <XCircle className="w-4 h-4 text-red-500" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-teal-dark" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-brown leading-snug`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-brown/60 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-brown/40 font-medium tracking-tight">
                            {n.createdAt?.seconds ? formatDistanceToNow(n.createdAt.seconds * 1000, { addSuffix: true }) : 'just now'}
                          </span>
                          {!n.read && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markNotificationAsRead(n.id);
                              }}
                              className="text-[10px] font-bold text-teal-base hover:underline uppercase tracking-widest"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </a>
                  </DropdownMenuItem>
                )) : (
                  <div className="p-8 text-center text-brown/40 text-sm italic">
                    No notifications yet.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-border" aria-hidden="true" />

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button"
                className="flex items-center gap-x-2 lg:gap-x-4 outline-none group focus-visible:ring-2 focus-visible:ring-teal-base rounded-lg px-2 py-1 -mx-2"
              >
                <div className="h-8 w-8 rounded-full bg-teal-base/20 flex items-center justify-center text-teal-dark font-bold text-xs ring-2 ring-transparent group-hover:ring-teal-base/30 transition-all">
                  {getInitials(user?.displayName, user?.email)}
                </div>
                <span className="hidden lg:flex lg:items-center">
                  <span className="text-sm font-semibold leading-6 text-brown group-hover:text-teal-dark transition-colors" aria-hidden="true">
                    {user?.displayName || (user?.email?.split('@')[0]) || 'Member'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 text-brown/40 group-hover:text-teal-dark font-bold" aria-hidden="true" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-teal-dark">{user?.displayName || 'Member'}</p>
                  <p className="text-xs font-medium leading-none text-brown/50 truncate pr-2">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/app/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4 text-brown/40" />
                  <span>Your Profile</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-orange focus:bg-orange/5 focus:text-orange cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
