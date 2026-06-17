'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Newspaper, ExternalLink, Clock, RefreshCw, Loader2, BookOpen, Microscope, Heart, Brain, Zap, TrendingUp, FlaskConical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/skeleton'
import { useHealthData } from '@/hooks/useHealthData'
import { fetchHealthNews } from '@/lib/ai'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Breakthrough: <Microscope className="w-3.5 h-3.5" />,
  Research: <BookOpen className="w-3.5 h-3.5" />,
  Technology: <Zap className="w-3.5 h-3.5" />,
  Neuroscience: <Brain className="w-3.5 h-3.5" />,
  Longevity: <Heart className="w-3.5 h-3.5" />,
  Health: <Heart className="w-3.5 h-3.5" />,
  Debate: <BookOpen className="w-3.5 h-3.5" />,
  Nutrition: <FlaskConical className="w-3.5 h-3.5" />,
  Fitness: <TrendingUp className="w-3.5 h-3.5" />,
}

const CATEGORY_COLOR: Record<string, string> = {
  Breakthrough: '#ef4444',
  Research: '#3b82f6',
  Technology: '#8b5cf6',
  Neuroscience: '#ec4899',
  Longevity: '#10b981',
  Health: '#0ea5e9',
  Debate: '#f59e0b',
  Nutrition: '#f97316',
  Fitness: '#06b6d4',
}

export default function NewsPage() {
  const { news, addNews } = useHealthData()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadNews = async () => {
    setLoading(true)
    try {
      const articles = await fetchHealthNews()
      articles.forEach(addNews)
      addToast('News refreshed', 'success')
    } catch {
      addToast('Failed to load news', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (news.length === 0) loadNews() }, [])

  const categories = ['all', ...Array.from(new Set(news.map(n => n.category)))]
  const filtered = selectedCategory === 'all' ? news : news.filter(n => n.category === selectedCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Health News</h1>
          <p className="text-sm text-muted-foreground mt-1">Latest on longevity, breakthroughs, and health debates</p>
        </div>
        <Button onClick={loadNews} disabled={loading} variant="outline" className="gap-2 w-fit">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
              selectedCategory === cat ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-transparent hover:border-border')}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {loading && news.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="h-48"><CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent></Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No news yet</p>
          <Button onClick={loadNews} className="mt-4 gap-2"><Loader2 className={cn('w-4 h-4', loading && 'animate-spin')} /> Load News</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(article => {
            const color = CATEGORY_COLOR[article.category] || '#6b7280'
            const icon = CATEGORY_ICON[article.category] || <Newspaper className="w-3.5 h-3.5" />
            return (
              <Card key={article.id} className="hover:shadow-md transition-all flex flex-col h-full group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1.5" style={{ backgroundColor: color }}>
                      {icon} {article.category}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">{article.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                    </div>
                    {article.sourceUrl && (
                      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
