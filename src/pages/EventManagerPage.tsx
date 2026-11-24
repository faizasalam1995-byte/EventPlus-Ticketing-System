import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EventItem, TicketTier } from '../types';

interface EventManagerPageProps {
  onEventCreated?: () => void;
}

export const EventManagerPage: React.FC<EventManagerPageProps> = ({ onEventCreated }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & AI');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Karachi');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('Tech, Innovation, Networking');

  // Ticket Tiers State (Minimum 1 tier required)
  const [tiers, setTiers] = useState<Array<{
    name: string;
    price: number;
    capacity: number;
    maxPerBooking: number;
    perks: string;
  }>>([
    {
      name: 'General Admission',
      price: 50,
      capacity: 200,
      maxPerBooking: 4,
      perks: 'Keynote Access, Expo Hall, Networking Lounge',
    },
    {
      name: 'VIP Executive Pass',
      price: 150,
      capacity: 50,
      maxPerBooking: 2,
      perks: 'Front Row Seating, Speaker Dinner, Fast-Track Check-In, Swag Bag',
    },
  ]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    setTiers([
      ...tiers,
      {
        name: 'New Tier Pass',
        price: 25,
        capacity: 100,
        maxPerBooking: 5,
        perks: 'Entry pass, Digital Certificate',
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      setErrorMessage('An event must have at least one ticket tier.');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: string, value: any) => {
    const updated = [...tiers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Input Validation
    if (!title.trim() || !venue.trim() || !startDate || !endDate) {
      setErrorMessage('Please fill in all mandatory event fields: Title, Venue, and Dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage('Event End Date cannot be earlier than Start Date.');
      return;
    }

    if (tiers.length === 0) {
      setErrorMessage('Please configure at least one ticket tier.');
      return;
    }

    for (const t of tiers) {
      if (!t.name.trim()) {
        setErrorMessage('All ticket tiers must have a valid name.');
        return;
      }
      if (t.capacity <= 0) {
        setErrorMessage(`Tier "${t.name}" must have capacity greater than 0.`);
        return;
      }
      if (t.maxPerBooking <= 0) {
        setErrorMessage(`Tier "${t.name}" max booking limit must be at least 1.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('eventpulse_token');
      const payload = {
        title: title.trim(),
        description: description.trim() || 'Join us for this premier live event with industry pioneers.',
        category,
        venue: venue.trim(),
        city,
        address: address.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        image: image.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        tiers: tiers.map((t) => ({
          name: t.name.trim(),
          price: Number(t.price),
          capacity: Number(t.capacity),
          maxPerBooking: Number(t.maxPerBooking),
          perks: t.perks.split(',').map((p) => p.trim()).filter(Boolean),
        })),
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish event');
      }

      setSuccessMessage(`Event "${data.event.title}" published successfully! Live in database.`);
      setShowModal(false);
      fetchEvents();
      if (onEventCreated) onEventCreated();

      // Reset form
      setTitle('');
      setDescription('');
      setVenue('');
      setAddress('');
      setStartDate('');
      setEndDate('');
      setImage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error publishing event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to archive / delete "${title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('eventpulse_token');
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Event "${title}" archived.`);
        fetchEvents();
      } else {
        setErrorMessage(data.message || 'Failed to delete event');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error deleting event');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Organizer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Event Management & Publishing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, update, and manage your events, custom ticket tiers, reservation limits, and venues.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Publish New Event
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            &times;
          </button>
        </div>
      )}

      {/* Events Table / Card List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Published Events ({events.length})</h2>
          <span className="text-xs text-slate-400">Database connected & synchronized</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading events catalog...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No events found. Click "Publish New Event" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((ev) => {
              const totalCapacity = ev.tiers.reduce((sum, t) => sum + (t.capacity || 0), 0);
              const totalSold = ev.tiers.reduce((sum, t) => sum + (t.soldCount || 0), 0);
              const pctSold = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

              return (
                <div key={ev._id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                          {ev.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          {ev.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {ev.city} • {new Date(ev.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {ev.venue} • {ev.address || 'Address provided at booking'}
                      </p>

                      {/* Tier Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ev.tiers.map((tier, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {tier.name}: ${tier.price} ({tier.soldCount}/{tier.capacity})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400">Sales Progress</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {totalSold} / {totalCapacity} ({pctSold}%)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteEvent(ev._id, ev.title)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/50"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Publish New Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Publish New Event
                </h3>
                <p className="text-xs text-slate-500">Configures event data, ticket tiers, and atomic capacity limits.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Event Basics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NextGen Web & Cloud Summit 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Electronic Music">Electronic Music</option>
                    <option value="FinTech & Web3">FinTech & Web3</option>
                    <option value="Engineering Masterclass">Engineering Masterclass</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Business & Startups">Business & Startups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Virtual / Worldwide">Virtual / Worldwide</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue Name & Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Expo Centre Main Arena, Hall 1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed agenda, keynote highlights, and networking opportunities..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Ticket Tiers Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ticket Tiers & Capacities ({tiers.length})
                    </h4>
                    <p className="text-xs text-slate-500">Atomic inventory and reservation limits are applied per tier.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    + Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Tier #{idx + 1}
                        </span>
                        {tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            required
                            value={tier.name}
                            onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                            placeholder="e.g. VIP Access Pass"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={tier.price}
                            onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Total Capacity
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={tier.capacity}
                            onChange={(e) => handleTierChange(idx, 'capacity', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Max Per Booking
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            required
                            value={tier.maxPerBooking}
                            onChange={(e) => handleTierChange(idx, 'maxPerBooking', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Tier Perks (comma separated)
                          </label>
                          <input
                            type="text"
                            value={tier.perks}
                            onChange={(e) => handleTierChange(idx, 'perks', e.target.value)}
                            placeholder="e.g. VIP Lounge, Fast-Track Check-In, Buffet"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  {submitting ? 'Publishing Event...' : 'Publish Event Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
