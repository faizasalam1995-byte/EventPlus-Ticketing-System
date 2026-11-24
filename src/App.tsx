import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { RoleDemoBanner } from './components/RoleDemoBanner';
import { Navbar } from './components/Navbar';
import { BookingModal } from './components/BookingModal';
import { PulseAiModal } from './components/PulseAiModal';
import { EventsExplorePage } from './pages/EventsExplorePage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { CheckInScannerPage } from './pages/CheckInScannerPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { EventManagerPage } from './pages/EventManagerPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { EventItem } from './types';
import { Ticket, Shield, CheckCircle2, Wifi, Sparkles, Building } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, isStaff, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedEventToBook, setSelectedEventToBook] = useState<EventItem | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);

  // Sync ticket count for attendee
  useEffect(() => {
    const fetchTicketCount = async () => {
      try {
        const email = user?.email || 'attendee@eventpulse.com';
        const res = await fetch(`/api/tickets/me?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setTicketCount(data.tickets.length);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchTicketCount();
  }, [user, activeTab]);

  const handleSelectEventToBook = (event: EventItem) => {
    setSelectedEventToBook(event);
  };

  const handleBookingSuccess = (_bookingData: any) => {
    setSelectedEventToBook(null);
    setTicketCount((prev) => prev + 1);
    setActiveTab('tickets');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* 1-Click Role Switcher Demo Bar */}
      <RoleDemoBanner />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAi={() => setIsAiOpen(true)}
        ticketCount={ticketCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'explore' && (
          <EventsExplorePage onSelectEventToBook={handleSelectEventToBook} />
        )}

        {activeTab === 'tickets' && <MyTicketsPage />}

        {activeTab === 'checkin' && <CheckInScannerPage />}

        {activeTab === 'dashboard' && (
          <OrganizerDashboardPage
            onNavigateToScanner={() => setActiveTab('checkin')}
            onNavigateToCreateEvent={() => setActiveTab('events_manage')}
          />
        )}

        {activeTab === 'events_manage' && (
          <EventManagerPage onEventCreated={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'admin' && <AdminAuditPage />}
      </main>

      {/* Simulated Checkout & Booking Modal */}
      {selectedEventToBook && (
        <BookingModal
          event={selectedEventToBook}
          onClose={() => setSelectedEventToBook(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Pulse AI Event Concierge Modal */}
      <PulseAiModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onSelectEvent={(event) => {
          setIsAiOpen(false);
          handleSelectEventToBook(event);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs py-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-600/30">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-tight">
                  EventPulse — Event Ticketing & Check-In System
                </span>
                <p className="text-[11px] text-slate-400">
                  Atomic seat allocation, cryptographic QR check-in, and WebSocket attendance streams.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                MongoDB Atlas Ready
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-purple-400">
                <Wifi className="w-3.5 h-3.5" />
                Socket.IO Live Gates
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Pulse AI Concierge
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
            <p>© 2026 EventPulse Operations. Monorepo (React + TypeScript + Express + MongoDB + Socket.IO).</p>
            <p className="flex items-center gap-1.5">
              Active Session Role: <span className="font-bold text-purple-400 uppercase">{role}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;