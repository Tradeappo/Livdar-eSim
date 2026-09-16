// Privacy and cookie policy, English market.

export const legal = {
  privacy: {
    angle: 'What this site collects today, which is less than most',
    h1: 'Privacy policy',
    title: 'Privacy policy | Livdar',
    metaDescription:
      'What Livdar collects, why, for how long, and the rights you have over it. Written from what the site actually does, not from a template.',
    sectionOrder: ['intro', 'controller', 'what', 'analytics', 'waitlist', 'future', 'sharing', 'retention', 'rights', 'changes', 'faq'],
    intro: [
      'Livdar is an early stage travel connectivity site. No plans are on sale, no payments are taken and no supplier is connected, which means this policy describes far less processing than a comparable shop would.',
      'We would rather publish an accurate short policy now and extend it when we start selling than publish a long one that describes things we do not do.',
    ],
    sections: {
      controller: {
        heading: 'Who is responsible',
        body: [
          'Livdar MVP is the controller of the small amount of personal data described below. We want to be exact about what that means: Livdar MVP is an early stage project, not an incorporated company. There is no company number to quote, no VAT identification and no registered office, because none exists yet.',
          'We say that plainly rather than filling those fields with something plausible. A policy that implies a legal entity where there is none misleads exactly the person it is supposed to protect.',
          'For any question about this policy or about your data, write to livdarlive@gmail.com. That address is read by the people who run the project.',
          'When Livdar is incorporated, this section will name the company, its registration and its registered office, and it will be updated before anything is sold on the site.',
        ],
      },
      what: {
        heading: 'What we collect',
        body: [
          'A cookie named livdar_consent, which stores only your choice about statistics and marketing cookies. It contains no identifier, it is written only after you answer the banner, and it lasts 180 days. This one is necessary for the site to respect your choice, so it does not itself require consent.',
          'Measurement data through Google Analytics 4, and only if you allow statistics cookies. This includes pages viewed, approximate location derived from your IP address, device and browser type, the language of the page and the actions you take on it such as searching for a destination or opening a plan panel.',
          'Server logs kept by our hosting provider for security and availability, which include IP addresses for a short period.',
          'That is the complete list today. We do not have accounts, we do not have a newsletter, we do not run advertising pixels and we do not sell or share data with data brokers.',
        ],
      },
      analytics: {
        heading: 'Analytics and Consent Mode',
        body: [
          'Analytics runs through Google Tag Manager, container GTM-WKGXHXWC, which loads Google Analytics 4 property G-DY02HH34DT. The Google account behind both belongs to Livdar and is not shared with any other project.',
          'Google Consent Mode v2 is implemented. Before you answer the banner, analytics storage, advertising storage, advertising user data and advertising personalisation are all set to denied, and those defaults are written into the page before the tag manager container is allowed to load. Nothing measurement related runs ahead of your choice.',
          'If you accept statistics cookies, analytics storage is granted and Google Analytics sets its own cookies to recognise a returning session. If you reject, it stays denied and no analytics cookies are set.',
          'Microsoft Clarity is prepared in the codebase but inactive. It loads only if a project id is configured, and when it is activated it will be subject to the same consent gate. This policy will be updated on the day that happens.',
          'The legal basis for analytics is your consent, which you can withdraw at any time by clearing the livdar_consent cookie in your browser and answering the banner again.',
        ],
      },
      waitlist: {
        heading: 'Notify me and waitlist',
        body: [
          'The interface offers to tell you when plans for a destination become available. While no supplier is connected, this is an intent signal only: the click is recorded as an anonymous analytics event, subject to your consent, and no contact details are collected or stored anywhere.',
          'If and when we start collecting an email address for this purpose, it will be on the basis of your explicit consent, it will be used only to send you that one notification, and this section will say so before the form appears.',
        ],
      },
      future: {
        heading: 'What will change when we start selling',
        body: [
          'When an eSIM supplier is connected, we will need to pass the information required to provision a profile to that supplier, acting as processor or as a separate controller depending on the contract. The supplier will be named here before any order is possible.',
          'When payments are enabled, a payment provider will process the transaction. Livdar will not store full card numbers at any point. The provider will be named here before checkout opens.',
          'Neither of those things is possible on this site today. The checkout is disabled in code and the build fails if anyone attempts to enable it while no supplier is connected.',
        ],
      },
      sharing: {
        heading: 'Who else sees the data',
        body: [
          'Google, as the provider of Analytics and Tag Manager, and only for the data described above and only with your consent.',
          'Our hosting provider, which serves the pages and keeps short lived server logs.',
          'Nobody else. There are no advertising networks, no affiliate trackers and no third party chat or heatmap tools active on this site.',
          'Google may process data outside the European Economic Area. Those transfers rely on the European Commission adequacy decision for the United States and on standard contractual clauses where it does not apply.',
        ],
      },
      retention: {
        heading: 'How long we keep things',
        body: [
          'The consent cookie: 180 days, or until you delete it.',
          'Analytics data in Google Analytics: 14 months from collection, after which it is deleted automatically by the retention setting on the property.',
          'Server logs: a short period set by the hosting provider, typically measured in days rather than months.',
        ],
      },
      rights: {
        heading: 'Your rights',
        body: [
          'Under the General Data Protection Regulation you have the right to access your data, to have it corrected, to have it erased, to restrict or object to its processing, and to receive it in a portable format. Where processing rests on consent, you may withdraw that consent at any time without affecting what was lawful before.',
          'Because this site has no accounts, we usually cannot identify you from the data we hold, which is by design rather than an excuse. If you exercise a right, we may ask for information that lets us locate the relevant records, and if we genuinely cannot identify you we will say so rather than guess.',
          'Write to livdarlive@gmail.com. If you are not satisfied with our answer, the General Data Protection Regulation lets you lodge a complaint with the data protection authority of the country where you live, where you work, or where you believe the problem occurred.',
        ],
      },
      changes: {
        heading: 'Changes to this policy',
        body: [
          'This policy will change when the site changes, specifically when a supplier is connected, when payments open and if Clarity is activated. Each of those is a real change in what happens to your data and each will be reflected here before it goes live rather than after.',
        ],
      },
    },
    faq: [
      {
        q: 'Do you collect anything before I answer the cookie banner?',
        a: 'No analytics. Consent Mode defaults are set to denied before the tag manager is allowed to load. Your hosting server log records the request itself, as any web server does.',
      },
      {
        q: 'Can I use the site if I reject everything?',
        a: 'Yes, completely. Rejecting only stops measurement. Every page, the destination search and the language switcher work identically.',
      },
      {
        q: 'How do I withdraw consent later?',
        a: 'Delete the livdar_consent cookie in your browser settings. The banner will ask again on your next visit.',
      },
      {
        q: 'Do you sell my data?',
        a: 'No. There are no advertising networks, no data brokers and no affiliate trackers on this site.',
      },
    ],
  },

  cookies: {
    angle: 'Two sources of cookies, and one of them is optional',
    h1: 'Cookie policy',
    title: 'Cookie policy | Livdar',
    metaDescription:
      'Every cookie this site can set, what it does and how long it lasts. One is necessary, the rest only exist if you allow statistics.',
    sectionOrder: ['intro', 'necessary', 'statistics', 'marketing', 'control', 'faq'],
    intro: [
      'This page lists the cookies this site can actually set. It is short, because the site does very little: there are no accounts, no advertising and no embedded third party widgets.',
      'Cookies are grouped the same way the banner groups them, so what you choose there maps one to one onto what is described here.',
    ],
    sections: {
      necessary: {
        heading: 'Necessary',
        body: [
          'livdar_consent. Stores your answer to the banner, so the site can respect it and stop asking. It holds two true or false values, one for statistics and one for marketing, plus a version number and a timestamp. It contains no identifier and nothing that describes you. It lasts 180 days and is set by Livdar itself, not by a third party.',
          'This is the only cookie set before you make a choice, and it is set because you made one. Necessary cookies do not require consent under the ePrivacy rules, since without this one the banner would reappear on every page.',
        ],
      },
      statistics: {
        heading: 'Statistics, only if you allow them',
        body: [
          'Google Analytics 4, loaded through Google Tag Manager, sets cookies in the _ga family. They distinguish one visit from another and one returning browser from a new one, so we can tell how many people read a page rather than how many times it was loaded.',
          'These are set only after you accept statistics. If you reject, Consent Mode keeps analytics storage denied and the cookies are not written.',
          'Microsoft Clarity would fall into this group as well. It is prepared in the code but not active, so it currently sets nothing.',
        ],
      },
      marketing: {
        heading: 'Marketing',
        body: [
          'None today. The banner offers the choice because the consent framework and the tag manager container are already built for it, and because turning advertising on later without asking would be the wrong way round.',
          'While this section says none, accepting marketing has no practical effect beyond recording your preference. If that changes, this page changes with it.',
        ],
      },
      control: {
        heading: 'How to control them',
        body: [
          'Use the banner. Accept all, Reject, or Preferences if you want to choose statistics and marketing separately.',
          'To change your mind later, delete the livdar_consent cookie in your browser settings and reload the site. The banner will ask again.',
          'Every major browser also lets you block or delete cookies wholesale under its privacy settings. The site works with all of them blocked, it simply asks you about the banner on each visit.',
        ],
      },
    },
    faq: [
      {
        q: 'How many cookies does Livdar set by itself?',
        a: 'One, livdar_consent, and only after you answer the banner.',
      },
      {
        q: 'What happens if I click Reject?',
        a: 'No analytics cookies are written and Consent Mode stays denied. Only the consent cookie itself is stored, so the banner knows not to ask again.',
      },
      {
        q: 'Are there advertising cookies?',
        a: 'None at present. The marketing category exists because the framework supports it, not because anything currently uses it.',
      },
      {
        q: 'Do you use cookies for the shopping basket?',
        a: 'There is no basket yet. When checkout is built, this page will list whatever it needs before it goes live.',
      },
    ],
  },
};
