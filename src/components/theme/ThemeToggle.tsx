import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle({
  className,
  variant = 'ghost',
  size = 'icon',
}: {
  className?: string
  variant?: 'ghost' | 'outline'
  size?: 'icon' | 'sm'
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const active = (theme ?? 'system') as Theme
  const ActiveIcon =
    active === 'system'
      ? Monitor
      : resolvedTheme === 'dark'
        ? Moon
        : Sun

  if (!mounted) {
    return (
      <span
        className={cn(
          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground',
          className,
        )}
        aria-hidden
      >
        <Sun className="h-4 w-4" />
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
          size === 'icon' ? 'h-8 w-8' : 'h-8 gap-1.5 px-3 text-xs',
          variant === 'outline' && 'border border-border bg-background hover:bg-accent',
          variant === 'ghost' && 'text-muted-foreground hover:bg-accent hover:text-foreground',
          className,
        )}
        aria-label="Change theme"
      >
        <ActiveIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={active} onValueChange={(v) => setTheme(v as Theme)}>
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
