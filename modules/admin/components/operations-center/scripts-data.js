// BUG-059: "Slogan, Theme & Appearance" (Operations Centre) advertised {slogan}/{theme}
// tokens as "used in every speech script," but no default script text actually contained
// those tokens, and nothing substituted them even where an admin typed them manually. Every
// segment below now ends with a standard line carrying both tokens (see
// scripts-tab.jsx interpolateNames for the substitution), so the chapter's slogan/theme
// gets reinforced consistently through the whole programme without the admin retyping it
// into 16 separate scripts.
const THEME_LINE = " Today, we carry forward our chapter's theme — {theme}. {slogan}.";

export const STAGE_SCRIPTS = {
  1: {
    segmentTitle: "Networking & Registration",
    defaultText: "Welcome to RIFAH ! Please proceed to the entrance desk to mark your attendance and collect your name badge. Enjoy networking over tea and coffee before we begin. Feel free to interact and build connections." + THEME_LINE,
  },
  2: {
    segmentTitle: "Tilawat e Quran",
    defaultText: "Ladies and gentlemen, to begin our auspicious gathering with the blessings of Allah (SWT), I invite [Speaker Name] on stage for the recitation of the Holy Quran." + THEME_LINE,
  },
  3: {
    segmentTitle: "Welcome Note",
    defaultText: "A very warm welcome to all distinguished guests, members, and business owners. Thank you for joining us today at the RIFAH [Chapter Name] Chapter event." + THEME_LINE,
  },
  4: {
    segmentTitle: "RIFAH Introduction",
    defaultText: "RIFAH Chamber of Commerce is dedicated to empowering Muslim business owners. Our mission is to foster ethical business practices, networking, and mutual growth within the community. Through initiatives like this, we build a stronger economic foundation." + THEME_LINE,
  },
  5: {
    segmentTitle: "Guest Introduction",
    defaultText: "It is my distinct honor to introduce our chief guest for today, [Speaker Name]. With years of experience and remarkable achievements, their presence today is truly inspiring." + THEME_LINE,
  },
  6: {
    segmentTitle: "Guest Speech",
    defaultText: "Without further ado, I would like to request [Speaker Name] to come forward and share their valuable insights with us." + THEME_LINE,
  },
  7: {
    segmentTitle: "Business Presentation",
    defaultText: "Next on our agenda, we have a business presentation by [Speaker Name], who will walk us through their innovative business model and the unique solutions they offer." + THEME_LINE,
  },
  8: {
    segmentTitle: "Ask & Give Board",
    defaultText: "It's time for our Ask & Give segment! We encourage everyone to clearly state what their business needs and what they can offer to fellow members today. Let's make meaningful connections." + THEME_LINE,
  },
  9: {
    segmentTitle: "Sponsor Spotlight",
    defaultText: "We would like to express our heartfelt gratitude to our main sponsor, [Sponsor Name]. Your support makes events like these possible. Let's hear a few words from their team." + THEME_LINE,
  },
  10: {
    segmentTitle: "Upcoming Events",
    defaultText: "Please mark your calendars! Our next RIFAH event will be focusing on [Topic]. Stay tuned for the dates, and make sure you don't miss out on another fantastic networking opportunity." + THEME_LINE,
  },
  11: {
    segmentTitle: "Hero of Event",
    defaultText: "It's time to recognize the 'Hero of the Event' - someone who has gone above and beyond. This award goes to [Awardee Name] for their outstanding contribution!" + THEME_LINE,
  },
  12: {
    segmentTitle: "Star Connector",
    defaultText: "Networking is at the heart of RIFAH. Today, we award the 'Star Connector' recognition to [Awardee Name] for actively facilitating connections and helping others grow." + THEME_LINE,
  },
  13: {
    segmentTitle: "Renewals & Membership",
    defaultText: "A quick reminder for our existing members regarding membership renewals. For our guests today, we highly encourage you to join the RIFAH family and unlock exclusive benefits." + THEME_LINE,
  },
  14: {
    segmentTitle: "Closing Remarks",
    defaultText: "As we come to the end of our formal program, I want to thank you all for your active participation. Let us carry forward the spirit of collaboration and ethical business." + THEME_LINE,
  },
  15: {
    segmentTitle: "Vote of Thanks",
    defaultText: "On behalf of the RIFAH [Chapter Name] Chapter committee, I extend a heartfelt vote of thanks to our speakers, sponsors, and every one of you for making this event a grand success." + THEME_LINE,
  },
  16: {
    segmentTitle: "Networking & High Tea",
    defaultText: "The formal program has concluded. Please join us for High Tea. Take this time to follow up on your 'Ask & Give' matches and continue networking. Thank you and Allah Hafiz!" + THEME_LINE,
  }
};
