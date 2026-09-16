// Shared facts behind the privacy and cookie policies.
//
// Two rules govern this file.
//
// First, nothing here is invented. Every processing purpose, every cookie and
// every third party named in the policies exists in this codebase and can be
// verified by reading it: the consent defaults in lib/analytics.js, the single
// cookie written by components/ConsentBanner.jsx, the Tag Manager container
// loaded in app/[lang]/layout.jsx and the Clarity snippet that only loads when
// an id is set.
//
// Second, Livdar is currently a project and not an incorporated company. The
// policies say so plainly rather than dressing an MVP up as a registered
// entity. There is no company number here, no VAT id and no registered office,
// because there is none to state, and inventing one would mislead exactly the
// people the policy exists to protect. When the company is registered, fill
// IDENTITY below and extend the wording; the gate will then require it.

export const IDENTITY = {
  // The name the project uses publicly. Not a company name.
  publicName: 'Livdar MVP',
  contactEmail: 'livdarlive@gmail.com',
  // Flip to true only when there is a real registration to state, and add the
  // registration fields alongside it. The quality gate reads this flag.
  incorporated: false,
};

// Patterns that must never reach a published policy.
//
// These match shapes, not topics. A sentence that says "there is no company
// number to quote" is exactly what we want a policy to say while the project is
// unincorporated, so scanning for the phrase "company number" would block the
// honest wording and let a fabricated number through. What gets blocked here is
// an actual identifier shaped value, an unfilled template token, or a filler
// string that only ever appears in an unfinished document.
export const FORBIDDEN_LEGAL_PATTERNS = [
  { name: 'unfilled template token', re: /\{\{\s*[A-Za-z0-9_]+\s*\}\}/ },
  { name: 'Romanian trade register number', re: /\bJ\s?\d{1,2}\s?\/\s?\d{1,7}\s?\/\s?\d{4}\b/ },
  { name: 'Romanian VAT or fiscal code', re: /\bRO\s?\d{6,10}\b/ },
  { name: 'German VAT id', re: /\bDE\s?\d{9}\b/ },
  { name: 'generic EU VAT id', re: /\b(AT|BE|BG|CY|CZ|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|SE|SI|SK)\s?\d{8,12}\b/ },
  { name: 'filler text', re: /lorem ipsum|XXXXX|placeholder|TBD|TODO/i },
  { name: 'sample address', re: /Str\.?\s?Exemplu|Example Street|Musterstrasse|123 Fake/i },
  { name: 'test registration', re: /TEST[- ]?(ADDRESS|REGISTRATION|VAT|COMPANY)/i },
];

// While IDENTITY.incorporated is false, the privacy policy must contain an
// explicit statement that Livdar is a project and not a registered company.
// This is the positive half of the rule: it is not enough to avoid fake
// numbers, the reader has to be told what they are dealing with. One marker per
// market, matched case insensitively.
export const NOT_INCORPORATED_MARKERS = {
  en: 'not an incorporated company',
  de: 'kein eingetragenes Unternehmen',
  ro: 'nu o societate inregistrata',
};

// What the site does today, stated once and reused by both policies in all
// markets so the two documents can never contradict each other.
export const PROCESSING = {
  analytics: {
    tool: 'Google Analytics 4 via Google Tag Manager',
    measurementId: 'G-DY02HH34DT',
    containerId: 'GTM-WKGXHXWC',
    account: 'livdarlive@gmail.com',
    lawfulBasis: 'consent',
    retention: '14 months',
  },
  clarity: {
    tool: 'Microsoft Clarity',
    state: 'prepared but not active, loads only when a project id is configured',
    lawfulBasis: 'consent',
  },
  consentCookie: {
    name: 'livdar_consent',
    purpose: 'stores the visitor choice on statistics and marketing cookies',
    lifetime: '180 days',
    lawfulBasis: 'necessary, no consent required',
  },
  waitlist: {
    purpose: 'notify a visitor when plans for a destination become available',
    state: 'interface exists, no contact details are collected while no supplier is connected',
  },
};
