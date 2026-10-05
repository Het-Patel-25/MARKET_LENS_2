import React from 'react';
import { NewsArticle } from '@/store/useNewsStore';
import { useDashboardStore } from '@/store/useDashboardStore';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  const { setActiveSymbol, setActiveTab } = useDashboardStore();

  const handleTickerClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setActiveSymbol(symbol);
    setActiveTab('Dashboard');
  };

  const timeAgo = (dateStr: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div 
      onClick={() => onClick(article)}
      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/50 transition-colors cursor-pointer group"
    >
      {/* Optional Thumbnail */}
      {article.imageUrl ? (
        <div 
          className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-muted rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${article.imageUrl})` }}
        />
      ) : (
        <div className="w-full sm:w-32 h-32 sm:h-24 shrink-0 bg-card rounded-lg flex items-center justify-center border border-border">
           <span className="text-xs text-muted-foreground uppercase tracking-widest">{article.source.substring(0, 3)}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            <span>•</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 sm:mt-2">
          <div className="flex gap-1.5">
            {article.symbols && article.symbols.slice(0, 3).map(sym => (
              <button 
                key={sym}
                onClick={(e) => handleTickerClick(e, sym)}
                className="px-2 py-0.5 bg-background border border-border rounded text-[10px] font-bold tracking-wider hover:bg-primary/20 transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
          
          {article.sentiment && article.sentiment !== 'neutral' && (
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
              ${article.sentiment === 'positive' || article.sentiment === 'Bullish' ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'}
            `}>
              {article.sentiment === 'positive' ? 'Bullish' : 'Bearish'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
