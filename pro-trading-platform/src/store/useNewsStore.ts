import { create } from 'zustand';

export type Sentiment = 'Bullish' | 'Neutral' | 'Bearish';

export interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category?: string;
  sentiment?: Sentiment | 'positive' | 'negative' | 'neutral';
  symbols?: string[];
}

interface NewsState {
  searchQuery: string;
  activeMarket: string;
  activeCategory: string;
  activeTimeFilter: string;
  activeSentimentFilter: string;
  
  articles: NewsArticle[];
  trending: { symbol: string, mentions: number, sentiment: string }[];
  marketSentiment: { bullish: number, neutral: number, bearish: number };
  
  isLoading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setActiveMarket: (market: string) => void;
  setActiveCategory: (category: string) => void;
  setActiveTimeFilter: (filter: string) => void;
  setActiveSentimentFilter: (filter: string) => void;

  fetchNews: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchMarketSentiment: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  searchQuery: '',
  activeMarket: 'All',
  activeCategory: 'All',
  activeTimeFilter: 'Latest',
  activeSentimentFilter: 'All',

  articles: [],
  trending: [],
  marketSentiment: { bullish: 45, neutral: 32, bearish: 23 },

  isLoading: false,
  error: null,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNews();
  },
  setActiveMarket: (market) => {
    set({ activeMarket: market, activeCategory: 'All' });
    get().fetchNews();
  },
  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().fetchNews();
  },
  setActiveTimeFilter: (filter) => {
    set({ activeTimeFilter: filter });
    // In a real app, you'd pass this to fetchNews
    get().fetchNews();
  },
  setActiveSentimentFilter: (filter) => {
    set({ activeSentimentFilter: filter });
    // This could also be a local filter over 'articles' or an API parameter
  },

  fetchNews: async () => {
    const { searchQuery, activeMarket, activeCategory } = get();
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (activeCategory !== 'All') queryParams.append('category', activeCategory);
      if (activeMarket !== 'All') queryParams.append('market', activeMarket);
      
      // Fallback for API integration - pointing to our new backend route
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/news?${queryParams.toString()}`);
      
      if (!res.ok) throw new Error('Failed to fetch news');
      
      const data = await res.json();
      if (data.success) {
        set({ articles: data.data, isLoading: false });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback data for UI design if backend fails or API keys aren't set
      set({
        isLoading: false,
        error: err.message,
        articles: [
          {
            id: '1',
            title: 'NVIDIA Announces Major AI Infrastructure Expansion',
            description: 'Nvidia Corp. plans to expand its global data center footprint by partnering with leading regional telecom operators...',
            source: 'Reuters',
            url: '#',
            publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            category: 'Technology',
            sentiment: 'positive',
            symbols: ['NVDA', 'TSLA']
          },
          {
            id: '2',
            title: 'Fed signals potential rate cut as inflation cools',
            description: 'Federal Reserve officials indicated they may lower borrowing costs soon if inflation continues to show signs of returning to the 2% target.',
            source: 'Bloomberg',
            url: '#',
            publishedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(), // 24 mins ago
            category: 'Economy',
            sentiment: 'neutral',
            symbols: []
          },
          {
            id: '3',
            title: 'Bitcoin Surges Past Key Resistance Level',
            description: 'The world\'s largest cryptocurrency broke out of its month-long consolidation range today amid strong institutional buying.',
            source: 'CoinDesk',
            url: '#',
            publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            category: 'Crypto',
            sentiment: 'positive',
            symbols: ['BTC/USD']
          },
          {
            id: '4',
            title: 'Global Markets Dip Amid Geopolitical Tensions',
            description: 'Equities slid across Asia and Europe as investors fled to safe haven assets like gold following recent developments.',
            source: 'WSJ',
            url: '#',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            category: 'Markets',
            sentiment: 'negative',
            symbols: ['GOLD']
          }
        ]
      });
    }
  },

  fetchTrending: async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/news/trending`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          set({ trending: data.data });
          return;
        }
      }
      throw new Error("Fallback");
    } catch (e) {
      set({
        trending: [
          { symbol: 'NVDA', mentions: 128, sentiment: 'Bullish' },
          { symbol: 'BTC', mentions: 96, sentiment: 'Neutral' },
          { symbol: 'TSLA', mentions: 81, sentiment: 'Bearish' },
          { symbol: 'GOLD', mentions: 64, sentiment: 'Bullish' },
          { symbol: 'AAPL', mentions: 45, sentiment: 'Neutral' }
        ]
      });
    }
  },
  
  fetchMarketSentiment: async () => {
     try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/news/sentiment`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({ marketSentiment: data.data });
          return;
        }
      }
      throw new Error("Fallback");
    } catch (e) {
      // Keep default
    }
  }
}));
