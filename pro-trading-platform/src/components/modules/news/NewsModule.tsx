import React, { useEffect, useState } from 'react';
import { useNewsStore, NewsArticle } from '@/store/useNewsStore';
import { NewsHeader } from './NewsHeader';
import { NewsFilters } from './NewsFilters';
import { TopMarketNews } from './TopMarketNews';
import { NewsFeed } from './NewsFeed';
import { MarketPulsePanel } from './MarketPulsePanel';
import { TrendingSentimentPanel } from './TrendingSentimentPanel';
import { ArticleDetailModal } from './ArticleDetailModal';

export function NewsModule() {
  const { fetchNews, fetchTrending, fetchMarketSentiment } = useNewsStore();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchNews();
    fetchTrending();
    fetchMarketSentiment();
  }, [fetchNews, fetchTrending, fetchMarketSentiment]);

  return (
    <div className="h-full flex flex-col">
      <NewsHeader />
      
      <div className="flex-1 overflow-y-auto">
        <NewsFilters />

        {/* Top Grid: Top News & Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TopMarketNews onArticleClick={setSelectedArticle} />
          </div>
          <div className="lg:col-span-1">
            <MarketPulsePanel />
          </div>
        </div>

        {/* Bottom Grid: News Feed & Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4 border-b border-border pb-2">Latest News</h3>
            <NewsFeed onArticleClick={setSelectedArticle} />
          </div>
          <div className="lg:col-span-1">
            <TrendingSentimentPanel />
          </div>
        </div>
      </div>

      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
}
