import { useState, useEffect } from "wouter/use-location"; // For url state if needed, using standard react state here
import { useLocation } from "wouter";
import { useListPeppers, useGetPepperCategories } from "@workspace/api-client-react";
import { PepperCard } from "@/components/pepper/PepperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState as useReactState, useEffect as useReactEffect } from "react";

export default function Shop() {
  const [location, navigate] = useLocation();
  
  // Parse URL params
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [category, setCategory] = useReactState(initialCategory);
  const [search, setSearch] = useReactState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);

  // Update URL when filters change
  useReactEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (debouncedSearch) params.set("search", debouncedSearch);
    
    const newSearch = params.toString();
    const newUrl = newSearch ? `/shop?${newSearch}` : "/shop";
    if (window.location.pathname + window.location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [category, debouncedSearch, navigate]);

  const queryParams = {
    ...(category !== "all" ? { category } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {})
  };

  const { data: peppers, isLoading: isLoadingPeppers } = useListPeppers(queryParams);
  const { data: categories } = useGetPepperCategories();

  const clearFilters = () => {
    setCategory("all");
    setSearch("");
  };

  const hasFilters = category !== "all" || search !== "";

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">The Pepper Catalog</h1>
          <p className="text-muted-foreground text-lg">Browse our entire collection of fiery pods.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search peppers..." 
              className="pl-9 w-full bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Heat Levels</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
          {category !== "all" && (
            <Button variant="secondary" size="sm" onClick={() => setCategory("all")} className="h-7 text-xs rounded-full">
              Category: {category} <X className="ml-1 w-3 h-3" />
            </Button>
          )}
          {search && (
            <Button variant="secondary" size="sm" onClick={() => setSearch("")} className="h-7 text-xs rounded-full">
              Search: "{search}" <X className="ml-1 w-3 h-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground">
            Clear All
          </Button>
        </div>
      )}

      {isLoadingPeppers ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-[420px] w-full" />)}
        </div>
      ) : peppers && peppers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {peppers.map((pepper, i) => (
            <PepperCard key={pepper.id} pepper={pepper} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-muted/30">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No peppers found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">We couldn't find any peppers matching your current filters. Try adjusting your search or category.</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
}
