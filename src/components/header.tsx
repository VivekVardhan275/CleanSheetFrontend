import Link from 'next/link';
import { Logo } from './icons';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold inline-block">DataCleanr</span>
        </Link>
        <div className='flex items-center gap-4'>
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
