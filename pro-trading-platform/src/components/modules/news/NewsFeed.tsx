import React from 'react';
import { useNewsStore, NewsArticle } from '@/store/useNewsStore';
import { NewsCard } from './NewsCard';

interface NewsFeedProps {
  onArticleClick: (article: NewsArticle) => void;
}

export function NewsFeed({ onArticleClick }: NewsFeedProps) {
  const { articles, isLoading } = useNewsStore();

  // Skip the first article since it's shown in TopMarketNews
  const feedArticles = articles.length > 1 ? articles.slice(1) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-card/30 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (feedArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground font-medium mb-2">No relevant news found.</p>
        <p className="text-sm text-muted-foreground">Try another market, ticker or keyword.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feedArticles.map(article => (
        <NewsCard key={article.id} article={article} onClick={onArticleClick} />
      ))}
    </div>
  );
}
