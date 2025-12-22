import { Music2, Search, Play, Clock, Hash, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const songs = [
  {
    id: "1",
    title: "Ragamalika Fusion",
    raga: "Hamsadhwani → Kalyani",
    tempo: "120 BPM",
    duration: "8:45",
    key: "C Major",
    lastPlayed: "Dec 15",
  },
  {
    id: "2",
    title: "Thillana in 7/8",
    raga: "Desh",
    tempo: "140 BPM",
    duration: "6:30",
    key: "G Major",
    lastPlayed: "Dec 10",
  },
  {
    id: "3",
    title: "Carnatic Blues",
    raga: "Kharaharapriya",
    tempo: "95 BPM",
    duration: "10:15",
    key: "A Minor",
    lastPlayed: "Dec 8",
  },
  {
    id: "4",
    title: "Mystic Sindhu Bhairavi",
    raga: "Sindhu Bhairavi",
    tempo: "85 BPM",
    duration: "12:00",
    key: "D Minor",
    lastPlayed: "Dec 5",
  },
  {
    id: "5",
    title: "Progressive Shankarabharanam",
    raga: "Shankarabharanam",
    tempo: "160 BPM",
    duration: "7:20",
    key: "C Major",
    lastPlayed: "Nov 28",
  },
];

const setlists = [
  { id: "1", name: "NH7 Weekender Set", songs: 8, duration: "75 min" },
  { id: "2", name: "Corporate Evening", songs: 6, duration: "45 min" },
  { id: "3", name: "Festival Extended", songs: 12, duration: "120 min" },
];

export default function Songs() {
  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Song Library</h1>
          <p className="text-sm text-muted-foreground">Your arrangements & setlists</p>
        </header>

        {/* Search */}
        <div className="relative mb-6 opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search songs, ragas, or keys..."
            className="w-full h-12 pl-11 pr-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Setlists */}
        <div className="mb-6 opacity-0 animate-slide-up" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Setlists
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {setlists.map((setlist) => (
              <button
                key={setlist.id}
                className="flex-shrink-0 glass-card p-4 min-w-[160px] text-left hover:bg-card/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-3">
                  <Music2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{setlist.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{setlist.songs} songs • {setlist.duration}</p>
              </button>
            ))}
          </div>
        </div>

        {/* All Songs */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              All Songs
            </h3>
            <span className="text-xs text-muted-foreground">{songs.length} tracks</span>
          </div>
          <div className="space-y-2">
            {songs.map((song, index) => (
              <button
                key={song.id}
                className="w-full glass-card p-4 text-left group hover:bg-card/80 transition-all opacity-0 animate-slide-up"
                style={{ animationDelay: `${250 + index * 50}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {song.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-secondary font-medium">{song.raga}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3" />
                    <span>{song.key}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>♩</span>
                    <span>{song.tempo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{song.duration}</span>
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Last: {song.lastPlayed}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
