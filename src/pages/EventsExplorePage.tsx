import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { useSocket } from '../context/SocketContext';
import {
  Search,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Sparkles,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface EventsExplorePageProps {
  onSelectEventToBook: (event: EventItem) => void;
}

export const EventsExplorePage: React.FC<EventsExplorePageProps> = ({ onSelectEventToBook }) => {
  const { lastEvent } = useSocket();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const categories = [
    'all',
    'Technology & AI',
    'Music & Festivals',
    'Business & Networking',
    'Workshops & Education',
  ];

  const cities = ['all', 'Karachi', 'Lahore', 'Islamabad'];

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Listen to WebSocket events (seat availability updates or new events)
  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'ticket:booked') {
        const { eventId, ticketCount } = lastEvent.payload;
        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId ? { ...e, totalSold: (e.totalSold || 0) + ticketCount } : e
          )
        );
      } else if (lastEvent.type === 'event:published') {
        setEvents((prev) => [lastEvent.payload, ...prev]);
      }
    }
  }, [lastEvent]);

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && ev.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(term) ||
        ev.description.toLowerCase().includes(term) ||
        ev.venue.toLowerCase().includes(term) ||
        (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(term)))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-10 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Event Ticketing & One-Time QR Check-In Platform</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Discover Events, <br />
            <span className="text-indigo-400">Reserve & Check-In Fast</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Instant digital ticket issuance with unique cryptographic QR passes, atomic overselling protection, and lightning-fast gate verification.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400">Check-In Engine</p>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">One-Time Only</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400">Seat Capacity</p>
            <p className="font-bold text-indigo-400 text-sm mt-0.5">No Overselling</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400">Unique Code</p>
            <p className="font-bold text-purple-400 text-sm mt-0.5">Scannable QR Pass</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400">Live Gate Sync</p>
            <p className="font-bold text-amber-400 text-sm mt-0.5">WebSocket KDS</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tech summits, music festivals, venues, keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-500 font-semibold mr-1">City:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-colors whitespace-nowrap ${
                  selectedCity === city
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {city === 'all' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? `All Categories (${events.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading live events catalog...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Filter className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-bold text-slate-200">No Events Found</h3>
          <p className="text-xs">Try selecting another city or clearing search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const minPrice = Math.min(...event.tiers.map((t) => t.price));
            const totalRemaining = Math.max(0, event.totalCapacity - event.totalSold);
            const percentSold = Math.min(
              100,
              Math.round((event.totalSold / event.totalCapacity) * 100)
            );
            const isSoldOut = totalRemaining <= 0;

            return (
              <div
                key={event._id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                <div>
                  {/* Banner Image with Badges */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        {event.category}
                      </span>
                      {event.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-md">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-xs text-white font-semibold flex items-center gap-1.5 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{event.city}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Date and Venue */}
                    <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Ticket Tiers Preview */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {event.tiers.map((t) => (
                        <span
                          key={t._id}
                          className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-slate-400 whitespace-nowrap"
                        >
                          {t.name}: <span className="text-indigo-400 font-bold">${t.price}</span>
                        </span>
                      ))}
                    </div>

                    {/* Seat Capacity Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Seats Availability:</span>
                        <span
                          className={`font-semibold ${
                            isSoldOut ? 'text-rose-400' : 'text-indigo-400'
                          }`}
                        >
                          {isSoldOut ? 'Sold Out' : `${totalRemaining} seats remaining`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isSoldOut ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percentSold}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-5 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Starts at</span>
                    <p className="text-base font-black text-white">
                      {minPrice === 0 ? 'FREE' : `$${minPrice.toFixed(2)}`}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectEventToBook(event)}
                    disabled={isSoldOut}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSoldOut
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{isSoldOut ? 'Sold Out' : 'Book Tickets'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
