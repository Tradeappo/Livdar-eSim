// Region pages, English market.
//
// Written for the reader who searches in English and is usually crossing more
// than one border on the same trip. That is the whole reason a region page
// exists: a single country page cannot answer "what happens when I move on".
// Nothing here is a translation of another market, and nothing here is the same
// paragraph with the region name swapped.

export const regions = {
  europe: {
    angle: 'The continent where your existing plan might already be enough',
    h1: 'eSIM for Europe',
    title: 'Europe eSIM: when you need one and when you already have data',
    metaDescription:
      'Europe is the one region where you often do not need a travel eSIM at all. How to tell, and what changes the moment you leave the EU.',
    sectionOrder: ['intro', 'eu', 'outside', 'multi', 'choose', 'faq'],
    intro: [
      'Europe is the region where a travel eSIM is least likely to be the right answer, and we would rather say that on the page than sell around it. If you hold an EU or EEA plan, roaming inside the bloc is charged at your home rate by law. Your gigabytes travel with you and your bill does not move.',
      'That rule stops being useful in three situations, and those three situations are what this page is about: you are not on an EU plan, your trip includes a country that is geographically European but not in the roaming zone, or you are travelling long enough that a fair use policy starts to bite.',
    ],
    sections: {
      eu: {
        heading: 'If your plan is European, check before you buy anything',
        body: [
          'Roam like at home covers the twenty seven EU states plus Iceland, Liechtenstein and Norway. A Spanish contract works in Estonia at Spanish prices. A German one works in Portugal at German prices. There is no eSIM on the market that improves on free.',
          'The catch is the fair use policy buried in your contract. Operators are allowed to apply a volume cap on roaming for unlimited domestic plans, and they are allowed to challenge anyone who spends more time abroad than at home over a four month window. If you are moving for a summer rather than a fortnight, read that clause before you rely on it.',
          'British plans are the exception that catches people out most often. After Brexit, EU roaming stopped being a legal right for UK customers, and most large UK operators reinstated daily charges. If your plan is British, treat Europe as a paid destination until you have checked your own tariff.',
        ],
      },
      outside: {
        heading: 'The European countries that are not in the roaming zone',
        body: [
          'Switzerland sits in the middle of the continent and outside the agreement. So do Turkey, Albania, Serbia, Bosnia and Herzegovina, North Macedonia and Montenegro. Your inclusive allowance stops at those borders and the per megabyte rate behind it is the one that produces the stories about four figure phone bills.',
          'This is where a travel eSIM earns its place, and it is why the highest demand we measure on this continent is not for France or Italy but for Switzerland, Turkey and Albania. A rail trip from Munich to Zagreb that dips through Switzerland is not one roaming zone, it is two.',
        ],
      },
      multi: {
        heading: 'When a regional plan beats a country plan',
        body: [
          'A regional plan is worth the premium when you will genuinely use it in three or more countries and you do not want to think about switching. Interrail routes, a work trip with four airports, a driving holiday through the Balkans. One profile, one installation, no decisions at the border.',
          'It is the wrong buy for a single city break. A country plan is cheaper per gigabyte almost every time, and a week in Lisbon does not need the flexibility you are paying for.',
        ],
      },
      choose: {
        heading: 'How to decide in under a minute',
        body: [
          'Start with your own contract. If it is EU or EEA and your trip stays inside the bloc, close this page and enjoy the free roaming. If your plan is British, Swiss, American or anything else, price the trip properly before you fly.',
          'Then look at your route rather than your destination. The question is not which country you are visiting, it is how many roaming zones you will cross. One zone means one country plan. Several means either a regional plan or the discipline to buy as you go.',
        ],
      },
    },
    faq: [
      {
        q: 'Do I need a travel eSIM anywhere in Europe if I have an EU plan?',
        a: 'Not inside the EU, Iceland, Liechtenstein or Norway, where your home allowance applies by law. You do need one for Switzerland, Turkey, Albania, Serbia, Bosnia and Herzegovina, North Macedonia and Montenegro, none of which are covered.',
      },
      {
        q: 'Why is Switzerland so often the reason people buy?',
        a: 'Because it is surrounded by the roaming zone without being in it. Travellers cross into it by train or car without registering that anything has changed, and the tariff behind the border is charged per megabyte.',
      },
      {
        q: 'Has anything changed for UK travellers since Brexit?',
        a: 'Yes. Inclusive EU roaming is no longer a legal entitlement for UK customers and most major operators have brought back daily fees. Check your own tariff rather than assuming the old rules still hold.',
      },
      {
        q: 'Is a Europe wide plan better value than buying per country?',
        a: 'Only above roughly three countries. Below that, a country plan almost always costs less per gigabyte, and the convenience you are paying for has nothing to do.',
      },
    ],
  },

  asia: {
    angle: 'The region where the local alternative is genuinely good',
    h1: 'eSIM for Asia',
    title: 'Asia eSIM: the region where local SIMs are actually competitive',
    metaDescription:
      'Asian prepaid data is among the cheapest anywhere, so a travel eSIM buys convenience rather than savings. When that is worth paying for.',
    sectionOrder: ['intro', 'local', 'esim', 'borders', 'practical', 'faq'],
    intro: [
      'Asia is the region where the honest comparison is hardest for us, because the local option is genuinely excellent. Prepaid data in Indonesia, Vietnam, India and Thailand is among the cheapest anywhere, sold in every convenience store, and it works the moment you put it in.',
      'So the question on this continent is not whether a travel eSIM saves you money. It usually does not. The question is what an hour of your arrival day is worth, and whether you want to hand over your passport at a counter in a language you do not read.',
    ],
    sections: {
      local: {
        heading: 'What you are giving up by not buying locally',
        body: [
          'Price, mostly. A month of generous data in Southeast Asia can cost less than a coffee at the airport you bought it in. You also get a local number, which matters more here than in Europe, because ride hailing apps, food delivery and hotel confirmations frequently send an SMS code to a local line.',
          'What you give up in return is the arrival. Registration rules in most of the region require a passport scan, sometimes a form, occasionally a wait. In Japan and South Korea the tourist prepaid market is thin and skewed towards rental, which is a different transaction again.',
        ],
      },
      esim: {
        heading: 'Where the travel eSIM clearly wins',
        body: [
          'Short trips, business trips and any itinerary where landing with working data is the point. You install before you leave, you land, it connects, you order a car. Nobody photographs your passport.',
          'It also wins wherever the local market is awkward for visitors. Japan is the clearest example: enormous search demand, very dense traveller interest, and a prepaid landscape that assumes you are a resident. The same is true in Taiwan, where the vocabulary travellers use is not even the word eSIM.',
        ],
      },
      borders: {
        heading: 'The multi country problem',
        body: [
          'Asia is where regional plans stop being a luxury. A local SIM is a national product. Cross into the next country and it either stops or starts charging you roaming rates that undo the saving you came for.',
          'A trip that takes in Bangkok, Siem Reap and Ho Chi Minh City is three SIM purchases, three registrations and three numbers, or it is one regional profile. That calculation flips the answer for a lot of people who would otherwise buy locally.',
        ],
      },
      practical: {
        heading: 'Two things worth knowing before you fly',
        body: [
          'Check whether your phone is carrier locked before you leave. A locked handset rejects any profile that is not your own operator, and the place to discover that is at home, not at an airport at midnight.',
          'Also check what the local emergency and banking flows expect. Some services in the region will only send verification codes to a domestic number. A data only eSIM does not give you one, and no travel product does.',
        ],
      },
    },
    faq: [
      {
        q: 'Is a travel eSIM cheaper than a local SIM in Asia?',
        a: 'Almost never. Local prepaid data in most of the region is cheaper than anything sold to travellers. You buy the eSIM for the arrival, not for the price.',
      },
      {
        q: 'Do I get a phone number?',
        a: 'Not with a data only travel plan. If a local number matters to you, for ride hailing or bank verification, buy locally or keep your home line active for SMS.',
      },
      {
        q: 'Which Asian countries are hardest to buy a SIM in as a visitor?',
        a: 'Japan and South Korea, where the prepaid market is oriented towards rental and residency rather than tourist walk ups. Taiwan is easier at the airport but harder in town.',
      },
      {
        q: 'Should I buy one plan for a multi country trip?',
        a: 'If you are crossing two or more borders, yes. Repeated local purchases lose their price advantage once you count the registrations and the wasted balance you leave behind.',
      },
    ],
  },

  'southeast-asia': {
    angle: 'The one region where people really do cross five borders in a month',
    h1: 'eSIM for Southeast Asia',
    title: 'Southeast Asia eSIM: built for itineraries that cross borders',
    metaDescription:
      'Southeast Asia is the region where travellers genuinely visit four or five countries in a single trip. That is exactly the case a regional eSIM exists for.',
    sectionOrder: ['intro', 'route', 'local', 'islands', 'choose', 'faq'],
    intro: [
      'Most regional plans are sold on a hypothetical. Southeast Asia is where the hypothetical is real: a two month trip through Thailand, Laos, Vietnam, Cambodia and Malaysia is an ordinary itinerary here, not an ambitious one.',
      'That changes the maths completely. Everywhere else, buying locally usually wins. Here, buying locally five times means five registrations, five numbers your contacts do not have, and five part used balances you will never spend.',
    ],
    sections: {
      route: {
        heading: 'Count the borders, not the countries',
        body: [
          'The decision rule on this route is simple. One country for two weeks, buy locally and enjoy the price. Three or more countries in a month, take the regional plan and stop thinking about it.',
          'The awkward middle is two countries. If the second one is a short hop, most people find it cheaper to buy locally twice. If the second one is a fortnight in its own right, the regional plan usually wins on hassle even where it loses slightly on price.',
        ],
      },
      local: {
        heading: 'What local prepaid actually costs here',
        body: [
          'Very little, and that is the honest context. Vietnamese, Indonesian and Thai prepaid data is cheap enough that the price of a travel plan looks indefensible on a spreadsheet. The spreadsheet is not wrong. It just does not have a column for the counter at Suvarnabhumi at two in the morning.',
          'Registration requirements are real across the region. Thailand, Indonesia and Vietnam all want identity documents against a prepaid line. That is a normal transaction if you have time and a bad one if you are connecting to a domestic flight.',
        ],
      },
      islands: {
        heading: 'Coverage is not uniform and nobody should pretend it is',
        body: [
          'City coverage across the region is genuinely good, often better than rural Europe. Bangkok, Kuala Lumpur, Singapore and Ho Chi Minh City are dense and fast.',
          'The islands are where expectations need managing. Small Indonesian and Philippine islands, parts of Laos, and the mountain routes in northern Vietnam are thin or absent regardless of whose profile you are carrying. No travel plan changes the physical network underneath it.',
        ],
      },
      choose: {
        heading: 'A practical way to decide',
        body: [
          'Write down your route before you price anything. If it fits in one country, you have a country decision. If it crosses borders, you have a regional decision, and the price difference will be smaller than the difference in your arrival experience.',
          'Then check the two things that ruin trips: whether your handset is carrier locked, and whether anything you rely on needs an SMS to a local number. Both are easier to solve at home.',
        ],
      },
    },
    faq: [
      {
        q: 'How many countries make a regional plan worth it here?',
        a: 'Three or more inside a month is a clear yes. Two is a judgement call. One is a country plan.',
      },
      {
        q: 'Is coverage good on the islands?',
        a: 'Variable, and not something any travel plan can fix. Major islands are fine. Small Indonesian and Philippine islands and remote Laos are thin for every operator.',
      },
      {
        q: 'Do I need to register my identity for a local SIM?',
        a: 'In most of the region, yes. Thailand, Indonesia and Vietnam all require identity documents. A travel eSIM skips that step entirely.',
      },
      {
        q: 'Will a regional plan give me a local number in each country?',
        a: 'No. Data only means no number anywhere. If you need a local line for verification codes, that is a separate purchase.',
      },
    ],
  },

  'north-america': {
    angle: 'Three countries, one of which is a genuine roaming trap',
    h1: 'eSIM for North America',
    title: 'North America eSIM: the borders are the expensive part',
    metaDescription:
      'The United States, Canada and Mexico look like one trip and bill like three. Where the borders fall is what decides whether you need a travel eSIM.',
    sectionOrder: ['intro', 'us', 'borders', 'coverage', 'choose', 'faq'],
    intro: [
      'North America reads as a single destination on a map and behaves as three separate tariff zones on a phone bill. The United States, Canada and Mexico are each their own market with their own operators, and nothing crosses between them for free unless your own plan says so.',
      'For visitors from Europe this is the region where roaming charges are least forgiving, because there is no equivalent of the EU rule to fall back on. What you pay is whatever your operator decided to charge for another continent.',
    ],
    sections: {
      us: {
        heading: 'The United States is its own decision',
        body: [
          'American networks are dense, fast and expensive for visitors. Coverage in cities and along the interstates is excellent. Coverage in the interior west, in national parks and on long desert stretches is thinner than people expect, and that is true of every operator rather than a failing of any product.',
          'The largest single block of search we measure in this region is not about coverage at all. It is troubleshooting: people whose eSIM has been installed and is not connecting. That is worth knowing before you travel, because the fix is almost always a setting rather than a purchase.',
        ],
      },
      borders: {
        heading: 'Crossing into Canada or Mexico',
        body: [
          'A United States plan does not follow you across either border by default. Some domestic American contracts now bundle Canada and Mexico, which is the single most useful thing to check before you buy anything else.',
          'If you are flying in from outside the continent and your trip includes two of the three countries, that is the point where a regional plan starts to make sense. A single country plan plus a border crossing is a bill waiting to happen.',
        ],
      },
      coverage: {
        heading: 'What to expect once you are connected',
        body: [
          'Canadian coverage follows the population, which means it follows the southern band and the highways. North of that, expect gaps that are geographic rather than commercial.',
          'Mexican coverage is strong in the cities, the resort corridors and the main highways, and patchier in the mountains and the smaller inland towns. Again, this is the network on the ground, not the profile on your phone.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'Check your own contract first, specifically for whether Canada and Mexico are bundled. A surprising number of North American plans include them now and a surprising number of travellers do not know it.',
          'If you are visiting from abroad, decide by border count. One country, buy a country plan. Two or three, a regional plan removes the two moments where the bill usually goes wrong.',
        ],
      },
    },
    faq: [
      {
        q: 'Does a United States plan work in Canada and Mexico?',
        a: 'Not automatically. Some American contracts bundle both, many do not. It is the first thing to check and the cheapest problem to solve.',
      },
      {
        q: 'Is coverage reliable in national parks?',
        a: 'Often not, for any operator. Remote parts of the American west and the Canadian interior are genuinely unserved. Download maps before you go.',
      },
      {
        q: 'Why do so many people search for eSIM troubleshooting in the United States?',
        a: 'Because the installed base is large and the failure is usually a configuration detail rather than a broken product. Data roaming switched off is the most common single cause.',
      },
      {
        q: 'Do I get an American phone number?',
        a: 'Not from a data only travel plan. If you need one for a local service, that is a separate product.',
      },
    ],
  },

  'south-america': {
    angle: 'A continent where the traveller and the local market speak different languages',
    h1: 'eSIM for South America',
    title: 'South America eSIM: long routes, real borders, honest coverage',
    metaDescription:
      'South American trips cover long distances and several borders. Coverage is good in the cities and honest about its limits outside them.',
    sectionOrder: ['intro', 'distances', 'borders', 'brazil', 'choose', 'faq'],
    intro: [
      'South American itineraries are long. A month here routinely means three or four countries and several internal flights, and the distances between good coverage and no coverage are measured in hours rather than minutes.',
      'That combination, long routes and real borders, is what makes connectivity worth planning here rather than improvising. Roaming between South American countries is not cheap and is not harmonised.',
    ],
    sections: {
      distances: {
        heading: 'Coverage follows the cities, and the cities are far apart',
        body: [
          'Buenos Aires, Santiago, Lima, Bogota and the Brazilian coastal cities have coverage that would not embarrass a European capital. The Andes, the Amazon basin, Patagonia and the long bus routes between them do not, and no travel plan changes that.',
          'Plan for offline. Download the map, download the ticket, screenshot the address. This is advice we would give regardless of what you buy from anyone.',
        ],
      },
      borders: {
        heading: 'Borders are frequent and roaming between them is not free',
        body: [
          'There is no continental agreement here equivalent to the European one. Crossing from Argentina into Chile or from Peru into Bolivia means leaving one operator behind and entering another commercial relationship.',
          'For a single country trip, buying locally is usually both cheap and easy. For the classic multi country route, the repeated purchases and the wasted balances add up faster than the price difference suggests.',
        ],
      },
      brazil: {
        heading: 'Brazil is not the rest of the continent',
        body: [
          'Brazil is large enough, and different enough, to be treated as its own market rather than as a part of South America. The language is different, the search vocabulary is different, and the destination set Brazilian travellers care about is mostly Argentina, Chile, Uruguay and Peru rather than Europe.',
          'If you are Brazilian and reading this in English, the page written for your market will be more useful than this one once it is live.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'One country for two weeks or less, buy a country plan. Two or more countries, or a route that includes long overland legs, take the regional option and stop buying at borders.',
          'Either way, treat coverage as a planning constraint rather than a product feature. The gaps here are real and they are the same gaps for everyone.',
        ],
      },
    },
    faq: [
      {
        q: 'Is there free roaming between South American countries?',
        a: 'No. There is no equivalent of the European agreement. Each border is a new commercial relationship.',
      },
      {
        q: 'Will I have signal in Patagonia or the Amazon?',
        a: 'Frequently not, for any operator. Plan offline for both, and treat any signal you do find as a bonus.',
      },
      {
        q: 'Is Brazil covered by a South America plan?',
        a: 'Usually yes on paper. But Brazilian travellers search differently and want a different destination set, which is why we treat Brazil as its own market rather than a subsection of this one.',
      },
      {
        q: 'Should I buy locally instead?',
        a: 'For a single country, very likely. For a multi country route, the repeated purchases and stranded balances usually cost more than they save.',
      },
    ],
  },

  'central-america': {
    angle: 'Small countries, close together, crossed by land',
    h1: 'eSIM for Central America',
    title: 'Central America eSIM: short hops across a lot of borders',
    metaDescription:
      'Central American countries are small and close, so a two week trip can cross four borders by bus. That is what makes connectivity here a regional question.',
    sectionOrder: ['intro', 'geography', 'overland', 'coverage', 'choose', 'faq'],
    intro: [
      'Central America packs seven countries into a distance you could drive across in a few days. A fortnight here easily takes in Guatemala, Belize, Honduras, Nicaragua and Costa Rica, and most of that travel happens by road rather than by air.',
      'Overland border crossings are what make this region different. You do not pass through an airport that reminds you that you have changed country. You pass through a checkpoint, and your phone quietly starts roaming.',
    ],
    sections: {
      geography: {
        heading: 'The distances are short and the borders are not',
        body: [
          'Because the hops are short, people underestimate how many operators they will touch. A single week can involve three separate national networks, each with its own visitor tariff.',
          'This is the region where the difference between a country plan and a regional one is least about price and most about not having to think at every checkpoint.',
        ],
      },
      overland: {
        heading: 'Why overland crossings catch people out',
        body: [
          'An airport arrival is a clear signal to buy something. A land border rarely is. The bus keeps moving, the signal reconnects to a different network, and the charge starts without anything on screen telling you it has.',
          'If you are travelling this region by road, decide your connectivity before the first crossing rather than after the first bill.',
        ],
      },
      coverage: {
        heading: 'What coverage looks like on the ground',
        body: [
          'Capital cities, the Pacific coast resorts and the main highways are well served. Coverage on the Caribbean side, in the highlands and in the smaller inland towns is thinner and inconsistent between operators.',
          'Costa Rica and Panama are generally the strongest. Rural Guatemala, Honduras and Nicaragua are where you should expect to be offline for stretches.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'If your trip is one country, buy for that country. If it is the classic overland route, the regional plan is doing the thing it was designed for.',
          'And as everywhere, check your handset is not carrier locked before you fly. It is the single most common reason a perfectly good profile refuses to install.',
        ],
      },
    },
    faq: [
      {
        q: 'Do I need a separate plan for each country?',
        a: 'Only if you insist on buying locally. On a multi country overland route that means several purchases in two weeks, which is exactly the case a regional plan answers.',
      },
      {
        q: 'Is roaming charged at land borders?',
        a: 'Yes, and usually without any obvious signal that it has started. Land crossings are the main reason bills surprise people in this region.',
      },
      {
        q: 'Which countries here have the best coverage?',
        a: 'Costa Rica and Panama, generally. Rural areas of Guatemala, Honduras and Nicaragua are the thinnest.',
      },
      {
        q: 'Is a regional plan good value for a one week trip?',
        a: 'Only if that week crosses borders. A week in one country is a country plan.',
      },
    ],
  },

  caribbean: {
    angle: 'Island hopping means changing networks, not just changing beaches',
    h1: 'eSIM for the Caribbean',
    title: 'Caribbean eSIM: every island is its own network',
    metaDescription:
      'Caribbean islands are separate telecom markets even when they are twenty minutes apart by plane. That is what makes island hopping a connectivity decision.',
    sectionOrder: ['intro', 'islands', 'cruise', 'coverage', 'choose', 'faq'],
    intro: [
      'The Caribbean looks like one destination from a brochure and behaves like dozens of separate telecom markets in practice. Islands twenty minutes apart by plane are different countries with different operators and different visitor tariffs.',
      'For a single resort week that hardly matters. For anyone hopping, sailing or cruising, it is the entire question.',
    ],
    sections: {
      islands: {
        heading: 'Why island hopping changes the answer',
        body: [
          'A local SIM bought in Barbados does not help you in Saint Lucia. Each island is a new purchase or a new roaming charge, and the hops are short enough that people make several of them in a week.',
          'Some regional operators do cover multiple islands under one brand, which softens this. It is worth checking whether the islands on your itinerary happen to share one.',
        ],
      },
      cruise: {
        heading: 'Cruise passengers need to know one thing',
        body: [
          'At sea, your phone connects to the ship satellite network, not to any island network. No travel eSIM covers that, and the rates on a maritime network are the ones people tell horror stories about.',
          'The practical answer is to keep data switched off at sea and use your plan in port. Any product that implies otherwise is not describing how maritime roaming works.',
        ],
      },
      coverage: {
        heading: 'Coverage in the places you will actually be',
        body: [
          'Resort areas, cruise ports and the main towns are generally well covered on the larger islands. Interiors, smaller cays and the quieter eastern islands are more variable.',
          'Weather matters here in a way it does not elsewhere. Network infrastructure in the hurricane belt takes damage, and recovery after a storm takes time.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'One island, one week: buy for that island, or check whether your own plan already includes it, because some North American contracts do.',
          'More than one island, or a sailing itinerary: a regional plan is the only version of this that does not involve buying something new every few days.',
        ],
      },
    },
    faq: [
      {
        q: 'Does one plan work across all the islands?',
        a: 'A regional plan is designed to. A local SIM from one island will not, because each island is a separate market.',
      },
      {
        q: 'Will my eSIM work on a cruise ship?',
        a: 'No. At sea you are on the ship satellite network, which is separate from every island network and charged separately. Use data in port.',
      },
      {
        q: 'Do American plans cover the Caribbean?',
        a: 'Some do for specific islands, particularly Puerto Rico and the United States Virgin Islands. Check your own tariff rather than assuming.',
      },
      {
        q: 'Is coverage affected by storms?',
        a: 'Yes. This is the hurricane belt and network damage after a storm is real. It is a planning consideration rather than a product feature.',
      },
    ],
  },

  'middle-east': {
    angle: 'Where the calling apps you rely on may simply not work',
    h1: 'eSIM for the Middle East',
    title: 'Middle East eSIM: data is easy, voice over internet is the catch',
    metaDescription:
      'Connectivity across the Gulf and the wider Middle East is excellent. What varies is whether the calling apps you use at home are permitted to work.',
    sectionOrder: ['intro', 'voip', 'gulf', 'coverage', 'choose', 'faq'],
    intro: [
      'The Middle East is one of the better connected regions in the world. Gulf networks in particular are fast, modern and dense, and the airports you arrive at are among the best served anywhere.',
      'The complication here is not coverage. It is that some services you take for granted at home are restricted on some networks, and that is a regulatory matter rather than a technical one.',
    ],
    sections: {
      voip: {
        heading: 'Voice and video calling is the thing to check',
        body: [
          'Several countries in the region restrict or block voice and video calling over the internet on local networks. Messaging usually works. The call button sometimes does not.',
          'This catches out travellers who assume a data plan means they can call home the way they do everywhere else. Check the current position for the specific country before you rely on it, because the rules change and they differ between operators.',
        ],
      },
      gulf: {
        heading: 'The Gulf is a different market from the rest of the region',
        body: [
          'Dubai and the wider Emirates generate the largest visitor demand in the region by a wide margin, and that demand is overwhelmingly expressed in English rather than Arabic, even locally. Saudi Arabia follows the same pattern.',
          'Coverage across the Emirates, Qatar, Bahrain and Kuwait is genuinely excellent, including in the desert areas visitors are taken to. This is not a region where you should expect to be offline.',
        ],
      },
      coverage: {
        heading: 'Beyond the Gulf',
        body: [
          'Jordan, Israel, Oman and Turkey on its eastern side all have solid networks in the places travellers go. Coverage thins in the deserts and in the mountain areas, as it does everywhere.',
          'Turkey has its own page and its own rule about handset registration, which is the single most important connectivity fact in the region and has nothing to do with coverage.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'For a single Gulf city, a country plan is straightforward and the network will not let you down.',
          'For a multi country trip, a regional plan saves the repeated purchases. In both cases, check the calling restrictions before you assume your usual apps will work.',
        ],
      },
    },
    faq: [
      {
        q: 'Can I make WhatsApp or FaceTime calls?',
        a: 'It depends on the country and the network. Several countries in the region restrict internet calling while leaving messaging alone. Check the current position for your destination.',
      },
      {
        q: 'Is coverage good in the desert?',
        a: 'In the Gulf, surprisingly good, including on the routes tour operators use. Elsewhere in the region it thins as you would expect.',
      },
      {
        q: 'Do I need Arabic to buy or set anything up?',
        a: 'No. Visitor facing connectivity in the Gulf is conducted in English, which is also how the demand is expressed in search.',
      },
      {
        q: 'Does Turkey count as Middle East for a regional plan?',
        a: 'Plans vary on this. Turkey also has a handset registration rule that makes it worth reading its own page whichever plan you choose.',
      },
    ],
  },

  africa: {
    angle: 'The continent where coverage claims deserve the most scrutiny',
    h1: 'eSIM for Africa',
    title: 'Africa eSIM: strong in the north, uneven everywhere else',
    metaDescription:
      'North African networks are good and heavily travelled. The rest of the continent varies enormously, and no travel plan changes the network on the ground.',
    sectionOrder: ['intro', 'north', 'south', 'reality', 'choose', 'faq'],
    intro: [
      'Africa is not one connectivity market and treating it as one is how travellers end up disappointed. A regional plan that lists forty countries is telling you about commercial agreements, not about whether you will have signal where you are going.',
      'The demand we measure is concentrated rather than spread. Morocco and Egypt account for an enormous share of it, driven mostly by European travellers, and the French and Spanish markets in particular.',
    ],
    sections: {
      north: {
        heading: 'North Africa is the part most visitors mean',
        body: [
          'Morocco, Egypt and Tunisia carry most of the visitor traffic on this continent and have the networks to match. Coverage in the cities, the resort strips and along the main tourist routes is solid.',
          'None of these countries are in any European roaming agreement, which is exactly why the demand exists. A French or Spanish plan stops working the moment the ferry docks or the plane lands.',
        ],
      },
      south: {
        heading: 'Southern and East Africa',
        body: [
          'South Africa, Kenya and Tanzania have competent urban networks and well developed mobile data markets, in some respects ahead of Europe. Safari areas and the national parks are a different matter and should be planned as offline.',
          'Local prepaid in these markets is inexpensive and widely available, so the trade off is the familiar one: price and a local number against arriving already connected.',
        ],
      },
      reality: {
        heading: 'Read the country list, not the continent name',
        body: [
          'A plan sold as covering Africa will have wildly different real world performance in Marrakesh and in rural Zambia. The honest way to buy here is to check the specific countries on your itinerary rather than the headline.',
          'We would rather tell you that a country is thinly served than sell you a regional plan that implies otherwise.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'For Morocco, Egypt or Tunisia alone, a country plan is the clean answer and the coverage will hold up.',
          'For a multi country trip, check that every country you care about is genuinely covered rather than merely listed, and plan the remote legs as offline regardless.',
        ],
      },
    },
    faq: [
      {
        q: 'Why is Morocco so heavily searched?',
        a: 'Because it is close to Europe, heavily visited, and outside every European roaming agreement. French and Spanish travellers generate a large share of that demand.',
      },
      {
        q: 'Will I have signal on safari?',
        a: 'Often not, and that is the network rather than the product. Plan those days offline and treat coverage in the parks as a bonus.',
      },
      {
        q: 'Is local prepaid a good option in Africa?',
        a: 'In Kenya, Tanzania and South Africa it is cheap and easy. The trade off is registration and the time it takes on arrival.',
      },
      {
        q: 'Does a continent wide plan actually work everywhere?',
        a: 'It works where there are agreements, which is not the same as everywhere. Check your specific countries rather than the headline.',
      },
    ],
  },

  oceania: {
    angle: 'Enormous distances and a very small number of operators',
    h1: 'eSIM for Oceania',
    title: 'Oceania eSIM: vast distances, few networks, real gaps',
    metaDescription:
      'Australia and New Zealand have good urban networks and long stretches with nothing at all. Knowing where the gaps are matters more than which plan you buy.',
    sectionOrder: ['intro', 'australia', 'nz', 'islands', 'choose', 'faq'],
    intro: [
      'Oceania is the region where the gap between the coverage map and the driving route is widest. Australian and New Zealand networks are modern and fast where they exist, and genuinely absent across distances that take hours to cross.',
      'There are also very few operators. That means less price competition than Europe, and it means the differences between products are smaller than the differences between where you are standing.',
    ],
    sections: {
      australia: {
        heading: 'Australia is a coverage question before it is a price question',
        body: [
          'Coverage follows the coast and the population. Sydney, Melbourne, Brisbane, Perth and the corridors between them are well served. The interior is not, and the difference is not marginal.',
          'If your trip includes the outback, long highway drives or the less visited parts of Western Australia and the Northern Territory, plan for extended periods with no signal from any operator.',
        ],
      },
      nz: {
        heading: 'New Zealand',
        body: [
          'Better proportionally than Australia because the country is smaller, but the same pattern applies. Cities and main highways are covered, the fiordland and alpine areas are not.',
          'Hiking routes in particular should be planned as fully offline. Download the maps and tell someone your route.',
        ],
      },
      islands: {
        heading: 'The Pacific islands',
        body: [
          'Fiji, Samoa, Tonga and the smaller island nations have limited networks and limited roaming agreements. A plan that lists Oceania may or may not include them in any meaningful way.',
          'If your itinerary includes the islands rather than just Australia and New Zealand, check them individually. This is the part of the region where headline coverage claims are least reliable.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'Australia and New Zealand together is the common itinerary and the case where a regional plan is straightforwardly useful, because the two countries do not share networks.',
          'Either country alone is a country plan. And in both, treat the coverage gaps as a planning input rather than something to be solved by buying differently.',
        ],
      },
    },
    faq: [
      {
        q: 'Will I have signal in the Australian outback?',
        a: 'Usually not. The gaps are geographic and apply to every operator. Plan those legs offline.',
      },
      {
        q: 'Does one plan cover both Australia and New Zealand?',
        a: 'A regional plan is designed to. The two countries have separate networks, so a single country plan will not follow you across.',
      },
      {
        q: 'Are the Pacific islands included?',
        a: 'Often only nominally. Check Fiji, Samoa and Tonga individually if they are on your route.',
      },
      {
        q: 'Is local prepaid a better deal?',
        a: 'In Australia and New Zealand it is competitive and easy to buy. The trade off is the same as everywhere: price against arriving connected.',
      },
    ],
  },

  balkans: {
    angle: 'The part of Europe where the roaming zone stops',
    h1: 'eSIM for the Balkans',
    title: 'Balkans eSIM: inside Europe, outside the roaming zone',
    metaDescription:
      'Albania, Serbia, Bosnia, North Macedonia and Montenegro are in Europe and outside EU roaming. That single fact is why this region generates so much demand.',
    sectionOrder: ['intro', 'zone', 'routes', 'coverage', 'choose', 'faq'],
    intro: [
      'The Balkans are the clearest example anywhere of a region that is geographically European and commercially separate. Croatia, Slovenia, Greece and Bulgaria are in the EU roaming zone. Albania, Serbia, Bosnia and Herzegovina, North Macedonia and Montenegro are not.',
      'That line is invisible on the ground. You cross it on a coastal road or a mountain pass, and the only thing that tells you is the bill afterwards.',
    ],
    sections: {
      zone: {
        heading: 'Which side of the line each country falls on',
        body: [
          'Inside the zone, and therefore free on an EU plan: Croatia, Slovenia, Greece, Bulgaria and Romania. Outside it, and therefore charged: Albania, Serbia, Bosnia and Herzegovina, North Macedonia and Montenegro.',
          'This is the single most useful thing on this page. Most Balkan itineraries touch both sides, which is why so many travellers here end up paying for something they assumed was included.',
        ],
      },
      routes: {
        heading: 'The routes where this actually bites',
        body: [
          'The Adriatic drive from Croatia down through Montenegro into Albania crosses the line twice. So does any trip that pairs Greece with North Macedonia, or Bulgaria with Serbia.',
          'Albania in particular generates strong demand, especially from Polish travellers, because it has become a mainstream beach destination while remaining outside the roaming agreement.',
        ],
      },
      coverage: {
        heading: 'Coverage is better than the reputation suggests',
        body: [
          'Networks across the region are modern and the cities are well served. Coastal Albania, Belgrade, Sarajevo, Skopje and Podgorica will not leave you stranded.',
          'The mountains are where coverage thins, and the mountains are a large part of why people come. Plan the hiking days offline.',
        ],
      },
      choose: {
        heading: 'How to decide',
        body: [
          'If your trip stays inside the EU part, you probably need nothing at all on an EU plan. If it crosses into Albania, Serbia, Bosnia, North Macedonia or Montenegro, that leg needs covering.',
          'For a route that crosses the line more than once, a regional plan avoids buying at every border. For a single country outside the zone, a country plan is cheaper.',
        ],
      },
    },
    faq: [
      {
        q: 'Which Balkan countries are covered by EU roaming?',
        a: 'Croatia, Slovenia, Greece, Bulgaria and Romania. Albania, Serbia, Bosnia and Herzegovina, North Macedonia and Montenegro are not.',
      },
      {
        q: 'Why does Albania come up so often?',
        a: 'It has become a mainstream summer destination while staying outside the roaming agreement, so a large number of visitors arrive expecting inclusive data and do not have it.',
      },
      {
        q: 'Is coverage reliable in the mountains?',
        a: 'Less so, and the mountains are a major draw here. Treat hiking days as offline and download what you need in advance.',
      },
      {
        q: 'Do I need anything if I am only visiting Croatia?',
        a: 'On an EU or EEA plan, no. Croatia is inside the roaming zone and your home allowance applies.',
      },
    ],
  },
};
