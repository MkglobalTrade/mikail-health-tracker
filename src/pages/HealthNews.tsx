import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Newspaper, RefreshCw } from "lucide-react";

export default function HealthNews() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const newsQuery = trpc.healthNews.list.useQuery({ category: selectedCategory });

  const categories = [
    { value: undefined, label: "All News" },
    { value: "diabetes", label: "Diabetes" },
    { value: "longevity", label: "Longevity" },
    { value: "health", label: "General Health" },
    { value: "nutrition", label: "Nutrition" },
  ];

  const articles = newsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Health News</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => newsQuery.refetch()}
            disabled={newsQuery.isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${newsQuery.isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.value || "all"}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="space-y-4">
          {articles.length > 0 ? (
            articles.map(article => (
              <Card key={article.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-slate-900 text-lg line-clamp-2">
                          {article.title}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {article.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{article.source}</span>
                        <span>{format(new Date(article.publishedDate), "MMM dd, yyyy")}</span>
                      </div>
                      {article.sourceUrl && (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
                        >
                          Read More →
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {newsQuery.isLoading ? "Loading news..." : "No articles found"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">About Health News</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              Stay updated with the latest health news and research. This feed is automatically updated every hour with articles about diabetes, longevity, nutrition, and general health topics.
            </p>
            <p>
              Click "Read More" to visit the original article on the source website.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
