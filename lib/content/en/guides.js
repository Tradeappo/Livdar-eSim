export const guides = {
  'how-esim-works': {
    cluster: 'setup',
    h1: 'How an eSIM actually works',
    title: 'How an eSIM works: the part the manuals skip',
    metaDescription: 'An eSIM is a SIM card written into your phone instead of pushed into it. What that changes, what it does not change, and the one thing that catches people out.',
    intro: [
      'A SIM card is a small secure chip that proves to a mobile network that you are allowed on it. An eSIM is the same thing without the plastic: the phone has the chip already, and a network profile is written onto it.',
      'Everything else about being on a mobile network is unchanged. Same radios, same towers, same speeds. What changes is how the profile gets onto the phone, and that is where the practical differences live.',
    ],
    sections: {
      difference: {
        heading: 'What actually changes',
        body: [
          'You can install a profile from anywhere with an internet connection, which means you can be on a foreign network before you leave your own country.',
          'You can hold several profiles at once and switch between them, which is why dual SIM on an eSIM phone is more useful than dual SIM ever was with two trays.',
          'You cannot move the profile to another phone by popping it out. That is the trade.',
        ],
      },
      install: {
        heading: 'The one thing that catches people out',
        body: [
          'Installing an eSIM needs internet. Activating it does not.',
          'That sounds obvious until you are standing in an arrivals hall with no data trying to scan a QR code that is in an email you cannot open. Install at home on wifi, leave the line switched off, and turn it on when you land.',
        ],
      },
      profiles: {
        heading: 'Profiles, lines and what your phone calls them',
        body: [
          'Different phones use different words for the same thing. Apple calls them plans and labels them, Android usually calls them SIMs. The concept is identical: a stored profile that you can turn on or off and assign roles to.',
          'The roles that matter are which line makes calls, which line sends messages and which line carries mobile data. On a trip you usually want calls on your home number and data on the travel profile.',
        ],
      },
    },
    faq: [
      { q: 'Can I delete an eSIM and reinstall it later?', a: 'Usually not. Most travel profiles can be installed once. Deleting one normally means buying another. Switch it off instead of deleting it.' },
      { q: 'Does an eSIM drain the battery faster?', a: 'Having two lines active does, slightly, because the phone maintains two registrations. Turning off the line you are not using solves it.' },
      { q: 'Can I use it in a tablet or a watch?', a: 'If the device has an eSIM and the plan allows it. Many travel plans are written for phones only.' },
    ],
  },

  'install-esim': {
    cluster: 'setup',
    h1: 'Installing and activating an eSIM',
    title: 'Install an eSIM before you fly: the order that works',
    metaDescription: 'Install on wifi at home, keep the line off, switch it on when you land. Here is the full sequence including the settings people forget.',
    intro: [
      'The order matters more than the steps. Almost every eSIM problem a traveller has is the same problem: they tried to install it at the moment they needed it, which is the moment they had no internet.',
    ],
    sectionOrder: ['before', 'oneshot', 'arrival', 'trouble'],
    sections: {
      before: {
        heading: 'At home, on wifi',
        body: [
          'Install the profile. Give it a label you will recognise later, something like the destination name rather than the default.',
          'Leave the line switched off. An unstarted travel plan usually begins counting its validity from first connection, not from purchase, but that is a per plan rule and worth checking.',
        ],
      },
      oneshot: {
        heading: 'One code, one install',
        body: [
          'A travel profile is almost always single install. The QR code carries one profile, and once that profile has been downloaded onto a phone the code is spent. Scanning it a second time returns an error, not a second copy.',
          'That makes deleting the plan a destructive act rather than a tidying one. It does not go back to the provider and it does not wait for you somewhere. A factory reset removes it the same way, quietly, along with everything else you were resetting. When you have finished with a line, switch it off instead. A line that is off costs nothing and is still there next trip if the plan has validity left.',
          'Installing on the wrong handset burns it just as cleanly. An old phone you were about to sell, or a phone that belongs to someone else while you work out whose plan is whose: wherever the profile lands is where it stays, and it cannot be moved across afterwards. Look at the device in your hand before you scan.',
        ],
      },
      arrival: {
        heading: 'On landing',
        body: [
          'Turn the travel line on. Set mobile data to it. Turn data roaming on for that line, because a travel profile technically roams even though it feels local.',
          'Then turn data roaming off on your home line. This is the step people skip and it is the one that produces the surprise bill.',
        ],
      },
      trouble: {
        heading: 'If it does not connect',
        body: [
          'Give it two or three minutes. Registering on a foreign network is not instant.',
          'Toggle flight mode once. Then check that mobile data is assigned to the right line, which is the single most common mistake.',
          'If there is still nothing, check whether the plan needs an APN entered manually. Most do not. Some do, and the provider will say so.',
        ],
      },
    },
    faq: [
      { q: 'When does my plan start counting?', a: 'Usually at first connection to a network, not at purchase. Check the plan, because a few start at purchase and that changes when you should buy.' },
      { q: 'Can I install it on the plane?', a: 'Only with working inflight wifi. Assume no.' },
      { q: 'What if I delete it by accident?', a: 'Most travel profiles cannot be reinstalled. Treat deletion as final.' },
      { q: 'I scanned the code on the wrong phone. Can I move it?', a: 'Normally no. The profile belongs to that handset now, and removing it from there frees nothing up. Ask the provider before you buy again, because a few will reissue once and it costs you nothing to ask.' },
    ],
  },

  'esim-vs-roaming': {
    cluster: 'comparison',
    h1: 'eSIM or roaming',
    title: 'eSIM or roaming: how to work out which is cheaper for your trip',
    metaDescription: 'Roaming is simpler. A travel eSIM is usually cheaper outside your home zone. The arithmetic that decides it takes about two minutes.',
    intro: [
      'There is no universal answer and anyone who gives you one is selling something. The answer depends on one number you already have: what your own operator charges for the country you are going to.',
    ],
    sections: {
      maths: {
        heading: 'The two minute calculation',
        body: [
          'Find the daily roaming rate or the travel pass price for your destination in your own tariff. Multiply it by the number of days you will be away.',
          'Compare that to a data plan for the same destination and period. If the difference is small, roaming wins on convenience, because it needs no setup at all.',
          'If the difference is large, and outside your home roaming zone it usually is, the eSIM wins.',
        ],
      },
      zones: {
        heading: 'Where roaming is already free',
        body: [
          'Inside the European Union and the wider EEA roaming zone, an EU phone plan carries its home allowance with it under fair use conditions. For those destinations you usually need nothing.',
          'Outside it, the picture changes immediately, and countries that feel close can be the worst offenders. Switzerland, the United Kingdom and Turkey are all a short flight from the EU and all outside it.',
        ],
      },
      fairuse: {
        heading: 'The fair use catch',
        body: [
          'Inclusive roaming is designed for travel, not for living abroad on a foreign plan. Operators may monitor usage patterns over a period of months and can ask for evidence of a link to the home country, apply a surcharge, or limit the service.',
          'Conditions differ between operators, so this is a line to read in your own contract rather than a rule you can generalise.',
        ],
      },
    },
    faq: [
      { q: 'Is roaming always more expensive?', a: 'No. Inside an inclusive zone it is free, and some plans include far more countries than people realise. Check first.' },
      { q: 'Can I use both?', a: 'Yes, and it is often the best setup: home line for calls and messages, travel eSIM for data, data roaming off on the home line.' },
      { q: 'What about incoming calls?', a: 'They arrive on your home number as usual, and in most zones receiving them is included. Check whether your destination is one of them.' },
    ],
  },

  'esim-vs-physical-sim': {
    cluster: 'comparison',
    h1: 'eSIM or a local SIM card',
    title: 'eSIM or local SIM: the honest comparison',
    metaDescription: 'A local SIM is cheaper per gigabyte and gives you a local number. A travel eSIM costs you no time. Which matters more depends on the trip.',
    intro: [
      'These two products solve different problems and the marketing on both sides pretends otherwise.',
      'A local SIM is a subscription in the country you are visiting. A travel eSIM is a roaming arrangement that happens to be convenient. That distinction explains every difference between them.',
    ],
    sectionOrder: ['local', 'travel', 'physical', 'choose'],
    sections: {
      local: {
        heading: 'What a local SIM gives you',
        body: [
          'A local number, which matters more than most travellers expect. Ride hailing, food delivery, restaurant bookings, parcel lockers and bank verification all lean on a domestic number in many countries.',
          'More data for the money, usually much more.',
          'It costs you a counter, a passport, sometimes a registration rule, and the first hour of your trip.',
        ],
      },
      travel: {
        heading: 'What a travel eSIM gives you',
        body: [
          'Being online the moment you land, with no queue and no document.',
          'One plan across several countries, which is the case where it clearly wins: a three country trip on one profile instead of three local SIMs.',
          'No local number, and in some countries a registration rule you avoid entirely by not being a local subscriber.',
        ],
      },
      physical: {
        heading: 'Where the plastic still wins',
        body: [
          'A physical SIM can be taken out. That reads like a detail until your phone dies on day three. With a card you push it into a borrowed handset and carry on. With an eSIM the plan is sealed inside a device that no longer switches on, and a phone taken from your pocket takes the plan with it. This is a genuine weakness of the format and convenience elsewhere does not cancel it.',
          'Hardware decides the rest. Plenty of phones still in daily use have no eSIM at all, and a handset sold on a contract can be locked to the operator that sold it, which blocks a foreign profile even when the chip is in there. Establish which category your phone is in before you buy a plan, not after.',
          'Then there is the number. Travel plans are usually data only, so nothing can text you on one. In several countries the only line that dependably receives a domestic SMS is one bought in person and registered against a passport, and that is handed to you as a card over a counter. Where that matters, plastic is not the worse option. It is the only one.',
        ],
      },
      choose: {
        heading: 'How to choose without overthinking it',
        body: [
          'Staying more than two weeks in one country and want a local number: buy locally.',
          'Moving between countries, arriving late, or short trip: travel eSIM.',
          'Need to receive verification codes on a local number: neither of these is your product. You need a proper local line.',
        ],
      },
    },
    faq: [
      { q: 'Can I have both?', a: 'Yes. Many travellers run the home line for identity, a travel eSIM for the first days, and buy a local SIM if the stay turns long.' },
      { q: 'Do local SIMs always need registration?', a: 'Not always, but in more countries every year. Indonesia, Turkey and much of the Gulf require it.' },
      { q: 'Which is faster?', a: 'Neither, systematically. Speed is the network, and both end up on the same towers.' },
      { q: 'What happens to my plan if the phone is stolen?', a: 'A card goes into the replacement handset and keeps working. A profile does not, so assume it is gone with the phone. Tell the provider, then budget for buying again.' },
    ],
  },

  'airport-connectivity': {
    cluster: 'arrival',
    h1: 'Getting online the moment you land',
    title: 'Airport connectivity: what to do in the first ten minutes',
    metaDescription: 'Airport wifi, SIM counters and eSIM activation compared for the arrival you actually have: tired, in a queue, with a taxi to find.',
    intro: [
      'Arrival is the worst moment to solve a connectivity problem and the most common moment people try. You are tired, the wifi wants an email address, the SIM counter has a queue and the taxi rank is on the other side of it.',
      'Everything below is about removing decisions from that ten minutes.',
    ],
    sectionOrder: ['wifi', 'portal', 'counter', 'esim'],
    sections: {
      wifi: {
        heading: 'Airport wifi, realistically',
        body: [
          'Most large airports have free wifi and most of it works. What varies is the captive portal: some want an email, some a phone number to text a code to, which is circular if you have no data.',
          'It also stops at the terminal door. The taxi, the train into the city and the hotel search all happen outside it.',
        ],
      },
      portal: {
        heading: 'The portal that wants to text you',
        body: [
          'Of the two things a portal can ask for, only one of them can actually stop you. An address is a box to type in. A number has to be one you control, because the airport sends a one time code to it by SMS and the connection opens only when you type that code back. The design assumes you landed holding a line that can receive a text.',
          'The ways round it are all weaker than they sound. Your home number will take the code if that line has registered on a network locally, so leaving the home line switched on, with its data roaming off, is the fix that works most often. It still depends on your operator behaving and on the portal accepting a foreign number at all. Many only accept a domestic one, and at that point there is nothing to do at the terminal. Typing in an invented number sends a stranger your code.',
          'Installing before you fly removes the problem instead of solving it. You never open the portal, never wait on a code, never find out which version this airport runs. The question simply stops applying to you.',
        ],
      },
      counter: {
        heading: 'The SIM counter',
        body: [
          'Reliable, gives you a local number, and priced with full knowledge that you have no alternative at that moment.',
          'In some countries it also involves passport registration, which turns five minutes into twenty when a full flight lands at once.',
        ],
      },
      esim: {
        heading: 'The prepared option',
        body: [
          'Install the profile before you fly, leave it off, switch it on while the plane is still taxiing. By the time you reach immigration you have maps, messages and your booking confirmations.',
          'This only works if you did it in advance. An eSIM you have not installed yet is worth exactly as much as no eSIM at all.',
        ],
      },
    },
    faq: [
      { q: 'Can I activate an eSIM on airport wifi?', a: 'Usually yes, but it is the thing you are trying to avoid needing. Install at home instead.' },
      { q: 'Are airport SIM counters a rip off?', a: 'They are convenience priced rather than dishonest. In Thailand they are genuinely good value. In Japan and the Gulf, less so.' },
      { q: 'What about the plane wifi?', a: 'If it works, you can install there. Do not build a plan around it.' },
      { q: 'The wifi will only send the code by SMS. What now?', a: 'Put in your home number and wait, because that line can receive a text once it registers on a network locally. If the portal refuses anything but a domestic number, nothing at the terminal will help you.' },
    ],
  },
};
