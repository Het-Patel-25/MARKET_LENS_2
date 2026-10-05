import React from 'react';
import { useNewsStore, NewsArticle } from '@/store/useNewsStore';
import { ArrowUpRight } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

export function TopMarketNews({ onArticleClick }: { onArticleClick: (article: NewsArticle) => void }) {
  const { articles, isLoading } = useNewsStore();
  const { setActiveSymbol, setActiveTab } = useDashboardStore();

  const handleTickerClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setActiveSymbol(symbol);
    setActiveTab('Dashboard'); // Jump to dashboard with this symbol
  };

  if (isLoading) {
    return <div className="h-[400px] bg-card/50 animate-pulse rounded-2xl border border-border" />;
  }

  const article = articles.length > 0 ? articles[0] : null;

  if (!article) return null;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => onArticleClick(article)}>
      {/* Featured section label */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-primary tracking-wider uppercase">Market Moving</span>
        <span className="text-xs text-muted-foreground">{article.category || 'News'}</span>
      </div>
      
      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Background image pseudo-element if we want to overlay */}
        {article.imageUrl && (
           <div 
             className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-0" 
             style={{ backgroundImage: `url(${article.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
           />
        )}
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          
          <p className="text-lg text-muted-foreground line-clamp-3">
            {article.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
             {article.symbols && article.symbols.map(sym => (
               <button 
                 key={sym} 
                 onClick={(e) => handleTickerClick(e, sym)}
                 className="px-2.5 py-1 bg-background/50 hover:bg-primary/20 border border-border rounded text-xs font-medium text-foreground transition-colors z-20"
               >
                 {sym}
               </button>
             ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-8 pt-4 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">{article.source}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {article.sentiment && (
              <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider
                ${article.sentiment === 'positive' || article.sentiment === 'Bullish' ? 'text-positive bg-positive/10' : 
                  article.sentiment === 'negative' || article.sentiment === 'Bearish' ? 'text-negative bg-negative/10' : 
                  'text-muted-foreground bg-foreground/10'}`}
              >
                {article.sentiment === 'positive' ? 'Bullish' : article.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
              </span>
            )}
            <button className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
              Read Article <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
