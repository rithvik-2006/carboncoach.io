'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as AvatarIcon, Crown } from 'lucide-react'

type LeaderboardEntry = { id: string, name: string, avatar: string, total_saved: number, rank: number }

export function LeaderboardPodium({ topThree }: { topThree: LeaderboardEntry[] }) {
  const first = topThree.find(u => u.rank === 1)
  const second = topThree.find(u => u.rank === 2)
  const third = topThree.find(u => u.rank === 3)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end justify-center py-6 px-1 max-w-md mx-auto">
      {/* 2nd Place */}
      {second ? (
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="relative">
            <Avatar className="size-16 sm:size-20 border-2 border-zinc-400 shadow-md">
              <AvatarImage src={second.avatar} />
              <AvatarFallback className="bg-muted text-muted-foreground"><AvatarIcon className="size-7" /></AvatarFallback>
            </Avatar>
            <div className="absolute -top-1.5 -right-1.5 bg-zinc-400 text-zinc-950 font-extrabold text-[10px] size-5 rounded-full flex items-center justify-center border-2 border-background">
              2
            </div>
          </div>
          <div className="text-center leading-tight">
            <p className="text-xs font-bold text-foreground truncate max-w-[75px] sm:max-w-[100px]">{second.name}</p>
            <p className="text-[10px] font-extrabold text-muted-foreground">{second.total_saved.toFixed(1)}kg</p>
          </div>
          <div className="w-full bg-zinc-800/10 border-t-2 border-zinc-400 rounded-t-xl h-20 flex items-center justify-center text-xs font-bold text-zinc-400">
            2nd
          </div>
        </div>
      ) : (
        <div className="h-1" />
      )}

      {/* 1st Place */}
      {first ? (
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
              <Crown className="size-5 fill-amber-500/20" />
            </div>
            <Avatar className="size-20 sm:size-24 border-4 border-amber-500 shadow-lg shadow-amber-500/10">
              <AvatarImage src={first.avatar} />
              <AvatarFallback className="bg-amber-950 text-amber-500"><AvatarIcon className="size-9" /></AvatarFallback>
            </Avatar>
            <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-amber-950 font-extrabold text-[11px] size-6 rounded-full flex items-center justify-center border-2 border-background">
              1
            </div>
          </div>
          <div className="text-center leading-tight">
            <p className="text-sm font-black text-foreground truncate max-w-[85px] sm:max-w-[120px]">{first.name}</p>
            <p className="text-xs font-extrabold text-emerald-500">{first.total_saved.toFixed(1)}kg</p>
          </div>
          <div className="w-full bg-amber-500/5 border-t-4 border-amber-500 rounded-t-2xl h-28 flex items-center justify-center text-sm font-black text-amber-500 shadow-sm">
            1st
          </div>
        </div>
      ) : (
        <div className="h-1" />
      )}

      {/* 3rd Place */}
      {third ? (
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom duration-500 delay-75">
          <div className="relative">
            <Avatar className="size-14 sm:size-16 border-2 border-amber-700/60 shadow-md">
              <AvatarImage src={third.avatar} />
              <AvatarFallback className="bg-muted text-muted-foreground"><AvatarIcon className="size-6" /></AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 bg-amber-700 text-amber-100 font-extrabold text-[9px] size-4 rounded-full flex items-center justify-center border-2 border-background">
              3
            </div>
          </div>
          <div className="text-center leading-tight">
            <p className="text-xs font-bold text-foreground truncate max-w-[65px] sm:max-w-[90px]">{third.name}</p>
            <p className="text-[10px] font-extrabold text-amber-700">{third.total_saved.toFixed(1)}kg</p>
          </div>
          <div className="w-full bg-amber-700/5 border-t-2 border-amber-700/60 rounded-t-lg h-16 flex items-center justify-center text-[10px] font-bold text-amber-700">
            3rd
          </div>
        </div>
      ) : (
        <div className="h-1" />
      )}
    </div>
  )
}
