// Compatibility page, English market.
//
// The English reader is the most likely to already own an eSIM capable phone
// and the least likely to know it, because the feature arrived quietly. This
// page is written as a check you can run in ten seconds, not as a device list
// that goes stale the week after it is published.

export const compatibility = {
  angle: 'A check on your own phone beats any compatibility list',
  h1: 'Does your phone support eSIM',
  title: 'eSIM compatibility: check your own phone in ten seconds',
  metaDescription:
    'Model lists go stale and regional variants differ. Here is how to read the answer off your own handset, and the carrier lock nobody warns you about.',
  sectionOrder: ['intro', 'check', 'lock', 'families', 'dualsim', 'before', 'faq'],
  intro: [
    'Every compatibility list on the internet is slightly wrong, including the ones published by people selling eSIMs. Phones ship in regional variants, some markets get a physical SIM only version of the same model, and manufacturers change what they support between production runs.',
    'Your handset already knows the answer. It takes about ten seconds to ask it, and the result is correct for your exact device rather than for the model name on the box.',
  ],
  sections: {
    check: {
      heading: 'The ten second check',
      body: [
        'On an iPhone, open Settings, then General, then About, and scroll to the bottom. If you see Available SIM, Digital SIM or an EID number, your phone supports eSIM. No EID means no eSIM, whatever any list says about your model.',
        'On Android, open Settings, then Network and internet, then SIMs. Look for an option to add an eSIM, download a SIM or add a carrier. If the option is there, the hardware is there. Some manufacturers word it differently, so an option to add a second line usually means the same thing.',
        'If you want a second opinion, dial the code that displays your EID on most Android devices. An EID is the serial number of the embedded SIM chip. A phone without the chip has nothing to display.',
      ],
    },
    lock: {
      heading: 'The catch nobody mentions',
      body: [
        'A phone bought on contract from a network can be carrier locked even when the eSIM hardware is present and working. A locked handset accepts profiles from its own operator and rejects everything else, including a profile you have already paid for.',
        'This is the single most common reason a perfectly valid eSIM refuses to install, and it is a miserable thing to discover at an airport. Your operator can tell you your lock status in a minute, and most are obliged to unlock a device once the contract terms are met.',
        'Phones bought outright, from a manufacturer directly or second hand from a private seller, are usually unlocked. Usually is not always, so check rather than assume.',
      ],
    },
    families: {
      heading: 'Device families, as a rough guide',
      body: [
        'Apple has supported eSIM since the iPhone XS and XR generation, and models sold in the United States from the iPhone 14 onward have no physical SIM tray at all. Cellular iPads and the Apple Watch with mobile data support it too.',
        'Google Pixel has supported it since the Pixel 3, with some early carrier specific exceptions. Samsung has supported it on the Galaxy S20 series and later flagship lines, and on the Fold and Flip ranges, though a number of regional variants shipped without it.',
        'Beyond those three, support is genuinely patchy and depends on the specific model and the market it was sold in. That is exactly why the check above beats a list.',
      ],
    },
    dualsim: {
      heading: 'What dual SIM actually changes',
      body: [
        'An eSIM does not replace your normal line unless you want it to. Your usual number stays active on the physical SIM and keeps receiving calls and text messages, including the verification codes your bank sends. The travel profile carries the data.',
        'The setting that matters is which line is used for mobile data. Set it to the travel profile and leave your home line on for calls and messages only, with data roaming switched off for it. That combination is what stops an unexpected bill.',
        'It is also worth knowing that you keep two numbers but only one of them is visible to the person you are calling. Outgoing calls use whichever line you set as default, and that is a separate setting from the data one.',
      ],
    },
    before: {
      heading: 'Three things to do before you fly',
      body: [
        'Run the ten second check and confirm the EID exists. Confirm with your operator that the handset is not locked. Install the travel profile while you are still on a connection you trust.',
        'Installing at home rather than on arrival matters more than people expect. The installation itself needs internet, and the moment you need the profile most is the moment you have none.',
      ],
    },
  },
  faq: [
    {
      q: 'How do I know for certain that my phone supports eSIM?',
      a: 'Look for an EID number in your settings. On iPhone it is under General and then About. On Android it is usually under Network and internet and then SIMs. If there is an EID, the hardware is there.',
    },
    {
      q: 'My phone supports eSIM but the profile will not install. Why?',
      a: 'Carrier lock is the most likely reason, followed by installing while offline. A locked handset rejects any profile that is not from its own operator.',
    },
    {
      q: 'Will I lose my normal phone number?',
      a: 'No. The travel profile sits alongside your usual SIM. Your number stays active for calls and messages while the eSIM carries the data.',
    },
    {
      q: 'Can I install the eSIM after I land?',
      a: 'Technically yes, but installation needs an internet connection, so you would need airport wifi. Installing before you leave is the only version of this that always works.',
    },
    {
      q: 'Does an eSIM work on a smartwatch or tablet?',
      a: 'On cellular models, yes. A wifi only tablet has no modem and no EID, so there is nothing for a profile to install onto.',
    },
  ],
};
