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

  morocco: {
    angle: 'The expensive mistake in Morocco often happens in Spain, before you cross',
    h1: 'eSIM for Morocco',
    title: 'eSIM for Morocco: medinas, the Atlas and the Strait of Gibraltar',
    metaDescription: 'Morocco sits outside every European roaming deal, and phones on the Spanish side of the Strait can latch onto Moroccan networks. What a travel eSIM changes.',
    sectionOrder: ['intro', 'strait', 'medina', 'coverage', 'local', 'limits', 'faq'],
    intro: [
      'Morocco is close enough to Europe that many travellers forget it is a long haul destination as far as their phone plan is concerned. It is not part of the EU roaming area, and most UK and US plans put it in a premium zone or charge a daily fee for it.',
      'The part people do not expect is where the bill starts. On the southern coast of Spain, around Tarifa and Algeciras, phones regularly pick up Moroccan cell towers across the Strait. You can be standing on a Spanish beach and roaming in Morocco.',
    ],
    sections: {
      strait: {
        heading: 'The Strait of Gibraltar problem',
        body: [
          'If your trip combines Andalusia and a ferry to Tangier, set your home line to manual network selection while you are on the Spanish coast, or switch data roaming off on it. A travel eSIM for Morocco does not fix what your home SIM does in Spain, so the two settings work together.',
          'Once you are in Morocco, turn the eSIM on for data and leave the home line for calls and texts only.',
        ],
      },
      medina: {
        heading: 'Why data matters more inside the medina',
        body: [
          'The old cities of Marrakech and Fes are the reason most people want mobile data in Morocco. The alleys are narrow, unnamed on most maps and designed to disorient. GPS drifts between high walls, and a live map with your position is worth more than any offline screenshot.',
          'Riads are the other half of the story. Thick walls and courtyard layouts make hotel wifi weak in the rooms, even when it works well on the roof terrace.',
        ],
      },
      coverage: {
        heading: 'Where coverage holds and where it does not',
        body: [
          'Three networks run the country: Maroc Telecom, Orange Maroc and Inwi. Casablanca, Rabat, Marrakech, Fes, Tangier and Agadir are well covered, and so are the main roads between them.',
          'The High Atlas passes, the gorges and the Sahara camps around Merzouga and Zagora are where it thins out. Desert camps sometimes have a signal on a nearby dune and nothing in the tent. Download maps before the drive south.',
        ],
      },
      local: {
        heading: 'Buying a local SIM instead',
        body: [
          'Airport booths in Marrakech and Casablanca sell local SIM cards and top ups, and you will need your passport. For a stay of several weeks it is often the cheapest data per gigabyte. For a short trip, the queue on arrival and the passport step are what an eSIM saves you.',
        ],
      },
      limits: {
        heading: 'What a data eSIM will not give you',
        body: [
          'A Moroccan +212 number. Riads, drivers and guides often coordinate by WhatsApp, which works over any data connection, but if a local service needs to send you an SMS code, you need a Moroccan SIM with a number.',
        ],
      },
    },
    faq: [
      { q: 'Does EU roaming cover Morocco?', a: 'No. Morocco is outside the EU and the European Economic Area, so EU plans charge their international rate there unless a specific add on includes it.' },
      { q: 'Why was I charged Moroccan roaming in Spain?', a: 'Moroccan towers can reach parts of the Spanish coast near the Strait. If your phone picks one, your home operator bills you for Morocco. Choose a Spanish network manually on that stretch of coast.' },
      { q: 'Will I have signal at a desert camp near Merzouga?', a: 'Sometimes near the edge of the dunes, rarely inside the camp. Treat the desert night as offline and plan around it.' },
    ],
  },

  egypt: {
    angle: 'Egypt is well connected in the cities and on the Red Sea, and dark on the river and in the desert',
    h1: 'eSIM for Egypt',
    title: 'eSIM for Egypt: Cairo, the Nile and the Red Sea without roaming bills',
    metaDescription: 'Egypt is a premium roaming zone on most plans. Coverage is strong in Cairo and the Red Sea resorts and patchy on Nile cruises and desert trips. Plan data around that.',
    sectionOrder: ['intro', 'itinerary', 'nile', 'coverage', 'local', 'limits', 'faq'],
    intro: [
      'Egypt trips tend to follow the same shape: a few days in Cairo and Giza, a flight or train to Luxor or Aswan, perhaps a Nile cruise, and a week on the Red Sea at Hurghada or Sharm el-Sheikh. Each part of that trip has a different connectivity story.',
      'Roaming on a UK, US or EU plan is billed at an international rate in Egypt. A data eSIM gives you the same local networks without the per day or per megabyte charge.',
    ],
    sections: {
      itinerary: {
        heading: 'Cairo and Giza first',
        body: [
          'Cairo is where you will lean on data the most. Ride hailing apps are the easiest way around the city, translation helps at every ticket window, and the traffic makes a live map useful even in a taxi. Coverage across Cairo and Giza is dense on every network.',
        ],
      },
      nile: {
        heading: 'On a Nile cruise',
        body: [
          'Between Luxor and Aswan the boats pass long stretches of farmland and desert where signal comes and goes. Cruise ship wifi is usually slow and shared by everyone on board in the evening.',
          'Expect connectivity at the docks in Luxor, Edfu, Kom Ombo and Aswan, and expect gaps in between. Upload your photos at the moorings, not mid river.',
        ],
      },
      coverage: {
        heading: 'Networks and the Red Sea',
        body: [
          'Vodafone Egypt, Orange Egypt, Etisalat Misr and WE share the market. Hurghada, El Gouna, Marsa Alam and Sharm el-Sheikh are well covered on land. On dive boats and snorkelling trips offshore, signal fades with distance from the coast.',
          'Desert excursions to the White Desert, Siwa or the monasteries of Sinai are mostly offline once you leave the road. Share your itinerary before you go.',
        ],
      },
      local: {
        heading: 'Local SIM or eSIM',
        body: [
          'Local SIM cards are sold at Cairo airport and in the resort towns and they are good value per gigabyte. You will need your passport and some patience at the counter. For a stay under two weeks, skipping that step is the main argument for an eSIM.',
        ],
      },
      limits: {
        heading: 'What a data eSIM leaves out',
        body: [
          'An Egyptian +20 number. You will not be able to receive local SMS codes, and some hotels and drivers prefer to call a local number. WhatsApp calls and messages work over the eSIM like anywhere else.',
        ],
      },
    },
    faq: [
      { q: 'Is hotel wifi in Hurghada enough?', a: 'For messages in the evening, often yes. For maps, ride hailing and excursions, no. Resort wifi rarely reaches the beach or the boat.' },
      { q: 'Will I have data on a Nile cruise?', a: 'At the moorings and near the towns, yes. On the long stretches between them, expect it to drop out. That applies to every network, not only to an eSIM.' },
      { q: 'Can I use Uber or Careem in Cairo with a data eSIM?', a: 'Yes. Ride hailing apps need data and a working app account, not a local phone number, although drivers may try to call you. Keep your home line on for calls.' },
    ],
  },

  albania: {
    angle: 'Albania is outside EU roaming, and its signal reaches further into Greece than people expect',
    h1: 'eSIM for Albania',
    title: 'eSIM for Albania: the Riviera, the Alps and the Corfu surprise',
    metaDescription: 'Albania is not in the EU roaming area. Its networks also reach across to Corfu, where European phones can end up roaming in Albania. How a travel eSIM helps.',
    sectionOrder: ['intro', 'corfu', 'riviera', 'alps', 'balkans', 'limits', 'faq'],
    intro: [
      'Albania has grown quickly as a summer destination, and it is one of the few places on the continent where an EU phone plan does not carry its home allowance. It is not an EU member, and roam like at home stops at the border.',
      'For UK and US travellers the picture is the same as anywhere outside their home zone: check the daily rate, then decide.',
    ],
    sections: {
      corfu: {
        heading: 'The Corfu surprise',
        body: [
          'The north east coast of Corfu faces Albania across a narrow channel. Phones on that side of the island regularly connect to Albanian networks, so a traveller in Greece gets billed for roaming in Albania. The ferry from Corfu to Saranda makes it even more likely.',
          'If you are on Corfu, pick a Greek network manually or switch data roaming off on your home line. If you are crossing to Saranda, that is the moment to switch the Albanian eSIM on.',
        ],
      },
      riviera: {
        heading: 'Along the Riviera',
        body: [
          'Saranda, Ksamil, Himara and Dhermi are covered by both national networks, Vodafone Albania and One Albania. The coastal road between Vlora and Himara climbs over the Llogara Pass, where signal drops briefly before returning on the other side.',
          'Beach bars have wifi, but the reason to carry data here is navigation on narrow coastal roads and finding the small beaches reached by dirt tracks.',
        ],
      },
      alps: {
        heading: 'Theth, Valbona and the Albanian Alps',
        body: [
          'The hike between Valbona and Theth is one of the best known walks in the Balkans, and much of it is offline. Guesthouses in both villages usually have wifi, the trail usually does not. Download the route and tell your host when you set off.',
        ],
      },
      balkans: {
        heading: 'One country or a Balkan road trip',
        body: [
          'Many travellers combine Albania with Montenegro, Kosovo or North Macedonia. None of them is in the EU roaming area. If your route crosses several of these borders, a Balkans regional plan is simpler than buying one plan per country.',
        ],
      },
      limits: {
        heading: 'What you do not get',
        body: [
          'An Albanian +355 number. If a guesthouse or a car rental company wants to text you a local code, you need a local SIM with a number.',
        ],
      },
    },
    faq: [
      { q: 'Does EU roaming work in Albania?', a: 'No. Albania is not an EU member and is not covered by roam like at home. Some operators include it in paid add ons, so check your plan.' },
      { q: 'Why did my phone roam in Albania while I was in Corfu?', a: 'Albanian cells can reach the north east coast of Corfu. Select a Greek network manually on that part of the island.' },
      { q: 'Is there signal on the Valbona to Theth hike?', a: 'Only in patches. Treat the trail as offline and download the route beforehand.' },
    ],
  },

  canada: {
    angle: 'Canada is a coverage story more than a price story, and the answer depends on where your phone plan comes from',
    h1: 'eSIM for Canada',
    title: 'eSIM for Canada: cities, national parks and the long gaps between them',
    metaDescription: 'Canadian coverage is excellent in the cities and absent across huge stretches of road and park. What a travel eSIM for Canada covers, and when a US plan already does.',
    sectionOrder: ['intro', 'wholives', 'emptyroads', 'parks', 'carriers', 'limits', 'faq'],
    intro: [
      'Canada is the second largest country in the world and most of it has no mobile signal at all. Networks follow the population, which sits in a band along the US border. Vancouver, Toronto, Montreal and Calgary are as well covered as any city in Europe. The Trans-Canada Highway between them is not.',
      'For European and British travellers, Canada sits outside every home roaming allowance and is usually billed in a long haul zone. That is the part a travel eSIM fixes. It does not add towers where there are none.',
    ],
    sections: {
      wholives: {
        heading: 'Where you are travelling from changes the answer',
        body: [
          'Many US phone plans already include Canada, sometimes with a data cap or reduced speed after a threshold. If you are coming from the United States, check your plan before buying anything.',
          'UK, EU and Australian plans generally do not include Canada. Daily roaming passes add up quickly over a two or three week road trip, which is the typical Canadian itinerary.',
        ],
      },
      emptyroads: {
        heading: 'The long drives',
        body: [
          'Between towns in the Prairies, along the north shore of Lake Superior and on the Icefields Parkway between Lake Louise and Jasper, expect long sections with no signal on any network. Download offline maps for the whole route and tell someone when you expect to arrive.',
        ],
      },
      parks: {
        heading: 'National parks',
        body: [
          'Banff town has good coverage. Much of the backcountry does not. The same applies to Jasper, Yoho and the parks of Atlantic Canada. Park visitor centres and many lodges have wifi, which is where most visitors check the weather and trail conditions.',
        ],
      },
      carriers: {
        heading: 'The networks',
        body: [
          'Rogers, Bell and Telus run the three national networks. Freedom Mobile and Videotron are strong in some provinces. A travel eSIM connects to one or more of the national networks, and which one matters most in rural areas, so check it before you buy if you are driving far from the cities.',
        ],
      },
      limits: {
        heading: 'No Canadian number',
        body: [
          'A data eSIM does not give you a Canadian +1 number. Canada and the United States share the +1 prefix, but a US number is not a Canadian one either. For calls to hotels and car rental desks, messaging apps over data are the usual workaround.',
        ],
      },
    },
    faq: [
      { q: 'Does my US phone plan work in Canada?', a: 'Many US plans include Canada, often with limits on high speed data. Check your plan details before you travel.' },
      { q: 'Will I have signal on the Icefields Parkway?', a: 'Only in short stretches near Lake Louise, Saskatchewan Crossing and Jasper. Plan the drive as offline.' },
      { q: 'Is a travel eSIM worth it for a week in Toronto?', a: 'If your home plan does not include Canada, usually yes. City coverage is excellent and data is what you will use most.' },
    ],
  },

  vietnam: {
    angle: 'In Vietnam the local SIM is cheap and good, so the eSIM case is about the first hours and multi country trips',
    h1: 'eSIM for Vietnam',
    title: 'eSIM for Vietnam: Grab, the Ha Giang loop and a border crossing or two',
    metaDescription: 'Vietnamese networks are fast and local SIMs are cheap. A travel eSIM earns its place on arrival, on multi country routes and when you would rather skip the passport queue.',
    sectionOrder: ['intro', 'honest', 'grab', 'north', 'crossborder', 'limits', 'faq'],
    intro: [
      'Vietnam has fast 4G in every city and along most of the coast, with 5G rolling out in Hanoi and Ho Chi Minh City. Viettel, Vinaphone and MobiFone all sell tourist SIM cards at the airport, and they are inexpensive.',
      'So the honest version of this page starts with a question: how long are you staying, and is Vietnam the only country on the trip?',
    ],
    sections: {
      honest: {
        heading: 'When the local SIM is the better deal',
        body: [
          'For a month or more in Vietnam alone, a local SIM bought with your passport usually costs less per gigabyte than any travel eSIM. That is worth saying plainly.',
          'A travel eSIM makes more sense for a short trip, when you want to be online the moment you land, or when Vietnam is one stop in a longer Southeast Asia route.',
        ],
      },
      grab: {
        heading: 'Why data matters from the first minute',
        body: [
          'Grab is how most visitors get from Tan Son Nhat or Noi Bai airport into town, and how they pay for rides and food afterwards. The app needs mobile data. Being online before you reach the taxi rank saves you a negotiation at the curb.',
        ],
      },
      north: {
        heading: 'Ha Giang, Sapa and Ha Long Bay',
        body: [
          'The Ha Giang loop and the roads around Sapa are covered along the main routes, with gaps in the high passes and valleys. Viettel generally reaches furthest in the mountains.',
          'On overnight cruises in Ha Long Bay and Lan Ha Bay, signal comes and goes between the karst islands. Boat wifi exists but is shared by everyone on board.',
        ],
      },
      crossborder: {
        heading: 'Vietnam, Cambodia and Laos on one plan',
        body: [
          'Many travellers cross into Cambodia or Laos by bus. A regional Southeast Asia plan keeps you on one eSIM across those borders, instead of buying a new SIM at each crossing.',
        ],
      },
      limits: {
        heading: 'What you do not get',
        body: [
          'A Vietnamese +84 number. Grab works without one, but some local services and delivery apps expect a local number for SMS codes. If you need that, buy a local SIM with your passport.',
        ],
      },
    },
    faq: [
      { q: 'Can I use Grab in Vietnam with a travel eSIM?', a: 'Yes. Grab needs a data connection and an account; a local number is not required for rides.' },
      { q: 'Does it work on the Ha Giang loop?', a: 'On most of the main road, yes, with gaps on the high passes. Download the route before you set off.' },
      { q: 'Should I buy a SIM at the airport instead?', a: 'For a long stay in Vietnam only, often yes. For a short trip or several countries, an eSIM saves time.' },
    ],
  },

  mexico: {
    angle: 'Mexico now links local phone lines to an ID, which makes a foreign data eSIM the simpler route for short stays',
    h1: 'eSIM for Mexico',
    title: 'eSIM for Mexico: data without the new line registration',
    metaDescription: 'Since 2026 Mexican phone lines must be registered to their user, foreigners with a passport. A travel eSIM roams on Mexican networks instead. Coverage, Cancun to Oaxaca.',
    sectionOrder: ['intro', 'registration', 'fromus', 'coverage', 'cenotes', 'limits', 'faq'],
    intro: [
      'Mexico changed the rules for local phone lines in 2026. Every new Mexican mobile line has to be linked to its user at activation, and foreigners register with a passport. Lines that are not registered are cut to emergency calls only.',
      'For a visitor on a holiday that is one more counter and one more document. A travel eSIM connects to Mexican networks as a roaming visitor instead of opening a Mexican line.',
    ],
    sections: {
      registration: {
        heading: 'What the registration rule means for you',
        body: [
          'If you buy a Telcel or AT&T Mexico SIM, expect the shop to register it to your passport. That is legal and routine, it just takes time.',
          'Foreign roaming lines were left out of the first phase of the rule, and the regulator has said it will decide how to treat them later. Check again before a long stay, because this may change.',
        ],
      },
      fromus: {
        heading: 'Coming from the United States',
        body: [
          'Many US plans include Mexico, often with a cap on high speed data. If yours does, you may not need anything else. From the UK, the EU or Canada, Mexico is usually an expensive roaming zone.',
        ],
      },
      coverage: {
        heading: 'Coverage',
        body: [
          'Telcel has the widest network, followed by AT&T Mexico; Movistar Mexico runs largely on the AT&T network. Mexico City, Guadalajara, Cancun, Playa del Carmen and Tulum are well covered.',
          'In the Sierra Madre, on mountain roads in Oaxaca and Chiapas and on parts of the Baja peninsula, coverage thins out between towns.',
        ],
      },
      cenotes: {
        heading: 'Cenotes, ruins and the Yucatan',
        body: [
          'Around Tulum, Valladolid and the cenote routes, signal holds in the towns and weakens at the more remote cenotes and archaeological sites. Download maps and tickets before you drive out.',
        ],
      },
      limits: {
        heading: 'No Mexican number',
        body: [
          'A data eSIM gives you internet, not a +52 number. WhatsApp, which most Mexican businesses use, works over data.',
        ],
      },
    },
    faq: [
      { q: 'Do I have to register a travel eSIM in Mexico?', a: 'The 2026 rule applies to Mexican lines. Foreign roaming lines were not included in the first phase; the regulator plans to define their treatment later.' },
      { q: 'Does my US plan already cover Mexico?', a: 'Many do, sometimes with speed limits after a data threshold. Check your plan before you buy.' },
      { q: 'Is there signal at the cenotes?', a: 'Near the towns, usually. At remote cenotes and ruins, often not.' },
    ],
  },

  india: {
    angle: 'An Indian SIM needs paperwork and a wait; the eSIM case is getting online before that is done',
    h1: 'eSIM for India',
    title: 'eSIM for India: skip the SIM paperwork on arrival',
    metaDescription: 'A local SIM in India needs your passport, visa, a photo and a local address, and can take up to a day to activate. A travel eSIM works as soon as you land.',
    sectionOrder: ['intro', 'kyc', 'arrival', 'networks', 'hills', 'limits', 'faq'],
    intro: [
      'India has some of the cheapest mobile data in the world, on Jio, Airtel and Vi. The catch for visitors is buying it. Every SIM goes through identity checks, and for foreigners that means a passport and visa copy, a photograph and a local address, sometimes a local reference.',
      'Activation can take anything from a couple of hours to a day. A travel eSIM is not cheaper per gigabyte. It is faster, and on a first day in Delhi or Mumbai that tends to matter more.',
    ],
    sections: {
      kyc: {
        heading: 'What buying a local SIM involves',
        body: [
          'Expect to show your passport and visa, hand over a photo, and give the address of your hotel. Some shops ask for a local contact who can confirm your details. Official stores of the operators handle this routinely; small kiosks are sometimes less willing.',
          'For a stay of several weeks, going through that once is worth it for the price. For a one week trip, many travellers prefer not to spend half a day on it.',
        ],
      },
      arrival: {
        heading: 'The first day',
        body: [
          'Ride hailing apps, maps and messages with your hotel all need data from the moment you leave the airport. With an eSIM installed before departure, you are online at the gate.',
        ],
      },
      networks: {
        heading: 'Networks',
        body: [
          'Jio and Airtel have the widest 4G and 5G coverage; Vi and the state owned BSNL are present too. The big cities, the Golden Triangle of Delhi, Agra and Jaipur, Goa and Kerala are well covered.',
        ],
      },
      hills: {
        heading: 'Himalayas and remote areas',
        body: [
          'In Ladakh, Spiti and parts of Himachal Pradesh, Sikkim and the North East, coverage is patchy and some areas have special rules for mobile connections. Check the situation for your route before you go and do not rely on any single network there.',
        ],
      },
      limits: {
        heading: 'Where an Indian number still helps',
        body: [
          'Some Indian payment apps and train booking services send one time codes to Indian numbers. A data eSIM cannot receive those. If your trip depends on them, a local SIM is still the better tool.',
        ],
      },
    },
    faq: [
      { q: 'What do I need to buy a SIM in India as a tourist?', a: 'Usually your passport, visa, a photo and a local address. Some shops ask for a local reference. Activation can take up to a day.' },
      { q: 'Will a travel eSIM work in Ladakh?', a: 'Coverage there is limited on every network and rules differ from the rest of India. Check your route in advance and plan for offline periods.' },
      { q: 'Can I pay with UPI using a travel eSIM?', a: 'Standard UPI needs an Indian bank account linked to an Indian number, which a data eSIM does not provide. Prepaid UPI wallets for foreign visitors exist; check their conditions separately.' },
    ],
  },

  indonesia: {
    angle: 'Indonesia beyond Bali: many islands, one network that reaches furthest, and a 90 day rule for local SIMs',
    h1: 'eSIM for Indonesia',
    title: 'eSIM for Indonesia: Java, Lombok, Komodo and the islands in between',
    metaDescription: 'Outside Bali, Indonesian coverage varies island by island. Local SIMs tie your phone to an IMEI rule after 90 days. What a travel eSIM covers from Jakarta to Labuan Bajo.',
    sectionOrder: ['intro', 'islands', 'imei', 'javatrip', 'boats', 'limits', 'faq'],
    intro: [
      'Indonesia is more than 17,000 islands, and most visitors see only a few of them. Jakarta, Yogyakarta and the volcanoes of Java, Lombok and the Gili islands, Labuan Bajo for Komodo, sometimes Sulawesi or Raja Ampat. Coverage is good in the cities and very uneven between islands.',
      'If your trip is only Bali, our Bali page is the more useful one. This page is about the rest of the country.',
    ],
    sections: {
      islands: {
        heading: 'Which network reaches furthest',
        body: [
          'Telkomsel has the widest footprint across the outer islands. Indosat Ooredoo Hutchison and XL, now part of XLSmart, are strong on Java and in the larger cities. On a trip that goes beyond Java and Bali, the network behind your plan matters more than the gigabytes.',
        ],
      },
      imei: {
        heading: 'The 90 day IMEI rule',
        body: [
          'Indonesia registers the IMEI of foreign phones used with Indonesian SIM cards. Visitors can use a local SIM for up to 90 days without registering; after that, an unregistered phone is blocked on local networks, and expensive phones can attract import duty when registered.',
          'A travel eSIM roams as a foreign line, so the local IMEI registration does not apply to it. For most holidays the 90 day window is long enough either way.',
        ],
      },
      javatrip: {
        heading: 'Java overland',
        body: [
          'The route from Jakarta or Yogyakarta to Borobudur, Prambanan and Mount Bromo is covered along the roads. The Bromo viewpoints and the Ijen crater before dawn have weaker signal. Download maps and tickets in the hotel.',
        ],
      },
      boats: {
        heading: 'Komodo, Gili and the boat days',
        body: [
          'Labuan Bajo has good coverage. Out on the Komodo boat trips and between the Gili islands and Lombok, expect signal near the islands and little in between. Liveaboard boats rarely have usable wifi.',
        ],
      },
      limits: {
        heading: 'No Indonesian number',
        body: [
          'A data eSIM does not give you a +62 number. Gojek and Grab work over data, but some local services want a local number for SMS codes.',
        ],
      },
    },
    faq: [
      { q: 'Do I need to register my phone IMEI for a travel eSIM?', a: 'No. IMEI registration applies to phones used with Indonesian SIM cards beyond 90 days. A travel eSIM roams as a foreign line.' },
      { q: 'Will I have signal on a Komodo boat trip?', a: 'Near the islands and Labuan Bajo, often. In open water between them, rarely.' },
      { q: 'Is one plan enough for Java, Bali and Lombok?', a: 'Yes, an Indonesia plan covers the whole country. Coverage quality depends on the island, not on the plan.' },
    ],
  },
};
