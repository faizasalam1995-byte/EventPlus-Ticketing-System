import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export const getSeedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  return [
    {
      _id: '6740a1010000000000000001',
      name: 'Zainab Ahmed',
      email: 'attendee@eventpulse.com',
      password: passwordHash,
      role: 'attendee',
      phone: '+92 300 1234567',
      organization: 'Tech Community Member',
    },
    {
      _id: '6740a1010000000000000002',
      name: 'Farhan Malik (Pulse Events)',
      email: 'organizer@eventpulse.com',
      password: passwordHash,
      role: 'organizer',
      phone: '+92 321 9876543',
      organization: 'Pulse Event Productions',
    },
    {
      _id: '6740a1010000000000000003',
      name: 'Syed Raza (System Director)',
      email: 'admin@eventpulse.com',
      password: passwordHash,
      role: 'admin',
      phone: '+92 333 5556677',
      organization: 'EventPulse HQ',
    },
  ];
};

export const getSeedEvents = () => {
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const events = [
    {
      _id: '6740a2010000000000000001',
      title: 'Global AI & Cloud Summit 2026',
      slug: 'global-ai-cloud-summit-2026',
      description:
        'Join 2,500+ engineers, enterprise architects, and technology leaders. Featuring 25+ international keynotes on generative AI, autonomous agent workflows, distributed cloud architectures, and real-time edge computing.',
      category: 'Technology & AI',
      venue: 'Karachi Expo Centre, Hall 1 & 2',
      city: 'Karachi',
      address: 'Main University Road, Gulshan-e-Iqbal',
      startDate: daysFromNow(7),
      endDate: daysFromNow(8),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      organizerId: '6740a1010000000000000002',
      organizerName: 'Farhan Malik (Pulse Events)',
      status: 'published',
      isFeatured: true,
      tags: ['Artificial Intelligence', 'Cloud', 'DevOps', 'Networking', 'Keynotes'],
      tiers: [
        {
          _id: '6740a3010000000000000001',
          name: 'Early Bird Pass',
          price: 25.0,
          capacity: 100,
          soldCount: 78,
          maxPerBooking: 4,
          description: 'Discounted access for early registrants. Includes full keynote entry and badge.',
          perks: ['Keynote Sessions Access', 'Conference Badge & Swag Bag', 'Buffet Lunch & Coffee'],
        },
        {
          _id: '6740a3010000000000000002',
          name: 'General Admission',
          price: 49.0,
          capacity: 300,
          soldCount: 142,
          maxPerBooking: 5,
          description: 'Standard 2-day access to all technical tracks, workshops, and exhibition hall.',
          perks: [
            '2-Day Full Conference Entry',
            'Access to Technical Workshop Labs',
            'Certificate of Participation',
            'Networking Luncheon',
          ],
        },
        {
          _id: '6740a3010000000000000003',
          name: 'VIP All-Access Pass',
          price: 120.0,
          capacity: 50,
          soldCount: 35,
          maxPerBooking: 2,
          description: 'Exclusive executive privileges including private speaker lounge and dinner.',
          perks: [
            'Reserved Front-Row Seating',
            'VIP Speaker Lounge Access',
            'Executive Dinner & Networking',
            'Fast-Track Check-In Lane',
          ],
        },
      ],
      createdAt: now,
    },
    {
      _id: '6740a2010000000000000002',
      title: 'Neon Horizons Music & Arts Festival',
      slug: 'neon-horizons-music-festival',
      description:
        'An open-air festival featuring indie electronic ensembles, acoustic acts, projection art installations, artisanal food vendors, and laser light shows under the night sky.',
      category: 'Music & Festivals',
      venue: 'Alhamra Open Air Amphitheatre',
      city: 'Lahore',
      address: 'Shahrah-e-Quaid-e-Azam, Mall Road',
      startDate: daysFromNow(14),
      endDate: daysFromNow(15),
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      organizerId: '6740a1010000000000000002',
      organizerName: 'Farhan Malik (Pulse Events)',
      status: 'published',
      isFeatured: true,
      tags: ['Live Music', 'Indie', 'Visual Art', 'Festival', 'Food Trucks'],
      tiers: [
        {
          _id: '6740a3010000000000000004',
          name: 'Single Day Pass (Saturday)',
          price: 18.0,
          capacity: 200,
          soldCount: 110,
          maxPerBooking: 5,
          description: 'Access to Saturday line-up and festival grounds from 4 PM till midnight.',
          perks: ['Ground Entry', 'Food Village Access', 'Concert Arena'],
        },
        {
          _id: '6740a3010000000000000005',
          name: 'Weekend Full Pass',
          price: 32.0,
          capacity: 150,
          soldCount: 95,
          maxPerBooking: 4,
          description: 'Complete 2-day festival experience with re-entry wristband.',
          perks: ['2-Day Festival Access', 'Express Entrance', 'Festival Merchandise T-Shirt'],
        },
        {
          _id: '6740a3010000000000000006',
          name: 'Backstage VIP Enclosure',
          price: 75.0,
          capacity: 40,
          soldCount: 28,
          maxPerBooking: 2,
          description: 'Elevated VIP deck, private bar, artist meet & greet photo opportunities.',
          perks: ['Elevated Viewing Platform', 'Complimentary Beverages', 'Artist Meet & Greet Access'],
        },
      ],
      createdAt: now,
    },
    {
      _id: '6740a2010000000000000003',
      title: 'Fintech & Venture Capital Nexus 2026',
      slug: 'fintech-venture-capital-nexus',
      description:
        'A high-impact gathering uniting 150+ funded startup founders, angel investors, family offices, and leading VC partners to discuss cross-border payments, digital banking, and venture rounds.',
      category: 'Business & Networking',
      venue: 'Serena Grand Ballroom',
      city: 'Islamabad',
      address: 'Khayaban-e-Suhrawardy, Sector G-5',
      startDate: daysFromNow(21),
      endDate: daysFromNow(21),
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      organizerId: '6740a1010000000000000002',
      organizerName: 'Farhan Malik (Pulse Events)',
      status: 'published',
      isFeatured: false,
      tags: ['Fintech', 'Venture Capital', 'Startups', 'Pitching', 'Investment'],
      tiers: [
        {
          _id: '6740a3010000000000000007',
          name: 'Founder Delegate',
          price: 35.0,
          capacity: 80,
          soldCount: 40,
          maxPerBooking: 2,
          description: 'For startup founders looking to pitch and network with regional VCs.',
          perks: ['Full Day Access', 'Founder Pitch Stage Entry', 'Curated 1-on-1 Investor Speed Dating'],
        },
        {
          _id: '6740a3010000000000000008',
          name: 'Investor VIP Pass',
          price: 90.0,
          capacity: 40,
          soldCount: 24,
          maxPerBooking: 2,
          description: 'For accredited angel investors, funds, and corporate investment arms.',
          perks: ['Investor Deal-Room Access', 'Executive Lunch & High-Tea', 'Founder Directory & Pitch Decks'],
        },
      ],
      createdAt: now,
    },
    {
      _id: '6740a2010000000000000004',
      title: 'Masterclass: Modern Distributed Systems',
      slug: 'masterclass-modern-distributed-systems',
      description:
        'Hands-on full-day intensive masterclass covering WebSocket live pipelines, real-time message brokers, caching strategies, and atomic concurrency patterns in production.',
      category: 'Workshops & Education',
      venue: 'National Incubation Centre (NIC)',
      city: 'Karachi',
      address: 'NED University Campus, University Road',
      startDate: daysFromNow(28),
      endDate: daysFromNow(28),
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
      organizerId: '6740a1010000000000000002',
      organizerName: 'Farhan Malik (Pulse Events)',
      status: 'published',
      isFeatured: false,
      tags: ['System Design', 'WebSockets', 'Backend', 'Masterclass', 'Hands-on'],
      tiers: [
        {
          _id: '6740a3010000000000000009',
          name: 'Student Pass',
          price: 15.0,
          capacity: 50,
          soldCount: 32,
          maxPerBooking: 1,
          description: 'Special discounted admission for active university students.',
          perks: ['Full Day Workshop', 'Code Repositories Access', 'Student Certificate'],
        },
        {
          _id: '6740a3010000000000000010',
          name: 'Professional Pass',
          price: 40.0,
          capacity: 60,
          soldCount: 20,
          maxPerBooking: 3,
          description: 'For software engineers and tech leads.',
          perks: ['Full Day Workshop', 'System Design Code Blueprint', 'Verified Professional Credential'],
        },
      ],
      createdAt: now,
    },
  ];

  return events.map((event) => {
    const totalCapacity = event.tiers.reduce((sum, t) => sum + t.capacity, 0);
    const totalSold = event.tiers.reduce((sum, t) => sum + t.soldCount, 0);

    return {
      ...event,
      totalCapacity,
      totalSold,
      tiers: event.tiers.map((tier) => ({
        ...tier,
        eventId: event._id,
      })),
    };
  });
};

export const getSeedBookingsAndTickets = async () => {
  const events = getSeedEvents();
  const event1 = events[0]; // Global AI Summit
  const event2 = events[1]; // Neon Horizons

  // Teeno QR codes ek sath parallel generate honge
  const [qrCode1, qrCode2, qrCode3] = await Promise.all([
    QRCode.toDataURL('EP-AI-9021-VIP1', { margin: 1, width: 220 }),
    QRCode.toDataURL('EP-AI-9022-GA1', { margin: 1, width: 220 }),
    QRCode.toDataURL('EP-NH-4105-WKD', { margin: 1, width: 220 }),
  ]);

  const bookings = [
    {
      _id: '6740a4010000000000000001',
      bookingNumber: 'EP-BK-8901',
      eventId: event1._id,
      eventTitle: event1.title,
      userId: '6740a1010000000000000001',
      customerName: 'Zainab Ahmed',
      customerEmail: 'attendee@eventpulse.com',
      customerPhone: '+92 300 1234567',
      totalAmount: 169.0,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      ticketCount: 2,
      tierBreakdown: [
        {
          tierId: '6740a3010000000000000003',
          tierName: 'VIP All-Access Pass',
          quantity: 1,
          price: 120.0,
        },
        {
          tierId: '6740a3010000000000000002',
          tierName: 'General Admission',
          quantity: 1,
          price: 49.0,
        },
      ],
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      _id: '6740a4010000000000000002',
      bookingNumber: 'EP-BK-8902',
      eventId: event2._id,
      eventTitle: event2.title,
      userId: '6740a1010000000000000001',
      customerName: 'Zainab Ahmed',
      customerEmail: 'attendee@eventpulse.com',
      customerPhone: '+92 300 1234567',
      totalAmount: 32.0,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      ticketCount: 1,
      tierBreakdown: [
        {
          tierId: '6740a3010000000000000005',
          tierName: 'Weekend Full Pass',
          quantity: 1,
          price: 32.0,
        },
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  const tickets = [
    {
      _id: '6740a5010000000000000001',
      ticketCode: 'EP-AI-9021-VIP1',
      bookingId: '6740a4010000000000000001',
      eventId: event1._id,
      eventTitle: event1.title,
      eventDate: event1.startDate,
      eventVenue: event1.venue,
      eventCity: event1.city,
      tierId: '6740a3010000000000000003',
      tierName: 'VIP All-Access Pass',
      attendeeName: 'Zainab Ahmed',
      attendeeEmail: 'attendee@eventpulse.com',
      price: 120.0,
      isCheckedIn: false, // Live scan demo ke liye ready
      qrCodeDataUrl: qrCode1,
      seatNumber: 'VIP-Row-A-12',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      _id: '6740a5010000000000000002',
      ticketCode: 'EP-AI-9022-GA1',
      bookingId: '6740a4010000000000000001',
      eventId: event1._id,
      eventTitle: event1.title,
      eventDate: event1.startDate,
      eventVenue: event1.venue,
      eventCity: event1.city,
      tierId: '6740a3010000000000000002',
      tierName: 'General Admission',
      attendeeName: 'Tariq Hassan',
      attendeeEmail: 'tariq@example.com',
      price: 49.0,
      isCheckedIn: true, // Duplicate check-in rejection demo ke liye ready
      checkInTime: new Date(Date.now() - 35 * 60 * 1000),
      checkedInBy: 'Farhan Malik (Pulse Events)',
      qrCodeDataUrl: qrCode2,
      seatNumber: 'Hall-B-Row-14',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      _id: '6740a5010000000000000003',
      ticketCode: 'EP-NH-4105-WKD',
      bookingId: '6740a4010000000000000002',
      eventId: event2._id,
      eventTitle: event2.title,
      eventDate: event2.startDate,
      eventVenue: event2.venue,
      eventCity: event2.city,
      tierId: '6740a3010000000000000005',
      tierName: 'Weekend Full Pass',
      attendeeName: 'Zainab Ahmed',
      attendeeEmail: 'attendee@eventpulse.com',
      price: 32.0,
      isCheckedIn: false,
      qrCodeDataUrl: qrCode3,
      seatNumber: 'Standing-General',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  const checkIns = [
    {
      _id: '6740a6010000000000000001',
      ticketId: '6740a5010000000000000002',
      ticketCode: 'EP-AI-9022-GA1',
      eventId: event1._id,
      eventTitle: event1.title,
      attendeeName: 'Tariq Hassan',
      tierName: 'General Admission',
      verifiedAt: new Date(Date.now() - 35 * 60 * 1000),
      verifiedByName: 'Farhan Malik (Pulse Events)',
      verifiedByRole: 'organizer',
      status: 'verified',
      gate: 'Main Turnstile Gate A',
    },
  ];

  return { bookings, tickets, checkIns };
};