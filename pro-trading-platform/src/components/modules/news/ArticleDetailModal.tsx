import React from 'react';
import { NewsArticle } from '@/store/useNewsStore';
import { X, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const { setActiveSymbol, setActiveTab } = useDashboardStore();

  if (!article) return null;

  const handleTickerClick = (symbol: string) => {
    setActiveSymbol(symbol);
    setActiveTab('Dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card w-full max-w-3xl max-h-full rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.category || 'General'}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
            {article.title}
          </h2>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>{new Date(article.publishedAt).toLocaleString()}</span>
            {article.sentiment && article.sentiment !== 'neutral' && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                article.sentiment === 'positive' || article.sentiment === 'Bullish' ? 'text-positive bg-positive/10' : 'text-negative bg-negative/10'
              }`}>
                {article.sentiment === 'positive' ? 'Bullish' : 'Bearish'} Sentiment
              </span>
            )}
          </div>

          {article.imageUrl && (
            <div className="w-full h-64 sm:h-80 mb-8 rounded-xl bg-muted bg-cover bg-center border border-border" style={{ backgroundImage: `url(${article.imageUrl})` }} />
          )}

          <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed mb-8">
            <p>{article.description}</p>
          </div>

          {article.symbols && article.symbols.length > 0 && (
            <div className="mb-8 p-4 bg-background rounded-xl border border-border">
              <h4 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-3">Mentioned Assets</h4>
              <div className="flex flex-wrap gap-2">
                {article.symbols.map(sym => (
                  <button
                    key={sym}
                    onClick={() => handleTickerClick(sym)}
                    className="px-3 py-1.5 bg-card hover:bg-primary/20 border border-border hover:border-primary/50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-card/50 flex justify-end">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            Read Full Article <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
