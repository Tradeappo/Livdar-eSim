// English market: mixed origins, mostly long haul travellers who already know
// what an eSIM is and want to know whether this specific destination has a
// catch. The editorial job here is to surface the catch early.

export const destinations = {
  turkey: {
    angle: 'IMEI registration is the thing nobody warns you about',
    h1: 'eSIM for Turkey',
    title: 'eSIM for Turkey: data that works without the IMEI trap',
    metaDescription: 'A travel eSIM for Turkey roams on the local networks, so your phone never gets registered against a Turkish line and never gets blocked at day 120.',
    sectionOrder: ['intro', 'why', 'coverage', 'setup', 'limits', 'alternatives', 'faq'],
    intro: [
      'Turkey is the one destination where buying a local SIM card can cost you your phone. Turkish regulation ties a foreign handset to the passport of the person who registers it, and an unregistered phone stops working on Turkish networks after roughly four months. Every traveller who has been caught by it found out the hard way.',
      'A travel eSIM sidesteps the whole mechanism. You are a roaming visitor on a Turkish network, not a Turkish subscriber, so nothing is registered against your handset and nothing expires.',
    ],
    sections: {
      why: {
        heading: 'Why not just buy a SIM at Istanbul airport',
        body: [
          'You can, and the shop will sell you one in five minutes. What the shop will not always explain is the IMEI rule. Register your phone and it is tied to your passport for two years. Do not register it and the line keeps working for a while, then stops.',
          'For a two week holiday the block will probably not reach you. For anyone who visits Turkey more than once a year, or who is staying for a season, it will.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'Three networks carry the country: Turkcell, Vodafone Turkiye and Turk Telekom. Coverage along the Aegean and Mediterranean coasts, in Istanbul, Ankara, Izmir and Antalya is dense and fast.',
          'Cappadocia, the eastern provinces and the mountain roads are a different picture. Signal follows the main roads and the towns. If your itinerary includes balloon fields at dawn or long drives through Anatolia, download your maps before you leave the hotel.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Install the profile at home, on wifi, and leave it switched off. Turn it on when the wheels touch down. Installing an eSIM needs a working internet connection, and the moment you need one most is the moment you do not have one.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'It gives you data. It does not give you a Turkish phone number, so it cannot receive the SMS code that a Turkish bank, a local delivery app or a government service wants to send you. If you need a +90 number that can receive messages, a data eSIM is the wrong product and you should say so out loud before you buy.',
        ],
      },
      alternatives: {
        heading: 'eSIM, roaming or a local SIM',
        body: [
          'Turkey is outside the European Union, so an EU phone plan does not carry its home allowance across the border. Roaming charges in Turkey are among the ones travellers complain about most.',
          'A local SIM is cheapest per gigabyte and worst for your handset. Roaming is easiest and most expensive. A travel eSIM sits in between, and for a normal holiday it is the one that costs you the least attention.',
        ],
      },
    },
    faq: [
      { q: 'Will my phone be blocked in Turkey if I use an eSIM?', a: 'No. The IMEI registration rule applies to handsets used with a Turkish subscriber line. A travel eSIM connects as a visiting roamer, which is the same status your normal phone has when it roams.' },
      { q: 'Can I keep my normal number while using it?', a: 'Yes, if your phone supports dual SIM. Keep your home line active for calls and texts, switch mobile data to the eSIM, and turn data roaming off on the home line so it cannot quietly bill you.' },
      { q: 'Does it work in Cappadocia?', a: 'In the towns and along the main roads, yes. Out on the valley floors and the dirt tracks, expect gaps. That is the network, not the eSIM.' },
    ],
  },

  japan: {
    angle: 'Japan is easy technically and awkward administratively',
    h1: 'eSIM for Japan',
    title: 'eSIM for Japan: fast data, no paperwork, no local number',
    metaDescription: 'Japan has excellent mobile coverage and almost no way for a visitor to get a local line. A travel eSIM is the one that skips the paperwork.',
    sectionOrder: ['intro', 'coverage', 'why', 'setup', 'alternatives', 'limits', 'faq'],
    intro: [
      'Japan is the easiest country in the world to be online in and one of the hardest for a visitor to get a phone line in. Local contracts want a residence card and a Japanese bank account. Tourist SIM cards exist, but they are data only, sold at airport counters, and priced for people with no other option.',
      'A travel eSIM removes the counter. You land, you turn it on, and you are on one of the best mobile networks in the world.',
    ],
    sections: {
      why: {
        heading: 'Why connectivity matters more in Japan than most places',
        body: [
          'Because almost everything you will do runs through your phone. Train transfers in Tokyo are genuinely difficult without a routing app. Restaurant reservations, ticket machines with English toggles, translation for a menu that has none, the last train home: all of it is data.',
          'Free wifi exists and is better than it used to be, but it is patchy on the move and useless underground, which is where you spend a lot of your day.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'NTT Docomo, KDDI au, SoftBank and Rakuten Mobile carry the country. The first three cover it comprehensively, including the Shinkansen corridors and most of the subway network. Rakuten is newer and thinner outside the cities.',
          'Which of those a given plan roams on is the single most useful question to ask about a Japan eSIM, and it is a per plan fact, not a per country one.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Before you fly. Narita and Haneda both have free wifi, but arrivals, immigration and the luggage hall are not where you want to be troubleshooting a QR code. Install on wifi at home, activate on landing.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'No Japanese number. That matters more here than in most countries, because some restaurant booking platforms, some ticketing sites and most delivery services will not complete a booking without a domestic number to text.',
          'If your trip depends on booking a specific restaurant that only takes phone reservations, plan for that separately.',
        ],
      },
      alternatives: {
        heading: 'eSIM, pocket wifi or an airport SIM',
        body: [
          'Pocket wifi is the traditional Japanese answer and it still makes sense for a group, because one device covers everyone. It is another thing to charge, another thing to carry, and another thing to return before your flight.',
          'Airport SIM counters work and cost more. Roaming from home is simplest and, from most countries, the most expensive option of the three.',
        ],
      },
    },
    faq: [
      { q: 'Is free wifi enough in Japan?', a: 'For a coffee shop afternoon, yes. For navigating the Tokyo subway with a connecting Shinkansen, no. The gaps are exactly where you need it.' },
      { q: 'Which network will I be on?', a: 'It depends on the plan, not the country. Ask before you buy, because the difference between a Docomo backed plan and a Rakuten backed one is real once you leave the cities.' },
      { q: 'Can I tether my laptop?', a: 'Only if the plan allows hotspot. Some travel plans block it. If you are working from Japan, check that line specifically.' },
    ],
  },

  'united-states': {
    angle: 'The USA question is always which carrier, never whether there is coverage',
    h1: 'eSIM for the United States',
    title: 'eSIM for the USA: the carrier matters more than the gigabytes',
    metaDescription: 'AT&T, T-Mobile and Verizon cover the United States very differently once you leave the interstates. Which one a US eSIM roams on is the question worth asking.',
    sectionOrder: ['intro', 'coverage', 'why', 'setup', 'limits', 'alternatives', 'faq'],
    intro: [
      'The United States is not one mobile market, it is three networks with genuinely different maps. A plan that is flawless in Manhattan can be useless in a national park four hours away, and the reason is almost never the plan size.',
      'So the useful question about a United States eSIM is not how many gigabytes you get. It is which carrier you land on.',
    ],
    sections: {
      coverage: {
        heading: 'The three networks, honestly',
        body: [
          'Verizon and AT&T have the widest rural footprint. T-Mobile has the strongest mid band 5G in cities and has closed much of the rural gap, but not all of it.',
          'If your trip is New York, Chicago, Los Angeles and Las Vegas, any of them works. If it is Utah, Montana, the Dakotas or the long empty stretches of Route 66, the difference is the difference between having a map and not having one.',
        ],
      },
      why: {
        heading: 'Why not use your home plan',
        body: [
          'Some home plans include the United States. Many include it at a daily fee that quietly exceeds the cost of the whole trip, and a few include it with a speed cap that makes video calls unusable.',
          'Check the daily rate before you assume roaming is the easy answer. The maths on a two week trip is usually not close.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'At home, before departure, on wifi. Most United States airports have free wifi that needs an email address and a captive portal, which is one more thing between you and a working phone after a long flight.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'It will not give you a United States number, and in the United States that has a specific consequence: a lot of everyday services want to text you. Rideshare apps, delivery, restaurant waitlists, event tickets and hotel check in all lean on SMS to a domestic number.',
          'Most of them will accept your home number. Some will not. It is worth knowing which before you are standing outside a restaurant.',
        ],
      },
      alternatives: {
        heading: 'eSIM, roaming or a prepaid US SIM',
        body: [
          'A prepaid United States SIM from a carrier store gives you a real number and generous data, and costs you an hour of your first day plus a store visit. For a month or more it is the better deal.',
          'For a week or two, a travel eSIM you activate on the runway is worth more than the price difference.',
        ],
      },
    },
    faq: [
      { q: 'Will an eSIM work in national parks?', a: 'Sometimes, at the visitor centre and the main road, rarely on the trails. No carrier covers the backcountry properly. Download offline maps.' },
      { q: 'Can I use it for Uber and Lyft?', a: 'The apps work on data. The driver calling you may not reach you if you are not carrying a usable number, so keep your home line reachable.' },
      { q: 'Does 5G matter here?', a: 'For speed in cities, yes. For whether you have signal at all in rural areas, no. Coverage is the older bands, and that is a carrier question.' },
    ],
  },

  'united-arab-emirates': {
    angle: 'VoIP restrictions are the real story and most pages hide them',
    h1: 'eSIM for the UAE',
    title: 'eSIM for Dubai and the UAE: read the calling rules first',
    metaDescription: 'Data in the UAE is fast and easy. Calling over WhatsApp or FaceTime is restricted. Know which applies to your plan before you rely on it.',
    sectionOrder: ['intro', 'limits', 'coverage', 'setup', 'why', 'alternatives', 'faq'],
    intro: [
      'Getting online in the United Arab Emirates is easy. Dubai and Abu Dhabi have some of the fastest mobile networks anywhere, and the airports, malls and hotels are saturated with wifi.',
      'The thing worth knowing before you travel is not about speed. It is about what you are allowed to do with the connection.',
    ],
    sections: {
      limits: {
        heading: 'Voice and video calling over the internet',
        body: [
          'The UAE restricts voice and video calling over apps like WhatsApp, FaceTime and Messenger on local networks. Messaging generally works. Calling frequently does not.',
          'Whether a particular travel eSIM is affected depends on how that plan routes its traffic, and it can change. Treat any page that promises you unrestricted WhatsApp calling in the UAE with suspicion, including ours: we will tell you what a plan does when we can verify it, and say we do not know when we cannot.',
          'If a working voice call home is essential, plan for a normal phone call rather than an app call.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'Two operators run the country, Etisalat by e& and du. Both cover the cities, the highways between them, the airports and the main desert routes comprehensively.',
          'Indoor coverage in the big malls and the metro is engineered rather than incidental, and it shows.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Before you fly. Dubai International has good free wifi, but it also has one of the longest walks from gate to immigration in the world, and being connected for that walk is genuinely useful.',
        ],
      },
      why: {
        heading: 'Why not roam',
        body: [
          'The UAE sits outside every regional roaming arrangement that European travellers benefit from. Daily roaming passes to the Gulf are consistently among the most expensive on any operator price list.',
        ],
      },
      alternatives: {
        heading: 'eSIM, a tourist SIM or hotel wifi',
        body: [
          'Both UAE operators sell visitor SIM packages, sometimes bundled free with certain airline tickets, and they come with a local number. If you are here for business and need to be called back, that is worth the counter queue.',
          'For a holiday where the phone is for maps, photos and messages, a travel eSIM does the job with no queue and no passport scan.',
        ],
      },
    },
    faq: [
      { q: 'Can I use WhatsApp in Dubai?', a: 'Text messages, photos and voice notes generally work. Voice and video calls are restricted on local networks. Do not plan around them working.' },
      { q: 'Is a VPN a solution?', a: 'VPN use in the UAE is legally sensitive and we are not going to advise you to route around a national regulation. Plan for the rules as they are.' },
      { q: 'Is hotel wifi enough?', a: 'In the hotel, yes. In a taxi, at the Marina, out in the desert, no.' },
    ],
  },

  thailand: {
    angle: 'Thailand is the destination where the local SIM genuinely competes',
    h1: 'eSIM for Thailand',
    title: 'eSIM for Thailand: the one place a local SIM is genuinely competitive',
    metaDescription: 'Thai tourist SIM cards are cheap, generous and sold everywhere. Here is when a travel eSIM is still the better call, and when it is not.',
    sectionOrder: ['intro', 'alternatives', 'coverage', 'setup', 'limits', 'why', 'faq'],
    intro: [
      'Most travel eSIM pages will tell you that a local SIM is a hassle. In Thailand that is not quite true. AIS and TrueMove sell tourist packages at Suvarnabhumi and Don Mueang that are cheap, come with a Thai number and include more data than most people use in a month.',
      'So the honest version of this page starts with the case against us.',
    ],
    sections: {
      alternatives: {
        heading: 'When a Thai SIM beats a travel eSIM',
        body: [
          'If you are staying more than about two weeks, if you want a Thai number for Grab, food delivery and hotel bookings, or if you are travelling on a tight budget, buy the local SIM. It is the better product for that trip.',
          'A travel eSIM wins when you are landing late, moving on to another country within days, hopping between Thailand, Vietnam and Cambodia on one plan, or simply not willing to spend the first half hour of a holiday at a counter with your passport out.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'AIS and TrueMove H cover the country well, including the islands that matter: Phuket, Samui, Phi Phi, Krabi. NT is thinner.',
          'On the smaller islands and the boat crossings between them, signal drops. That is geography.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Install on wifi before you leave. Bangkok arrivals at eleven at night with a taxi queue in front of you is not the moment to discover your QR code expired.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'No Thai number. In Thailand that is a sharper limitation than usual, because Grab, LINE and most delivery apps are built around a local number, and LINE is how a lot of the country communicates.',
        ],
      },
      why: {
        heading: 'Roaming from home',
        body: [
          'Thailand is outside every inclusive roaming zone that European or North American travellers carry with them. Operator day passes to Southeast Asia are expensive relative to what the same money buys locally.',
        ],
      },
    },
    faq: [
      { q: 'Should I just buy a SIM at the airport?', a: 'If you are in Thailand for two weeks or more and want a Thai number, yes. We would rather tell you that than sell you the wrong product.' },
      { q: 'Does it work on the islands?', a: 'On Phuket, Samui and Krabi, yes. On the small islands and the ferries, expect gaps.' },
      { q: 'Can one plan cover Thailand, Vietnam and Cambodia?', a: 'A regional Southeast Asia plan can. That is the case where an eSIM clearly beats buying three local SIMs.' },
    ],
  },

  'united-kingdom': {
    angle: 'Post Brexit roaming is the reason this page exists',
    h1: 'eSIM for the United Kingdom',
    title: 'eSIM for the UK: what changed for European travellers',
    metaDescription: 'EU phone plans no longer carry a guaranteed home allowance into the United Kingdom. Several operators reintroduced charges. Here is what that means in practice.',
    sectionOrder: ['intro', 'limits', 'why', 'coverage', 'setup', 'alternatives', 'faq'],
    intro: [
      'For years, travelling from the European Union to the United Kingdom meant your phone simply worked and nothing changed on your bill. That guarantee ended when the United Kingdom left the single market.',
      'Some operators kept the United Kingdom in their inclusive zone voluntarily. Several did not, and a few reintroduced daily charges after saying they would not. Whether you pay depends entirely on which operator you are with, and the only reliable way to know is to check your own tariff before you fly.',
    ],
    sections: {
      why: {
        heading: 'Check your own plan first',
        body: [
          'This is genuinely the first step, and it costs nothing. If your operator still includes the United Kingdom, you do not need us for a weekend in London.',
          'If it charges a daily fee, do the arithmetic across the length of your trip. A four day city break at a daily roaming rate is usually more than a travel data plan for the same period.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'EE, Vodafone UK, O2 and Three UK carry the country. Cities, motorways and the main rail lines are well covered. EE historically has the widest rural footprint.',
          'Rural Wales, the Scottish Highlands and stretches of the West Country still have real dead zones. The train from London to Edinburgh will drop you several times regardless of network.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Before you travel. Heathrow, Gatwick and Manchester all have free wifi, but the Eurostar arrival at St Pancras and the drive off a ferry do not.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'No British number. If you need a +44 number that can receive verification codes, for a bank, a letting agent or an employer, a travel data eSIM is not that product and no amount of data will make it one.',
        ],
      },
      alternatives: {
        heading: 'eSIM, roaming or a UK pay as you go SIM',
        body: [
          'A British pay as you go SIM is cheap, easy to buy in any supermarket, and gives you a real number. For anyone visiting regularly or staying for weeks, it is the sensible answer.',
          'For a short trip where you already have a phone that works, an eSIM is the one you can set up from your sofa.',
        ],
      },
    },
    faq: [
      { q: 'Does my EU plan still work in the UK?', a: 'It depends on your operator. Some kept the United Kingdom inclusive, others reintroduced a daily charge. Check your own tariff, it takes two minutes.' },
      { q: 'Is coverage on the train any good?', a: 'Patchy on every network. The London to Edinburgh line in particular drops repeatedly. Download what you need before you board.' },
      { q: 'Can I get a UK number with this?', a: 'Not with a travel data eSIM. That needs a British SIM or a British line.' },
    ],
  },

  switzerland: {
    angle: 'Switzerland is the most expensive roaming mistake in Europe',
    h1: 'eSIM for Switzerland',
    title: 'eSIM for Switzerland: the country EU roaming forgets',
    metaDescription: 'Switzerland is not in the European Union or the EEA roaming zone. Phones cross the border and start charging. A travel eSIM is the cheapest fix.',
    sectionOrder: ['intro', 'coverage', 'limits', 'why', 'setup', 'alternatives', 'faq'],
    intro: [
      'Switzerland is surrounded by the European Union and is not part of its roaming rules. That single fact produces more surprise phone bills than any other destination on this continent, because nothing about crossing the border feels like leaving.',
      'You drive from Germany into Basel, or take the train from Milan to Zurich, and your phone changes networks without asking you anything.',
    ],
    sections: {
      why: {
        heading: 'The border problem is worse than it sounds',
        body: [
          'Swiss networks reach across the border. Sitting in Konstanz on the German side, or in an Italian valley near the frontier, your phone can latch onto a Swiss cell without you moving at all.',
          'If your plan charges for Switzerland, that is a roaming charge you incurred without leaving your own country. Turning data roaming off on your home line and putting data on a travel eSIM removes the whole failure mode.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'Swisscom, Sunrise and Salt cover the country to a standard that is genuinely unusual, including most of the alpine valleys, the mountain railways and the road tunnels.',
          'Swisscom has the deepest coverage in the mountains. If your trip is hiking rather than cities, that difference is worth asking about.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'Before you cross the border, which for Switzerland means before you get on the train or into the car, not after you arrive. This is the destination where arriving already connected matters most.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'No Swiss number. Swiss regulation requires identity verification for a local subscriber line, which is why a visitor cannot simply buy one online and have it posted abroad.',
        ],
      },
      alternatives: {
        heading: 'eSIM, roaming or a Swiss SIM',
        body: [
          'A Swiss prepaid SIM requires identity verification in person or a Swiss delivery address, so for most visitors it is not a practical option before arrival.',
          'Roaming is the expensive default. A travel eSIM is the one that requires no paperwork and no border decision.',
        ],
      },
    },
    faq: [
      { q: 'Is Switzerland in EU roaming?', a: 'No. It is not in the European Union and not in the EEA roaming arrangement. Your home allowance does not follow you there.' },
      { q: 'Why did I get charged without entering Switzerland?', a: 'Swiss cells reach across the border. Phones near the frontier latch onto them. Turning off data roaming on your home line prevents it.' },
      { q: 'Will it work on the mountain railways?', a: 'Mostly yes, Swiss coverage in the alps is unusually good, though tunnels and some high valleys still drop.' },
    ],
  },

  bali: {
    angle: 'Bali is an arrival friction story, not a coverage story',
    h1: 'eSIM for Bali',
    title: 'eSIM for Bali: skip the arrivals hall SIM counter',
    metaDescription: 'Indonesian SIM cards need passport registration and the Denpasar arrivals counters know it. A travel eSIM gets you online before you reach the taxi queue.',
    sectionOrder: ['intro', 'alternatives', 'why', 'coverage', 'setup', 'limits', 'faq'],
    intro: [
      'Bali has good mobile coverage and a genuinely annoying arrival. Indonesian prepaid SIM cards must be registered against a passport, the counters at Denpasar know you have no alternative, and the queue lands exactly between immigration and the taxi rank.',
      'None of that is a coverage problem. It is a friction problem, and that is the specific thing a travel eSIM solves here.',
    ],
    sections: {
      why: {
        heading: 'What the registration rule actually means',
        body: [
          'Indonesia requires prepaid numbers to be registered to an identity document. For a visitor that means handing your passport across a counter and waiting while it is entered.',
          'It is not dangerous and it is not slow in the abstract. It is slow at eleven at night with a full flight ahead of you.',
        ],
      },
      coverage: {
        heading: 'Coverage you should actually expect',
        body: [
          'Telkomsel has the strongest footprint across the island, including the north and the east where the others thin out. Indosat and XL are solid in the south, where most visitors actually stay.',
          'Canggu, Seminyak, Ubud and Uluwatu are well covered. Sidemen, the Munduk area and the road up to Kintamani are not consistently so.',
        ],
      },
      setup: {
        heading: 'When to install it',
        body: [
          'On wifi before you fly. Denpasar wifi works, but the point of this product is to not need it.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not do',
        body: [
          'No Indonesian number, which matters for Gojek and Grab. Both are how Bali moves, and both prefer a local number for driver contact. Most visitors work around it, some find it genuinely awkward.',
        ],
      },
      alternatives: {
        heading: 'eSIM, a local SIM or villa wifi',
        body: [
          'A Telkomsel tourist package is cheap and generous, and if you are in Bali for a month while working, it is probably the right answer.',
          'Villa and cafe wifi in the south is good enough that a lot of people get by on it plus a small data plan.',
        ],
      },
    },
    faq: [
      { q: 'Do I need to register an eSIM with my passport?', a: 'No. The registration requirement applies to Indonesian prepaid subscriber lines. A travel eSIM connects as a roaming visitor.' },
      { q: 'Will it work in Ubud and the north?', a: 'Ubud yes. The north and the mountain roads are thinner on every network, Telkomsel least so.' },
      { q: 'Is it enough for working remotely?', a: 'For calls and email yes, if the plan allows hotspot. For heavy uploads, the cafe and coworking wifi in Canggu is faster.' },
    ],
  },
};
