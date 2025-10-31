/**
 * ContactManagerAgent - Provides invitation templates and RSVP suggestions
 *
 * WHY: FR-038 to FR-044 require contact management suggestions.
 * This agent is RULES-BASED (not LLM) providing template text.
 */

import type { Agent, Decision } from "../types/agent";
import type { ContactSuggestion, PartyConstraints } from "../types/party";

export class ContactManagerAgent implements Agent {
  id = "contact";

  async decide(input: any): Promise<Decision> {
    const constraints = input as PartyConstraints;

    // Calculate invitation timeline (send 2-3 weeks before party)
    const partyDate = new Date(constraints.date);
    const today = new Date();
    const daysUntilParty = Math.ceil(
      (partyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const sendTimelineDays = Math.max(14, Math.min(daysUntilParty - 3, 21));

    // Generate invitation template
    const invitationTemplate = `
🎃 You're Invited to a Spooktacular Halloween Party! 🎃

Date: ${constraints.date}
Guests: ${constraints.guestCount} friends
Theme: [To be announced after theme selection]

Join us for an unforgettable Halloween celebration filled with:
✨ Delicious themed food and drinks
🎨 Spooky decorations
🎵 Curated Halloween music
👻 Great company and Halloween spirit

Please RSVP by [DATE] so we can plan accordingly.
${
  constraints.dietaryRestrictions?.length
    ? "\n📋 Let us know about any dietary restrictions!"
    : ""
}

Can't wait to celebrate with you!
`.trim();

    // Determine best RSVP method based on guest count
    let rsvpMethod: "email" | "phone" | "online-form" | "paper" = "email";
    if (constraints.guestCount > 50) {
      rsvpMethod = "online-form"; // Online form for large parties
    } else if (constraints.guestCount < 15) {
      rsvpMethod = "phone"; // Phone for small intimate gatherings
    }

    // Reminder schedule (send reminders at specific days before party)
    const reminderSchedule = [7, 3, 1]; // 1 week, 3 days, 1 day before

    const contactSuggestion: ContactSuggestion = {
      invitationTemplate,
      rsvpMethod,
      sendTimelineDays,
      reminderSchedule,
    };

    return {
      agentId: this.id,
      description: `Send invitations ${sendTimelineDays} days before party via ${rsvpMethod}`,
      confidence: 0.9,
      data: contactSuggestion,
      rationale: `For ${constraints.guestCount} guests, ${rsvpMethod} is most efficient. Send ${sendTimelineDays} days ahead for optimal response rate.`,
    };
  }
}
