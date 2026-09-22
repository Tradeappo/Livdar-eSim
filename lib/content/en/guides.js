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

  'what-is-data-roaming': {
    cluster: 'roaming',
    h1: 'What is data roaming?',
    title: 'What is data roaming, and should it be on or off?',
    metaDescription: 'Data roaming lets your phone use mobile data on a foreign network. When to turn it on or off, where the setting is on iPhone and Android, and why a travel eSIM needs it on.',
    sectionOrder: ['answer', 'bill', 'onoff', 'where', 'travelesim', 'eu'],
    intro: [
      'Data roaming is your phone using mobile data on a network that is not your own operator’s, almost always because you are abroad. Your operator has agreements with foreign networks, the foreign network carries your traffic, and your operator bills you for it according to your plan.',
      'The setting called Data Roaming on your phone decides whether a line is allowed to do that at all. Turned off, the phone still connects abroad for calls and texts, but it will not use mobile data on that line.',
    ],
    sections: {
      answer: {
        heading: 'The short answer',
        body: [
          'Data roaming on means mobile data works abroad on that line, at whatever price your plan sets for the country you are in. Off means no mobile data on that line outside your home network. Wifi keeps working either way.',
        ],
      },
      bill: {
        heading: 'What it costs depends on the country, not on the setting',
        body: [
          'Inside the European Union and the wider EEA roaming area, EU plans carry their home allowance, under fair use rules. UK operators each set their own terms for Europe. US carriers typically include some countries such as Canada and Mexico on certain plans and sell daily passes for others.',
          'Outside those arrangements, roaming data is billed per day or per megabyte, and that is where the expensive surprises come from. Your operator’s price list for international use, not the headline of your plan, is the document that tells you.',
        ],
      },
      onoff: {
        heading: 'On or off: a rule that works',
        body: [
          'If your plan includes the country you are in, leave it on. If it does not and you have not bought a pass, turn it off on your home line before you land. That one setting prevents most roaming bills.',
        ],
      },
      where: {
        heading: 'Where the setting is',
        body: [
          'On an iPhone: Settings, Mobile Data (Cellular in the US), then the line you want, then Data Roaming. With two lines, each has its own switch.',
          'On Android the path differs by manufacturer. It is usually under Settings, Network and internet or Connections, SIMs or Mobile networks, then Roaming.',
        ],
      },
      travelesim: {
        heading: 'Why a travel eSIM needs roaming switched on',
        body: [
          'A travel eSIM is itself a roaming line: it is issued by one operator and connects to local networks abroad as a visitor. For it to carry data, Data Roaming must be on for the eSIM line. Keep it off on your home line at the same time, and your phone uses the eSIM for data and your home number only for calls and texts.',
        ],
      },
      eu: {
        heading: 'Common traps',
        body: [
          'Borders are the usual one. Near Switzerland, on the Spanish coast opposite Morocco and on Corfu opposite Albania, phones can connect to a network across the border and roam there without leaving the EU. Ferries and cruise ships are the other: at sea, some ships run their own maritime network, billed at satellite rates.',
        ],
      },
    },
    faq: [
      { q: 'Does data roaming cost money if I only use wifi?', a: 'No. Wifi does not use your mobile plan. Charges only come from mobile data, calls and texts on a foreign network.' },
      { q: 'Should I turn off data roaming on my home line when I use a travel eSIM?', a: 'Yes. Leave the home line on for calls and texts if you want, with data roaming off, and set the eSIM as the line for mobile data with its roaming switched on.' },
      { q: 'Will I receive texts with data roaming off?', a: 'Yes. Data roaming only controls mobile data. Calls and texts still reach you when the line is on, and incoming calls can be charged outside your home area.' },
    ],
  },

  'pocket-wifi-vs-esim': {
    cluster: 'pocket_wifi',
    h1: 'Pocket wifi or eSIM for travel',
    title: 'Pocket wifi or eSIM: which one fits your trip',
    metaDescription: 'A pocket wifi router shares one connection with a group; an eSIM puts data straight into your phone. How each works, where each wins, and what to check before renting one.',
    sectionOrder: ['how', 'group', 'solo', 'logistics', 'phones', 'decide'],
    intro: [
      'A pocket wifi, also sold as a portable or travel wifi hotspot, is a small battery powered router with its own SIM inside. You carry it, switch it on and connect your phones and laptops to it over wifi. An eSIM does the same job inside the phone itself, for that one phone.',
      'Neither is better in general. They solve different problems, and the difference usually comes down to how many people and devices share the trip.',
    ],
    sections: {
      how: {
        heading: 'How each one connects you',
        body: [
          'The pocket wifi connects to a local mobile network and broadcasts a wifi network for your devices. Everything goes through that one box, so everyone connected shares its speed and its data allowance.',
          'An eSIM connects your phone directly to a local network, the same way a physical SIM does. There is nothing to carry, charge or return, and it only covers the phone it is installed on, unless you share it through the phone’s own hotspot.',
        ],
      },
      group: {
        heading: 'Where a pocket wifi wins',
        body: [
          'Families and groups travelling together, with several phones and a tablet or two, can run everything through one device. Older phones that do not support eSIM connect to it like any wifi network. Laptops get a stable connection without draining a phone battery on hotspot.',
        ],
      },
      solo: {
        heading: 'Where an eSIM wins',
        body: [
          'Travelling alone or splitting up during the day, an eSIM wins easily: one less device to keep charged, and your data does not stop when the person carrying the router walks into a different museum. There is also nothing to collect at the airport or post back at the end.',
        ],
      },
      logistics: {
        heading: 'What to check before renting a device',
        body: [
          'Where you collect it and how you return it, especially if your flight leaves early. The deposit or liability if it is lost or damaged. Whether the data is really unlimited or slowed after a daily threshold. Battery life compared with the length of your days out, and whether a power bank is included.',
        ],
      },
      phones: {
        heading: 'Check your phone first',
        body: [
          'An eSIM needs a phone that supports eSIM and is not locked to your home operator. Most recent iPhones and many Android flagships do; some budget models and phones bought in certain countries do not. Our compatibility page lists how to check.',
        ],
      },
      decide: {
        heading: 'A simple way to decide',
        body: [
          'One or two people, recent phones: eSIM. A group with mixed devices, or a laptop that needs to be online all day: pocket wifi, or an eSIM on one phone with its hotspot switched on if the plan allows tethering.',
        ],
      },
    },
    faq: [
      { q: 'Can I share an eSIM connection like a pocket wifi?', a: 'Yes, through your phone’s personal hotspot, if the travel plan allows tethering. Check before you buy, because some plans block it.' },
      { q: 'Is a pocket wifi faster than an eSIM?', a: 'Not by itself. Both use the same local networks. A router shared by several people divides its speed between them.' },
      { q: 'Do I need a pocket wifi in Japan?', a: 'It is a popular choice for groups there. For one person with an eSIM compatible phone, an eSIM does the same job without the device.' },
    ],
  },

  'international-sim-card': {
    cluster: 'travel_sim',
    h1: 'International SIM card or travel eSIM',
    title: 'International SIM card or travel eSIM: what the difference is',
    metaDescription: 'An international SIM card is a physical SIM that works in many countries, sometimes with a number. A travel eSIM is data only and installs in minutes. Which one you need.',
    sectionOrder: ['what', 'number', 'shipping', 'coverage', 'whichone'],
    intro: [
      'International SIM card, travel SIM and global SIM are names for the same idea: one SIM card, from one provider, that works in many countries by roaming on local networks. Most are physical cards posted to you before the trip. Some come with a phone number for calls and texts, some are data only.',
      'A travel eSIM follows the same roaming model without the plastic. You buy it, scan a code, and it is installed. Most travel eSIMs are data only.',
    ],
    sections: {
      what: {
        heading: 'What they have in common',
        body: [
          'Both roam. Neither is a local SIM from the country you are visiting, so neither needs local registration at a counter, and both work across several countries on one plan. Both connect to the same local networks, so coverage and speed come from those networks, not from the card.',
        ],
      },
      number: {
        heading: 'The real difference: a phone number',
        body: [
          'Some international SIM cards include a number, often from the provider’s home country, that can make and receive calls and texts abroad. That is useful if you need to be reachable on a number other than your home one, for example on a long trip with a home number you want to keep for banking codes only.',
          'Most travel eSIMs do not include a number. Calls happen over messaging apps on data, and your home number stays in the phone as a second line.',
        ],
      },
      shipping: {
        heading: 'Timing and delivery',
        body: [
          'A physical international SIM has to reach you before you leave, which takes days and depends on the post. A travel eSIM can be bought the evening before, or at the airport, and installed on wifi.',
        ],
      },
      coverage: {
        heading: 'Coverage lists matter more than the name',
        body: [
          'Global does not mean every country. Each plan has a list of countries and the networks it uses in each. Check your destinations on that list, whichever format you choose.',
        ],
      },
      whichone: {
        heading: 'Which one to choose',
        body: [
          'If your phone supports eSIM and you need data, a travel eSIM is simpler. If you need a separate number that can receive calls and texts abroad, or your phone does not support eSIM, an international SIM card that includes a number is the better fit.',
        ],
      },
    },
    faq: [
      { q: 'Is an international SIM card the same as a local SIM?', a: 'No. A local SIM is issued in the country you visit and often needs registration there. An international SIM roams on local networks from abroad.' },
      { q: 'Can a travel eSIM receive SMS codes?', a: 'Most are data only and cannot. Keep your home line active in the phone to receive codes sent to your own number.' },
      { q: 'Does my phone need to be unlocked?', a: 'Yes, for both. A phone locked to your home operator will not accept another provider’s SIM or eSIM.' },
    ],
  },
};
