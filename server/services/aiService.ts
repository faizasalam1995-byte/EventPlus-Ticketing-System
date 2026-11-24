import { getAllEvents } from './dataService';

export const handleAiEventQuery = async (userPrompt: string) => {
  const events = await getAllEvents();
  const promptLower = (userPrompt || '').toLowerCase().trim();

  if (!promptLower) {
    return {
      message: "Hello! I am **Pulse AI**, your intelligent event assistant. How can I assist you with events, ticket tiers, or venues today?",
      suggestions: ['Show tech events in Karachi', 'What perks are included in VIP?', 'Recommend music festivals'],
    };
  }

  // 1. Tech & AI query
  if (promptLower.includes('tech') || promptLower.includes('ai') || promptLower.includes('developer') || promptLower.includes('code')) {
    const techEvents = events.filter((e) => e.category === 'Technology & AI' || e.tags?.includes('Artificial Intelligence'));
    return {
      message: `Here are the top upcoming technology conferences and summits:\n\n` +
        techEvents
          .map(
            (e) =>
              `🚀 **${e.title}** (${e.city})\n• **Venue**: ${e.venue}\n• **Date**: ${new Date(
                e.startDate
              ).toLocaleDateString()}\n• **Tiers**: ${e.tiers
                .map((t: any) => `${t.name} ($${t.price})`)
                .join(', ')}`
          )
          .join('\n\n') +
        `\n\nWould you like me to guide you through booking a ticket?`,
      recommendations: techEvents,
    };
  }

  // 2. VIP & Perks query
  if (promptLower.includes('vip') || promptLower.includes('perk') || promptLower.includes('benefit') || promptLower.includes('all-access')) {
    const vipHighlights = events
      .map((e) => {
        const vipTier = e.tiers?.find((t: any) => t.name.toLowerCase().includes('vip'));
        if (vipTier) {
          return `⭐ **${e.title}** — **${vipTier.name}** (\$${vipTier.price})\n  Perks: ${vipTier.perks.join(' • ')}`;
        }
        return null;
      })
      .filter(Boolean);

    return {
      message: `Here is a breakdown of our exclusive VIP All-Access experiences:\n\n` +
        vipHighlights.join('\n\n') +
        `\n\nAll VIP tickets include dedicated fast-track turnstile check-in and premium lounge privileges!`,
    };
  }

  // 3. Music, Festivals & Concerts
  if (promptLower.includes('music') || promptLower.includes('festival') || promptLower.includes('concert') || promptLower.includes('art')) {
    const musicEvents = events.filter((e) => e.category === 'Music & Festivals' || e.category === 'Arts & Culture');
    return {
      message: `Here are our upcoming cultural festivals and live concerts:\n\n` +
        musicEvents
          .map(
            (e) =>
              `🎶 **${e.title}** in **${e.city}**\n• **Venue**: ${e.venue}\n• **Schedule**: ${new Date(
                e.startDate
              ).toLocaleDateString()}\n• **Tickets from**: \$${Math.min(...e.tiers.map((t: any) => t.price))}`
          )
          .join('\n\n'),
      recommendations: musicEvents,
    };
  }

  // 4. Cities (Karachi, Lahore, Islamabad)
  if (promptLower.includes('karachi') || promptLower.includes('lahore') || promptLower.includes('islamabad')) {
    const city = promptLower.includes('karachi')
      ? 'Karachi'
      : promptLower.includes('lahore')
      ? 'Lahore'
      : 'Islamabad';
    const cityEvents = events.filter((e) => e.city.toLowerCase() === city.toLowerCase());
    return {
      message: `Here are events happening in **${city}**:\n\n` +
        cityEvents
          .map((e) => `📍 **${e.title}** at ${e.venue} (Starts ${new Date(e.startDate).toLocaleDateString()})`)
          .join('\n'),
      recommendations: cityEvents,
    };
  }

  // 5. Check-In & QR Code FAQ
  if (promptLower.includes('check-in') || promptLower.includes('qr') || promptLower.includes('entry') || promptLower.includes('ticket code')) {
    return {
      message:
        `🎟️ **How EventPulse Check-In Works**:\n\n` +
        `1. After booking, a unique digital pass with a cryptographic ticket code (e.g. \`EP-TK-9842-A1B2\`) and scannable QR Code is instantly issued.\n` +
        `2. Show your QR code at the event entrance or turnstiles.\n` +
        `3. Gate staff will scan the code with the EventPulse Check-In Verifier.\n` +
        `4. Note: Each pass has strict **One-Time Check-In** protection; duplicate scans are automatically rejected!`,
    };
  }

  // General Fallback
  return {
    message:
      `Hello! I am **Pulse AI**. We currently have **${events.length} active events** open for registration across Technology, Music, Business, and Workshops.\n\n` +
      `Here are some popular options:\n` +
      events.slice(0, 3).map((e) => `• **${e.title}** (${e.city}) — From \$${Math.min(...e.tiers.map((t: any) => t.price))}`).join('\n') +
      `\n\nYou can ask me: "What events are in Karachi?", "Show VIP perks", or "How does check-in work?"`,
    recommendations: events.slice(0, 2),
  };
};
