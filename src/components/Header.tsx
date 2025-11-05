import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

interface HeaderProps {
  onHome: () => void
}

export function Header({ onHome }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const appName = 'Tile Shift'
  const characters = appName.split('')

  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div className="text-[30px] font-jackdrift bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 bg-clip-text text-transparent cursor-pointer" onClick={onHome}>
          {characters.map((char, index) => {
            return (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: 'easeIn'
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            )
          })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  )
}

