import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Scale, User, LogOut, BookOpen, Bell, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const lawyerNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BookOpen },
    { label: 'Diaries', href: '/diaries', icon: BookOpen },
    { label: 'Requests', href: '/requests', icon: Bell },
    { label: 'Partners', href: '/partners', icon: Users },
  ];

  const partnerNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BookOpen },
    { label: 'Diaries', href: '/diaries', icon: BookOpen },
    { label: 'My Requests', href: '/my-requests', icon: Bell },
    { label: 'Find Lawyers', href: '/find-lawyers', icon: Users },
  ];

  const navItems = user?.role === 'lawyer' ? lawyerNavItems : partnerNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <Scale className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span className="font-serif text-base sm:text-lg font-semibold text-gold-gradient whitespace-nowrap">
            Legal Diary
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary/20">
                      <AvatarImage src={user?.profilePhoto} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePhoto} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 p-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    <DropdownMenuSeparator />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-lg font-medium text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-sm h-9 px-3"
            >
              Sign In
            </Button>
            <Button onClick={() => navigate('/get-started')} className="gold-gradient text-primary-foreground text-sm h-9 px-3 sm:h-10 sm:px-4">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
