/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Ticket, Landmark, TreePine, CreditCard, Loader2, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { findPlaces, Place } from '@/lib/gemini';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attractions');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = category || searchQuery || 'tourist attractions';
      const results = await findPlaces(query, location || undefined);
      setPlaces(results);
    } catch (err) {
      setError('Failed to fetch places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    handleSearch('best tourist attractions');
  }, []);

  const filteredPlaces = places.filter(p => {
    if (activeTab === 'attractions') return p.type === 'attraction';
    if (activeTab === 'parks') return p.type === 'park';
    if (activeTab === 'atms') return p.type === 'atm';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              GeoGuide
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search city or place..."
                className="pl-10 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={getUserLocation}
            className="rounded-full gap-2 border-gray-300 hover:bg-gray-50"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Near Me</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Explore Your Next Adventure
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover the best spots, parks, and essential services around you with real-time data and precise directions.
          </p>
        </div>

        {/* Categories Tabs */}
        <Tabs defaultValue="attractions" className="w-full mb-8" onValueChange={(v) => {
          setActiveTab(v);
          handleSearch(v === 'attractions' ? 'tourist attractions' : v === 'parks' ? 'best parks' : 'nearby ATMs');
        }}>
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-12">
              <TabsTrigger value="attractions" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                <Landmark className="w-4 h-4" />
                Attractions
              </TabsTrigger>
              <TabsTrigger value="parks" className="rounded-lg px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white gap-2">
                <TreePine className="w-4 h-4" />
                Parks
              </TabsTrigger>
              <TabsTrigger value="atms" className="rounded-lg px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white gap-2">
                <CreditCard className="w-4 h-4" />
                ATMs
              </TabsTrigger>
            </TabsList>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-none shadow-md">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardFooter className="gap-2">
                      <Skeleton className="h-9 w-24 rounded-full" />
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </CardFooter>
                  </Card>
                ))
              ) : (
                filteredPlaces.map((place, index) => (
                  <motion.div
                    key={place.name + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={`https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/600`}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4">
                          {place.rating && (
                            <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm border-none font-bold">
                              ★ {place.rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardHeader className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {place.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-gray-600 line-clamp-2">
                          {place.description}
                        </CardDescription>
                        {place.address && (
                          <div className="flex items-start gap-1.5 mt-3 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{place.address}</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardFooter className="pt-0 pb-6 px-6 flex flex-wrap gap-2">
                        <a
                          href={place.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2")}
                        >
                          <Navigation className="w-4 h-4" />
                          Directions
                        </a>
                        
                        {place.ticketingUrl && (
                          <a
                            href={place.ticketingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full border-gray-200 hover:bg-gray-50 gap-2")}
                          >
                            <Ticket className="w-4 h-4 text-green-600" />
                            Tickets
                          </a>
                        )}

                        <a
                          href={place.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50")}
                        >
                          View on Maps
                        </a>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {!loading && filteredPlaces.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No places found</h3>
              <p className="text-gray-500">Try searching for a different city or category.</p>
            </div>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">GeoGuide</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 GeoGuide. Powered by Google Maps & Gemini AI.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
