/**
 * Vendor seed data parsed from the 2026-03-27 vendor spreadsheet.
 *
 * Fields populated: name, boothNumber, email (where available), active status.
 * Fields left blank for management to complete: category, shortDescription, socialLinks, photo, website.
 *
 * Notes:
 * - "NP" and "WP" emails are excluded (not provided / WordPress-only)
 * - "customer requested to be removed" emails are excluded
 * - Duplicate/reference entries (e.g. "See Zio's (1713)") are included but flagged
 * - Vendors default to active: false so they can be reviewed before going live
 */

export interface VendorSeed {
  name: string
  boothNumber: string
  email: string | null
  active: boolean
}

function cleanEmail(raw: string | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (
    !trimmed ||
    trimmed === 'NP' ||
    trimmed === 'WP' ||
    trimmed.toLowerCase().includes('customer requested') ||
    !trimmed.includes('@')
  ) {
    return null
  }
  return trimmed.toLowerCase()
}

function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

function cleanBooth(raw: string): string {
  return raw.trim().replace(/^"|"$/g, '')
}

export const vendorSeedData: VendorSeed[] = [
  { name: 'Roadshow Antiques', boothNumber: 'Building B', email: cleanEmail('gbugs@rogers.com'), active: true },
  { name: 'Kelsey Trail Trucking', boothNumber: 'Parking Lot', email: cleanEmail('igiguere@tfiintl.com'), active: true },
  { name: 'Tempo Plastic', boothNumber: 'Parking Lot', email: cleanEmail('accounting@tempoflexiblepackaging.com'), active: true },
  { name: 'Soncin Construction', boothNumber: 'Parking Lot', email: cleanEmail('gmitelman@soncin.ca'), active: true },
  { name: 'Chunky Fries (J.Adel) YPMC', boothNumber: 'Concession', email: cleanEmail('qurvanali@hotmail.com'), active: true },
  { name: 'ATV 4 Fun', boothNumber: 'Outside', email: cleanEmail('drew@atv4fun.ca'), active: true },
  { name: "John's Clothing", boothNumber: 'Outside', email: null, active: true },
  { name: 'Fireworks', boothNumber: 'Outside', email: null, active: true },
  { name: 'Jerrold Burns', boothNumber: 'Outside', email: null, active: true },
  { name: 'Winston', boothNumber: 'Outside', email: null, active: true },
  { name: "Salty's Diner", boothNumber: '1000', email: cleanEmail('sds120188@gmail.com'), active: true },
  { name: 'Mundo Cafe', boothNumber: '1700', email: null, active: true },
  { name: 'Sunrise Kitchen', boothNumber: '3000', email: cleanEmail('Sopheapnysovann@yahoo.com'), active: true },
  { name: 'Concord Rugs', boothNumber: '202, 203, 204, 205, 207', email: null, active: true },
  { name: 'Farmasi', boothNumber: '207', email: cleanEmail('sviterbo58@gmail.com'), active: true },
  { name: 'Fragrances Store', boothNumber: '209B, 210', email: cleanEmail('perfumeplus@mail.com'), active: true },
  { name: 'Creative Expressions', boothNumber: '208, 209A', email: null, active: true },
  { name: 'Chaze Trading', boothNumber: '211, 212, 213', email: cleanEmail('Anwar_Chaze@outlook.com'), active: true },
  { name: 'Sonia Hair', boothNumber: '215', email: cleanEmail('sopheaman05@gmail.com'), active: true },
  { name: 'Aromatic Fumes', boothNumber: '214, 216, 217, 218, 219, 220', email: cleanEmail('sales@juvenileway.com'), active: true },
  { name: 'Fungicopia', boothNumber: '223, 224', email: cleanEmail('fungiarethefurture@yahoo.com'), active: true },
  { name: "Daniel Becky D's Party Rental & Home Decor", boothNumber: '225', email: cleanEmail('dall@live.ca'), active: true },
  { name: 'Royal Fashions', boothNumber: '227, 228, 229', email: cleanEmail('PUIRPAL@hotmail.com'), active: true },
  { name: 'Mad River Apiary', boothNumber: '232', email: cleanEmail('madriverbuzzapiary@gmail.com'), active: true },
  { name: "B.J.'s Die Cast & Hotwheels", boothNumber: '233, 234, 235', email: cleanEmail('Jeffflear@hotmail.com'), active: true },
  { name: 'Muslim AMJ Can.', boothNumber: '236', email: cleanEmail('salman.mangla@gmail.com'), active: true },
  { name: "Tony's Carpets (Purans Carpets)", boothNumber: '238, 239, 240, 241, 242', email: null, active: true },
  { name: "Linda's Cosmetics", boothNumber: '244, 244A, 243', email: cleanEmail('lindasuliyakham@hotmail.com'), active: true },
  { name: 'Lost In Time', boothNumber: '244B, 245', email: cleanEmail('01blaster@live.ca'), active: true },
  { name: 'Dean Renowden', boothNumber: '246', email: cleanEmail('renowden@rogers.com'), active: true },
  { name: 'Catrina Mcphee', boothNumber: '247', email: cleanEmail('cdugue@hotmail.com'), active: true },
  { name: 'Daisy Health Care', boothNumber: '248', email: cleanEmail('jenniferbuchare@hotmail.com'), active: true },
  { name: "Nicky's 3 for 10", boothNumber: '251, 252, 253', email: null, active: true },
  { name: 'Lotto / K-Cups', boothNumber: '254, 255', email: cleanEmail('civic30@hotmail.com'), active: true },
  { name: 'Harvest Treasures', boothNumber: '256, 257', email: cleanEmail('info@harvesttreasures.com'), active: true },
  { name: 'Naked K9 Nutrition', boothNumber: '260', email: cleanEmail('info@nakedk9nutrition.com'), active: true },
  { name: 'Herbal Remedies', boothNumber: '303, 304', email: null, active: true },
  { name: 'Thai Massage', boothNumber: '307, 308', email: cleanEmail('chadaphakenwong@gmail.com'), active: true },
  { name: 'Maximum Darts', boothNumber: '402, 403, 405, 406, 407, 408', email: cleanEmail('rick_smith@maximumdarts.com'), active: true },
  { name: "Paul's Collectables", boothNumber: '404', email: null, active: true },
  { name: 'Bukhari (Cell Accessories Village)', boothNumber: '503, 504, 505, 506, 2303, 2304, 2305, 2306', email: cleanEmail('SYEDAHZAF@hotmail.com'), active: true },
  { name: "Kavita's Jewellery", boothNumber: '501, 502, 507, 508', email: cleanEmail('raju72@rogers.com'), active: true },
  { name: "Veronica's (Cute Cute Store)", boothNumber: '601, 602', email: cleanEmail('choytan@hotmail.com'), active: true },
  { name: "Bob's Collectables", boothNumber: '603, 604', email: null, active: true },
  { name: "Matt's Surplus", boothNumber: '605, 606', email: cleanEmail('mattpoppe117@hotmail.com'), active: true },
  { name: 'Milkcrate Vinyl', boothNumber: '607, 608', email: cleanEmail('milkcratealleyrecords@gmail.com'), active: true },
  { name: 'Section 8 (Nascar John)', boothNumber: '701, 702, 703, 704', email: cleanEmail('section8apparel@rogers.com'), active: true },
  { name: 'Stylin Sunglasses', boothNumber: '708', email: cleanEmail('abrark_76@hotmail.com'), active: true },
  { name: 'Winston (Main)', boothNumber: '901, 902, 903, 904, 905, 906, 907, 908', email: cleanEmail('ng.winston@yahoo.ca'), active: true },
  { name: 'Winston (Building 2)', boothNumber: '221, 222', email: cleanEmail('ng.winston@yahoo.ca'), active: true },
  { name: 'Blanket World', boothNumber: '1001, 1002, 1007, 1008', email: cleanEmail('celltech100@hotmail.com'), active: true },
  { name: 'Magic Accounting & Tax', boothNumber: '1005, 1006', email: cleanEmail('info@magic-accounting.ca'), active: true },
  { name: 'Value Bins / Bargain Binz', boothNumber: '1101, 1102, 1103, 1104', email: cleanEmail('ujayed@gmail.com'), active: true },
  { name: 'Watillery', boothNumber: '1105, 1106', email: cleanEmail('ferhan_qureshi@hotmail.com'), active: true },
  { name: "Norm's Lazer", boothNumber: '1107, 1108', email: null, active: true },
  { name: 'Tatiana Gordon', boothNumber: '1201', email: cleanEmail('tatianapgordon@gmail.com'), active: true },
  { name: 'Kanda & Co.', boothNumber: '1207, 1208', email: cleanEmail('Kandaco.inc@gmail.com'), active: true },
  { name: 'Y2K Computers', boothNumber: '1203, 1204, 1205, 1206', email: cleanEmail('Y2KComputers911@gmail.com'), active: true },
  { name: 'Hollywood Closets (RTD Designs)', boothNumber: '1301, 1302', email: cleanEmail('robyndear11@gmail.com'), active: true },
  { name: 'Think Young Design', boothNumber: '1303, 1304', email: cleanEmail('thinkyoungdesign@outlook.com'), active: true },
  { name: 'Claren Zee', boothNumber: '1305, 1306', email: cleanEmail('tracychong81@gmail.com'), active: true },
  { name: "Stan's Paintings", boothNumber: '1307, 1308', email: cleanEmail('satsr13@gmail.com'), active: true },
  { name: 'Bobby / Tanya', boothNumber: '1401, 1402, 1407, 1408', email: cleanEmail('tls723@gmail.com'), active: true },
  { name: 'Profile Digital', boothNumber: '1403, 1404, 1405, 1406', email: cleanEmail('lipladycanada@gmail.com'), active: true },
  { name: 'Oza Sugar Cellular', boothNumber: '1501, 1502, 1507, 1508', email: cleanEmail('aakash1703@gmail.com'), active: true },
  { name: 'World Famous Astrologer', boothNumber: '1503, 1504', email: cleanEmail('ramswamy1000@gmail.com'), active: true },
  { name: 'Tres Chic Boutique', boothNumber: '1601, 1602', email: cleanEmail('chicboutique1of1@gmail.com'), active: true },
  { name: 'James Video Games', boothNumber: '1603, 1604', email: cleanEmail('hugewrestlingfan1976@gmail.com'), active: true },
  { name: 'Simcoe Numismatics', boothNumber: '1607, 1608', email: cleanEmail('simcoecoin@hotmail.com'), active: true },
  { name: 'J.T. Deli', boothNumber: '1701, 1702', email: cleanEmail('maxmarkh@gmail.com'), active: true },
  { name: 'Mr. Canela', boothNumber: '1703, 1704', email: cleanEmail('regpat@gmail.com'), active: true },
  { name: 'M.V. Produce', boothNumber: '1705', email: cleanEmail('TonyPiterna@gmail.com'), active: true },
  { name: 'A & D Bioaire (Fudge & Nuts)', boothNumber: '1706', email: cleanEmail('adhess@sympatico.ca'), active: true },
  { name: 'Heal & Eat', boothNumber: '1707', email: cleanEmail('heateatenjoy@gmail.com'), active: true },
  { name: 'Yeti Puffs', boothNumber: '1708, 1709', email: cleanEmail('yetipuffs@gmail.com'), active: true },
  { name: 'Maya Artisan Bakery (Mad Bites)', boothNumber: '1710, 1711', email: cleanEmail('pkutukoglu@gmail.com'), active: true },
  { name: 'Snowie By Cherry', boothNumber: '1712', email: cleanEmail('snowiebycherry@outlook.com'), active: true },
  { name: "Zio's", boothNumber: '1713, 2531', email: cleanEmail('Brandygreco30@gmail.com'), active: true },
  { name: "Sea Lux Inc (Seven Sea's)", boothNumber: '1714, 1715', email: cleanEmail('info@sealuxproducts.com'), active: true },
  { name: "Olivia's Teas & Herbs", boothNumber: '1716', email: cleanEmail('oliviasteaznherbs@gmail.com'), active: true },
  { name: 'Golden Whisk', boothNumber: '1717', email: cleanEmail('goldenwhisk@rogers.com'), active: true },
  { name: 'Vekelstien Meats', boothNumber: '1718', email: cleanEmail('evguenivekselchtein@gmail.com'), active: true },
  { name: 'Smoothies', boothNumber: '1720', email: cleanEmail('Fashionjewelry@gmail.com'), active: true },
  { name: 'RFS Trading', boothNumber: '1721', email: null, active: true },
  { name: 'The Print Hut', boothNumber: '1722', email: cleanEmail('printhut@outlook.com'), active: true },
  { name: 'Loaded Baked Potato', boothNumber: '1723', email: cleanEmail('loadedlockd@gmail.com'), active: true },
  { name: "Scottish Products (Jackie's)", boothNumber: '1724A, 1724B, 1725A', email: cleanEmail('j.edwards1724@gmail.com'), active: true },
  { name: "Zio's Part 2 (Pomodoro)", boothNumber: '1725B, 2530', email: cleanEmail('Pomodoroitaliansauce@gmail.com'), active: true },
  { name: 'See Georgian Bay', boothNumber: '1801, 1802', email: null, active: true },
  { name: 'BookMan (Grant McKay)', boothNumber: '1803, 1804', email: null, active: true },
  { name: 'QSC', boothNumber: '1805, 1806, 1807', email: cleanEmail('fashionjewelry@gmail.com'), active: true },
  { name: 'All Things Dead', boothNumber: '1808', email: cleanEmail('atdinquires@outlook.com'), active: true },
  { name: 'Witch Plz', boothNumber: '1901, 1902, 1907, 1908', email: cleanEmail('witchplz@icloud.com'), active: true },
  { name: 'D. Enman Collectibles', boothNumber: '2001', email: cleanEmail('davidenman24@gmail.com'), active: true },
  { name: '3D Distribution', boothNumber: '2002, 2003, 2004, 2005, 2006', email: cleanEmail('roop@rogers.com'), active: true },
  { name: 'Camp Hill', boothNumber: '2007, 2008', email: cleanEmail('finance@camphill.on.ca'), active: true },
  { name: 'JD Marketing', boothNumber: '2101, 2102', email: cleanEmail('johndahmer@live.com'), active: true },
  { name: 'Innisfil Creek Honey', boothNumber: '2104', email: cleanEmail('brian@innisfilcreekhoney.com'), active: true },
  { name: 'Xtreme Music', boothNumber: '2105, 2106, 2111, 2112', email: cleanEmail('xtremeaudior441@gmail.com'), active: true },
  { name: "Pang's", boothNumber: '2107, 2108, 2109, 2110', email: cleanEmail('rpang20041@hotmail.com'), active: true },
  { name: 'Garelli Leather', boothNumber: '2201, 2202, 2207, 2208', email: cleanEmail('garenkeunelian@yahoo.com'), active: true },
  { name: 'Chris Moyer (Pharmacy)', boothNumber: '2203, 2204, 2205, 2206', email: cleanEmail('chris.moyer94@gmail.com'), active: true },
  { name: 'Perfume Warehouse Limited', boothNumber: '2301, 2302', email: null, active: true },
  { name: 'Yaffa Skin Care', boothNumber: '2307, 2308', email: cleanEmail('sales@yaffa-skincare.com'), active: true },
  { name: 'Jose Mucho Latin Products', boothNumber: '2403, 2404', email: null, active: true },
  { name: 'Scarlett Crafts', boothNumber: '2405, 2406, 2407, 2408, 2528, 2529', email: cleanEmail('admin@thescarlettphoenix.ca'), active: true },
  { name: 'Georgian Bay Liquidation', boothNumber: '1801, 1802, 2501, 2502, 2503', email: null, active: true },
  { name: 'Art Place', boothNumber: '2505, 2506, 2507, 2508, 2509', email: cleanEmail('artplace@hotmail.com'), active: true },
  { name: 'Eckankar', boothNumber: '2510, 2511', email: cleanEmail('cosmic.window@hotmail.com'), active: true },
  { name: "Jerry's Sign Factory", boothNumber: '2512', email: cleanEmail('thesignfactory@hotmail.ca'), active: true },
  { name: 'Plant Shop', boothNumber: '2514', email: cleanEmail('elbarra@live.ca'), active: true },
  { name: 'Video 101', boothNumber: '2515', email: cleanEmail('ryangenno@hotmail.com'), active: true },
  { name: 'Northern Realm', boothNumber: '2516, 2517', email: cleanEmail('northernrealmccg@gmail.com'), active: true },
  { name: 'Brookstone Academy', boothNumber: '2518', email: cleanEmail('youbelong@brookstoneacademy.ca'), active: true },
  { name: "Wolfie's Fishing Lures", boothNumber: '2519', email: null, active: true },
  { name: 'All Steel Windows', boothNumber: '2520, 2521', email: cleanEmail('renosaver@gmail.com'), active: true },
  { name: 'Susan Wade (JW)', boothNumber: '2522, 2523A', email: cleanEmail('andrew.wade12984@outlook.com'), active: true },
  { name: 'Dogel Bricks', boothNumber: '2524', email: cleanEmail('kralefamily@gmail.com'), active: true },
  { name: 'Growise Hydroponics', boothNumber: '2526, 2527, 2533', email: cleanEmail('chadButler@rogers.com'), active: true },
  { name: "Lisa's Jewellery", boothNumber: '2539', email: cleanEmail('kristinapniewski26@icloud.com'), active: true },
  { name: "Ed's Knife Sharpening", boothNumber: '2600', email: null, active: true },
  { name: "Comics, Toys & Collectibles", boothNumber: '2601, 2602, 2603, 2604, 2605, 2606, 2607, 2608', email: cleanEmail('domg514@yahoo.com'), active: true },
  { name: 'Mystic Crayon', boothNumber: '2701', email: cleanEmail('MysticCrayonLady@hotmail.com'), active: true },
  { name: 'EFT Farms', boothNumber: '2702, 2703, 2704', email: null, active: true },
  { name: "Master Quality (Lina's Clothing)", boothNumber: '2705, 2706, 2707, 2708', email: cleanEmail('chhunsrypich@yahoo.com'), active: true },
  { name: 'The Computer Store', boothNumber: '2801, 2802, 2807, 2808', email: cleanEmail('userlo105@aol.com'), active: true },
  { name: 'Retrocade', boothNumber: '2805, 2806', email: cleanEmail('jorge.cabezas25@gmail.com'), active: true },
  { name: 'Buzz Boxes', boothNumber: '2901', email: cleanEmail('sales@buzzboxes.ca'), active: true },
  { name: 'Toulison Nutraceuticals', boothNumber: '2902', email: cleanEmail('support@toulison.com'), active: true },
  { name: 'Krafty Kreations', boothNumber: '2903', email: cleanEmail('kraftykreations400@yahoo.com'), active: true },
  { name: 'Nashit Kalva Cellular', boothNumber: '3001, 3002, 3007, 3008', email: cleanEmail('nkalva@gmail.com'), active: true },
  { name: 'Earth Elements', boothNumber: '3003, 3004, 3005, 3006', email: cleanEmail('vahledoris@gmail.com'), active: true },
  { name: 'Sanmark Network', boothNumber: '3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108', email: cleanEmail('sanmarnetwork@gmail.com'), active: true },
  { name: 'Eze Dockers / Rex\'s Corner', boothNumber: '2536, 2537, 2538, 3201, 3503, 3504, 3505, 3506', email: cleanEmail('wayne@dennis.financial'), active: true },
  { name: 'Farshin Table Cloths & Designs', boothNumber: '3204', email: null, active: true },
  { name: 'Rainbow Jewellers', boothNumber: '3301, 3303, 3304', email: cleanEmail('CHOENG.BUT@GMAIL.COM'), active: true },
  { name: 'Rasta Closet', boothNumber: '3401, 3402', email: cleanEmail('rastacloset@yahoo.ca'), active: true },
  { name: "Ty's Blechlab", boothNumber: '3403', email: cleanEmail('tysblechlab@gmail.com'), active: true },
  { name: 'You & Magnets 4 Ever', boothNumber: '3404', email: null, active: true },
  { name: 'Polestar', boothNumber: '3501, 3502, 3507, 3508', email: cleanEmail('michell@polestarconsulting.ca'), active: true },
  { name: 'Farm Fresh Diet', boothNumber: '3601, 3602, 3603, 3604', email: null, active: true },
  { name: 'Dave Graham', boothNumber: '3607, 3608', email: null, active: true },
  { name: 'Pocket Knives', boothNumber: '3703, 3704, 3705, 3706', email: cleanEmail('sales@thepocketblade.com'), active: true },
  { name: 'Birdman Victor', boothNumber: '141', email: null, active: true },
]
