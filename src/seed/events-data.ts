/**
 * Event seed data for The 400 Market.
 *
 * Curated list of upcoming market events for 2026, themed around:
 *   - Ontario statutory holidays (Family Day, Victoria Day, Canada Day, etc.)
 *   - Major Barrie & Innisfil community events (Kempenfest, Winterfest, etc.)
 *   - Themed market weekends (Vintage Weekend, Spring Flea, etc.)
 *
 * All events run 9AM–5PM Saturday & Sunday at the market unless otherwise noted.
 * The market is at 2207 Industrial Park Rd, Innisfil ON L9S 3V9.
 */

export type EventSeed = {
  name: string
  startDate: string // ISO datetime in America/Toronto
  endDate?: string
  description: string
  location?: string
  recurring?: boolean
  recurrenceNote?: string
}

// Note: All times are stored as UTC ISO strings, calculated from
// America/Toronto local times. EDT (UTC-4) for Apr–Nov, EST (UTC-5) for Nov–Mar.

export const eventSeedData: EventSeed[] = [
  // ============================================================
  // OCTOBER 2025 (PAST)
  // ============================================================
  {
    name: 'Halloween Weekend Spooktacular',
    startDate: '2025-10-31T13:00:00.000Z', // Fri Oct 31, 9AM EDT
    endDate: '2025-11-02T22:00:00.000Z',   // Sun Nov 2, 5PM EST (DST ended that morning)
    description: 'A three-day Halloween bash to close out spooky season. Vintage Halloween decor, costumes, horror collectibles, haunted house props, and a kids costume contest Saturday at 2PM with prizes from market vendors. Trick or treat at every booth on Friday afternoon.',
    location: 'Main Hall',
  },

  // ============================================================
  // NOVEMBER 2025 (PAST)
  // ============================================================
  {
    name: 'Lest We Forget Memorial Weekend',
    startDate: '2025-11-08T14:00:00.000Z', // Sat Nov 8, 9AM EST
    endDate: '2025-11-09T22:00:00.000Z',
    description: 'A respectful weekend at the market featuring military memorabilia vendors, vintage Canadian Forces collectibles, and a moment of silence at 11AM on Sunday. Poppies were available at the front desk with all donations going to the Royal Canadian Legion Branch 547 in Innisfil.',
    location: 'Main Hall',
  },
  {
    name: 'Pre-Holiday Vendor Showcase',
    startDate: '2025-11-15T14:00:00.000Z',
    endDate: '2025-11-16T22:00:00.000Z',
    description: 'Got a head start on holiday shopping before the December rush. Christmas decor, handmade ornaments, gift baskets, and local artisan goods perfect for stocking stuffers. Free hot chocolate and shortbread cookies all weekend long.',
    location: 'Main Hall',
  },
  {
    name: 'Toy Drive & Family Weekend',
    startDate: '2025-11-22T14:00:00.000Z',
    endDate: '2025-11-23T22:00:00.000Z',
    description: 'A community weekend supporting the Innisfil Food Bank toy drive. Bring an unwrapped toy, get free coffee. Featured kids vendors, face painting, balloon animals, and a visit from the firefighters of Innisfil Station 1 with their truck on Saturday afternoon.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Anti-Black-Friday Weekend',
    startDate: '2025-11-28T13:00:00.000Z', // Black Friday 8AM early opening
    endDate: '2025-11-30T22:00:00.000Z',
    description: 'Three days of vendor-wide door crashers with zero corporate energy. Doors opened at 8AM Friday for early birds with free coffee and donuts until 10AM. Deep discounts across the market all weekend.',
    location: 'Main Hall + Outdoor Lot',
  },

  // ============================================================
  // DECEMBER 2025 (PAST)
  // ============================================================
  {
    name: 'Tree Lighting & Christmas Market',
    startDate: '2025-12-06T14:00:00.000Z',
    endDate: '2025-12-07T22:00:00.000Z',
    description: 'The 400 Market transformed into a winter wonderland. Christmas trees, wreaths, garlands, handmade ornaments, gift baskets, and seasonal treats filled the hall. Visit with Santa Saturday and Sunday from 11AM to 3PM and a Letters to Santa station for the kids.',
    location: 'Main Hall',
  },
  {
    name: 'Stocking Stuffer Christmas Market',
    startDate: '2025-12-13T14:00:00.000Z',
    endDate: '2025-12-14T22:00:00.000Z',
    description: 'Round two of the Christmas market — even bigger than weekend one. Last-minute gift ideas, stocking stuffers, holiday baking from local bakers, and live carollers performing in the courtyard Saturday and Sunday afternoon.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Last Minute Holiday Market',
    startDate: '2025-12-20T14:00:00.000Z',
    endDate: '2025-12-21T22:00:00.000Z',
    description: 'The final shopping weekend before Christmas with extended hours, gift wrapping at the information desk, and Santa\u2019s last visit of the season on Sunday afternoon. We had you covered for everything you forgot.',
    location: 'Main Hall',
  },
  {
    name: 'After-Christmas Clearance Days',
    startDate: '2025-12-26T14:00:00.000Z', // Fri Dec 26
    endDate: '2025-12-28T22:00:00.000Z',   // Sun Dec 28
    description: 'Three full days of post-Christmas markdowns. Vendors cleared out the leftover holiday stock with 30 to 70 percent off ornaments, decor, gift sets, and seasonal items. Doors opened at 8AM Friday for the early birds.',
    location: 'Main Hall',
  },

  // ============================================================
  // JANUARY 2026 (PAST)
  // ============================================================
  {
    name: 'New Year, New Finds',
    startDate: '2026-01-03T14:00:00.000Z',
    endDate: '2026-01-04T22:00:00.000Z',
    description: 'Kicked off 2026 with the first market weekend of the year. Resolution-friendly vendors with fitness gear, organizational tools, journals, planners, and home decor for that fresh-start feeling. Free coffee until noon both days.',
    location: 'Main Hall',
  },
  {
    name: 'Winter Clearance Blowout',
    startDate: '2026-01-10T14:00:00.000Z',
    endDate: '2026-01-11T22:00:00.000Z',
    description: 'A market-wide clearance weekend. Vendors marked down winter inventory, last year\u2019s stock, and everything that didn\u2019t move over the holidays. Bargain hunters paradise.',
    location: 'Main Hall',
  },
  {
    name: 'Innisfil Winterfest Pop-Up',
    startDate: '2026-01-17T14:00:00.000Z',
    endDate: '2026-01-18T22:00:00.000Z',
    description: 'A market pop-up to coincide with Innisfil Winterfest at Innisfil Beach Park. Hot chocolate stand, warm soup from local food trucks, winter accessories, mittens, toques, and snowshoes from Simcoe County makers.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Lake Simcoe Ice Fishing Day',
    startDate: '2026-01-24T14:00:00.000Z',
    endDate: '2026-01-25T22:00:00.000Z',
    description: 'A weekend dedicated to the Lake Simcoe ice fishing community. Featured vendors with ice augers, tip-ups, lures, ice huts, propane heaters, thermal gear, and stories of the one that got away. Free ice safety talk Saturday at 11AM.',
    location: 'Main Hall',
  },
  {
    name: 'Robbie Burns Weekend Market',
    startDate: '2026-01-31T14:00:00.000Z',
    endDate: '2026-02-01T22:00:00.000Z',
    description: 'A wee Scottish takeover of the market for Robbie Burns weekend. Tartans, kilts, shortbread, oat cakes, Scottish imports, and a piper performing in the courtyard at noon both days. Haggis was respectfully offered but optional.',
    location: 'Main Hall',
  },

  // ============================================================
  // FEBRUARY 2026 (PAST)
  // ============================================================
  {
    name: 'Big Game Weekend Bash',
    startDate: '2026-02-07T14:00:00.000Z',
    endDate: '2026-02-08T22:00:00.000Z',
    description: 'Got everything you needed for the big game on Sunday. Snack vendors, BBQ rubs, hot sauce makers, vintage sports memorabilia, jerseys, and a pop-up wing-tasting station from a local sauce maker. Tailgate-ready vibes all weekend.',
    location: 'Main Hall',
  },
  {
    name: 'Family Day & Valentine\u2019s Long Weekend',
    startDate: '2026-02-14T14:00:00.000Z', // Sat Feb 14 (Valentine's)
    endDate: '2026-02-16T22:00:00.000Z',   // Mon Feb 16 (Family Day)
    description: 'A three-day double-header for Valentine\u2019s Day and Family Day. Saturday focused on couples with handmade jewelry, chocolatiers, and florists. Sunday and Monday turned into family day with kids crafts, face painting, balloon animals, and an open market for the long weekend.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Cabin Fever Antique Show',
    startDate: '2026-02-21T14:00:00.000Z',
    endDate: '2026-02-22T22:00:00.000Z',
    description: 'A mid-winter antiques weekend to break up the cold. Furniture dealers, fine china, sterling silver, oil paintings, and the kind of treasures that come out when winter has worn down everyone\u2019s patience. Free appraisals at the information desk.',
    location: 'Main Hall',
  },
  {
    name: 'End of Winter Bargain Bash',
    startDate: '2026-02-28T14:00:00.000Z',
    endDate: '2026-03-01T22:00:00.000Z',
    description: 'Final weekend of February meant final winter clearouts. Vendors marked down everything they didn\u2019t want to drag through to spring. Layaway and trade-ins welcome.',
    location: 'Main Hall',
  },

  // ============================================================
  // MARCH 2026 (PAST)
  // ============================================================
  {
    name: 'Maple Syrup Festival Weekend',
    startDate: '2026-03-07T14:00:00.000Z', // Sat Mar 7, 9AM EST
    endDate: '2026-03-08T21:00:00.000Z',   // Sun Mar 8, 5PM EDT (DST started 2AM that day)
    description: 'Sugar shack season in full swing. Local maple syrup producers from across Simcoe County set up shop with fresh syrup, maple butter, maple sugar candy, and maple-glazed everything. Pancake breakfast in the courtyard Sunday morning from 9 to 11AM.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'St Patrick\u2019s Day Weekend',
    startDate: '2026-03-14T13:00:00.000Z',
    endDate: '2026-03-15T21:00:00.000Z',
    description: 'A green-themed weekend for the Irish (and the Irish-for-a-day). Celtic music, Irish imports, vintage Guinness signs, four-leaf clover hunt for the kids, and a corned beef sandwich pop-up Sunday afternoon. No pinching the unwearied.',
    location: 'Main Hall',
  },
  {
    name: 'First Day of Spring Market',
    startDate: '2026-03-21T13:00:00.000Z',
    endDate: '2026-03-22T21:00:00.000Z',
    description: 'Welcomed the official first day of spring with garden starts, seed packets, gardening tools, patio decor, and the optimistic energy of people ready to be done with winter. Free seeds for the first 100 visitors Saturday morning.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Spring Cleaning Yard Sale Weekend',
    startDate: '2026-03-28T13:00:00.000Z',
    endDate: '2026-03-29T21:00:00.000Z',
    description: 'A massive outdoor weekend with garage sale style vendors clearing out their winter storage. Everything from tools to toys to furniture at prices that needed to move. Bring cash and a truck.',
    location: 'Outdoor Lot',
  },

  // ============================================================
  // APRIL 2026 (PAST — most recent weekend before today)
  // ============================================================
  {
    name: 'Easter Long Weekend Market',
    startDate: '2026-04-03T13:00:00.000Z', // Good Friday
    endDate: '2026-04-05T21:00:00.000Z',   // Easter Sunday
    description: 'A three-day Easter weekend market. Easter decor, chocolate from local chocolatiers, pastel everything, and a free Easter egg hunt for kids Saturday at 11AM in the courtyard. Visit from the Easter Bunny Friday and Saturday afternoon.',
    location: 'Main Hall + Outdoor Lot',
  },

  // ============================================================
  // APRIL 2026 (UPCOMING)
  // ============================================================
  {
    name: 'Spring Flea Kickoff Weekend',
    startDate: '2026-04-11T13:00:00.000Z', // Sat Apr 11, 9AM EDT
    endDate: '2026-04-12T21:00:00.000Z',   // Sun Apr 12, 5PM EDT
    description: 'Shake off the winter and join us for the official kickoff of the 2026 flea season. Over 200 merchants are setting up fresh stalls with vintage finds, antiques, handmade goods, and one-of-a-kind treasures. Free entry, free parking, and food vendors all weekend long.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Earth Day Upcycle Market',
    startDate: '2026-04-18T13:00:00.000Z',
    endDate: '2026-04-19T21:00:00.000Z',
    description: 'Celebrate Earth Day weekend with our upcycle and reuse-themed market. Featured merchants are showcasing furniture restorations, repurposed decor, and salvaged treasures. Bring your own bag and take home something with a story.',
    location: 'Main Hall',
  },
  {
    name: 'Vintage Vinyl & Retro Tech Weekend',
    startDate: '2026-04-25T13:00:00.000Z',
    endDate: '2026-04-26T21:00:00.000Z',
    description: 'Crate diggers, this one is for you. Vinyl record dealers, vintage audio gear, retro game consoles, and 80s/90s memorabilia take over the market. Bring your wantlist and your patience — there is always one more crate.',
    location: 'Main Hall',
  },

  // ============================================================
  // MAY 2026
  // ============================================================
  {
    name: 'Mother\u2019s Day Weekend Market',
    startDate: '2026-05-09T13:00:00.000Z',
    endDate: '2026-05-10T21:00:00.000Z',
    description: 'Treat the moms in your life to something special. Handmade jewelry, fresh flowers, artisan candles, and local skincare vendors fill the market this weekend. Gift wrapping available at the information desk.',
    location: 'Main Hall',
  },
  {
    name: 'Victoria Day Long Weekend Spectacular',
    startDate: '2026-05-16T13:00:00.000Z',
    endDate: '2026-05-18T21:00:00.000Z',
    description: 'Three days of market madness for the Victoria Day long weekend. Extended hours, extra outdoor vendors, BBQ food trucks, and live music in the courtyard. Open Saturday, Sunday, and Monday from 9AM to 5PM.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Garden & Plant Festival',
    startDate: '2026-05-23T13:00:00.000Z',
    endDate: '2026-05-24T21:00:00.000Z',
    description: 'Get your garden ready for summer. Local growers from across Simcoe County bring perennials, vegetable starts, herbs, hanging baskets, and garden decor. Free planting tips from master gardeners on Saturday at 11AM.',
    location: 'Outdoor Lot',
  },
  {
    name: 'Sneaker & Streetwear Drop',
    startDate: '2026-05-30T13:00:00.000Z',
    endDate: '2026-05-31T21:00:00.000Z',
    description: 'A first for the 400 Market — a dedicated sneaker and streetwear weekend. Resellers from across Ontario set up shop with deadstock kicks, hype tees, and rare finds. Authentication available on site.',
    location: 'Main Hall',
  },

  // ============================================================
  // JUNE 2026
  // ============================================================
  {
    name: 'Innisfil Beach Day Pop-Up',
    startDate: '2026-06-13T13:00:00.000Z',
    endDate: '2026-06-14T21:00:00.000Z',
    description: 'Celebrate the start of summer with our beach-themed weekend. Beach gear, summer apparel, sunscreen, towels, coolers, and everything you need for a perfect day at Innisfil Beach Park. Free shuttle info available at the front desk.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Father\u2019s Day Tools & Toys Weekend',
    startDate: '2026-06-20T13:00:00.000Z',
    endDate: '2026-06-21T21:00:00.000Z',
    description: 'For the dads who love a good deal. Vintage tools, fishing gear, model trains, die-cast cars, and classic comic books take centre stage. Bring dad — he\u2019ll thank you later.',
    location: 'Main Hall',
  },
  {
    name: 'Pride Weekend Market',
    startDate: '2026-06-27T13:00:00.000Z',
    endDate: '2026-06-28T21:00:00.000Z',
    description: 'The 400 Market celebrates Pride Month with rainbow-themed decor, LGBTQ2S+ merchant features, and a portion of front-gate donations going to local Pride organizations in Simcoe County.',
    location: 'Main Hall',
  },

  // ============================================================
  // JULY 2026
  // ============================================================
  {
    name: 'Canada Day Weekend Bash',
    startDate: '2026-07-01T13:00:00.000Z',
    endDate: '2026-07-05T21:00:00.000Z',
    description: 'Five days of red, white, and bargains. The 400 Market is open Wednesday July 1 through Sunday July 5 to celebrate Canada Day. Maple-themed merchants, butter tarts, peameal bacon sandwiches, and live music all weekend long. Wear red and white — there\u2019s a prize for the best outfit.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Vintage Toys & Collectibles Weekend',
    startDate: '2026-07-11T13:00:00.000Z',
    endDate: '2026-07-12T21:00:00.000Z',
    description: 'Star Wars, Pokemon, He-Man, Barbie, Hot Wheels — if you collected it as a kid, somebody is selling it this weekend. Toy appraisals available Saturday from 1–3PM with our resident expert.',
    location: 'Main Hall',
  },
  {
    name: 'Antique & Estate Sale Weekend',
    startDate: '2026-07-18T13:00:00.000Z',
    endDate: '2026-07-19T21:00:00.000Z',
    description: 'Three estate sales merge into one massive weekend event. Furniture, fine china, sterling silver, oil paintings, and decades of carefully curated treasures from three Ontario estates. Cash and card accepted.',
    location: 'Main Hall',
  },
  {
    name: 'Christmas in July',
    startDate: '2026-07-25T13:00:00.000Z',
    endDate: '2026-07-26T21:00:00.000Z',
    description: 'Beat the rush. Get a head start on holiday shopping with our Christmas in July event. Decorations, ornaments, handmade gifts, and a visit from Santa himself on Saturday from 11AM–2PM (yes, in shorts).',
    location: 'Main Hall',
  },

  // ============================================================
  // AUGUST 2026
  // ============================================================
  {
    name: 'Civic Holiday Long Weekend',
    startDate: '2026-08-01T13:00:00.000Z',
    endDate: '2026-08-03T21:00:00.000Z',
    description: 'Three-day Civic Holiday weekend at the market. Extra outdoor vendors, BBQ food trucks, live country music in the courtyard, and a kids zone with face painting. Open Saturday, Sunday, and Monday.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Kempenfest Weekend Pop-Up',
    startDate: '2026-08-08T13:00:00.000Z',
    endDate: '2026-08-09T21:00:00.000Z',
    description: 'Heading to Kempenfest in Barrie? Make a day of it and stop at the 400 Market on the way. We\u2019re running a Kempenfest weekend pop-up with overflow vendors, classic car displays, and a dedicated maker\u2019s row featuring local artisans.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Back to School Bargain Weekend',
    startDate: '2026-08-15T13:00:00.000Z',
    endDate: '2026-08-16T21:00:00.000Z',
    description: 'Get ready for the new school year without breaking the bank. Backpacks, school supplies, kids clothing, lunchboxes, and used textbooks. Plus a free hot dog for every kid with a backpack purchase.',
    location: 'Main Hall',
  },
  {
    name: 'End of Summer Yard Sale Mega Event',
    startDate: '2026-08-22T13:00:00.000Z',
    endDate: '2026-08-23T21:00:00.000Z',
    description: 'Our biggest outdoor weekend of the year. Over 100 garage sale style vendors set up in the outdoor lot with everything they\u2019ve been hoarding all summer. Bring cash, bring a truck, bring patience — you\u2019ll need all three.',
    location: 'Outdoor Lot',
  },
  {
    name: 'Innisfil Days Community Weekend',
    startDate: '2026-08-29T13:00:00.000Z',
    endDate: '2026-08-30T21:00:00.000Z',
    description: 'Celebrating our hometown with a weekend dedicated to Innisfil makers, growers, and small businesses. Free coffee for Innisfil residents on Saturday morning (bring proof of address). Local musicians performing throughout the weekend.',
    location: 'Main Hall + Outdoor Lot',
  },

  // ============================================================
  // SEPTEMBER 2026
  // ============================================================
  {
    name: 'Labour Day Long Weekend Market',
    startDate: '2026-09-05T13:00:00.000Z',
    endDate: '2026-09-07T21:00:00.000Z',
    description: 'Last big long weekend of summer. Three full days of vendors, food trucks, and family fun. Open Saturday through Monday with extended outdoor lot vendors. Don\u2019t miss our Labour Day BBQ in the courtyard on Monday from noon to 4PM.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Harvest Festival Weekend',
    startDate: '2026-09-12T13:00:00.000Z',
    endDate: '2026-09-13T21:00:00.000Z',
    description: 'Celebrate the harvest with local farmers, bakers, and preservers. Fresh apples, squash, pumpkins, homemade pies, jams, jellies, and seasonal decor. Apple cider donuts on sale at the food court all weekend.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Fall Fashion Flip Weekend',
    startDate: '2026-09-19T13:00:00.000Z',
    endDate: '2026-09-20T21:00:00.000Z',
    description: 'Refresh your fall wardrobe without the mall prices. Vintage clothing, designer resale, leather jackets, boots, sweaters, and seasonal accessories. Trade-in welcome — bring something to sell.',
    location: 'Main Hall',
  },
  {
    name: 'Vintage Weekend',
    startDate: '2026-09-26T13:00:00.000Z',
    endDate: '2026-09-27T21:00:00.000Z',
    description: 'Mid-century furniture, vintage signage, Bakelite jewelry, atomic-era kitchenware, and the kind of stuff that makes pickers weep with joy. If you love anything pre-1980, clear your weekend.',
    location: 'Main Hall',
  },

  // ============================================================
  // OCTOBER 2026
  // ============================================================
  {
    name: 'Oktoberfest Weekend',
    startDate: '2026-10-03T13:00:00.000Z',
    endDate: '2026-10-04T21:00:00.000Z',
    description: 'Prost! Bratwurst, pretzels, German imports, beer steins, lederhosen, and the kind of polka music that makes you want to dance whether you can or not. Live oompah band on Saturday at 1PM and 3PM.',
    location: 'Main Hall',
  },
  {
    name: 'Thanksgiving Long Weekend',
    startDate: '2026-10-10T13:00:00.000Z',
    endDate: '2026-10-12T21:00:00.000Z',
    description: 'Thanksgiving weekend market is open Saturday, Sunday, and Monday. Find the perfect hostess gift, pick up locally grown produce for the big dinner, or just escape the in-laws for a few hours. We get it.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Halloween Spooktacular',
    startDate: '2026-10-24T13:00:00.000Z',
    endDate: '2026-10-25T21:00:00.000Z',
    description: 'The market goes full spooky for Halloween weekend. Vintage Halloween decor, costumes, horror collectibles, haunted house props, and a costume contest for kids on Saturday at 2PM with prizes from market vendors. Trick or treat at every booth.',
    location: 'Main Hall',
  },
  {
    name: 'Day of the Dead Artisan Market',
    startDate: '2026-10-31T13:00:00.000Z',
    endDate: '2026-11-01T21:00:00.000Z',
    description: 'Celebrating Día de los Muertos with featured Latin American artisans, traditional sugar skull decorations, marigold florals, and authentic food vendors. Face painting station Saturday and Sunday afternoon.',
    location: 'Main Hall',
  },

  // ============================================================
  // NOVEMBER 2026
  // ============================================================
  {
    name: 'Remembrance Weekend Market',
    startDate: '2026-11-07T14:00:00.000Z', // EST starts here (UTC-5)
    endDate: '2026-11-08T22:00:00.000Z',
    description: 'A respectful weekend at the market with featured military memorabilia vendors, vintage Canadian Forces collectibles, and a moment of silence at 11AM on Sunday. Poppies available at the front desk — donations to the Royal Canadian Legion.',
    location: 'Main Hall',
  },
  {
    name: 'Holiday Preview Weekend',
    startDate: '2026-11-14T14:00:00.000Z',
    endDate: '2026-11-15T22:00:00.000Z',
    description: 'Get a head start on holiday shopping before the December rush. Christmas decor, handmade ornaments, gift baskets, and local artisan goods perfect for stocking stuffers. Free hot chocolate and holiday cookies all weekend.',
    location: 'Main Hall',
  },
  {
    name: 'Black Friday Weekend Blowout',
    startDate: '2026-11-27T14:00:00.000Z',
    endDate: '2026-11-29T22:00:00.000Z',
    description: 'Skip the big box mayhem. The 400 Market is open Friday, Saturday, and Sunday with vendor-wide door crashers, deep discounts, and zero corporate energy. Doors open at 8AM Friday for early birds. Free coffee from 8–10AM.',
    location: 'Main Hall + Outdoor Lot',
  },

  // ============================================================
  // DECEMBER 2026
  // ============================================================
  {
    name: 'Christmas Market Weekend 1',
    startDate: '2026-12-05T14:00:00.000Z',
    endDate: '2026-12-06T22:00:00.000Z',
    description: 'The 400 Market transforms into a winter wonderland. Christmas trees, wreaths, garlands, handmade ornaments, gift baskets, and seasonal treats. Visit with Santa Saturday and Sunday from 11AM to 3PM. Letters to Santa station for the kids.',
    location: 'Main Hall',
  },
  {
    name: 'Christmas Market Weekend 2',
    startDate: '2026-12-12T14:00:00.000Z',
    endDate: '2026-12-13T22:00:00.000Z',
    description: 'Round two of our Christmas market — even bigger than weekend one. Last-minute gift ideas, stocking stuffers, holiday baking from local bakers, and live carollers Saturday and Sunday afternoon.',
    location: 'Main Hall + Outdoor Lot',
  },
  {
    name: 'Last Minute Shopping Weekend',
    startDate: '2026-12-19T14:00:00.000Z',
    endDate: '2026-12-20T22:00:00.000Z',
    description: 'Forget something? We\u2019ve got you. The final shopping weekend before Christmas with extended hours, gift wrapping at the information desk, and Santa\u2019s last visit of the season on Sunday afternoon.',
    location: 'Main Hall',
  },
  {
    name: 'Boxing Day Bargain Hunt',
    startDate: '2026-12-26T14:00:00.000Z',
    endDate: '2026-12-27T22:00:00.000Z',
    description: 'Skip the lineups at the mall. Boxing Day weekend at the market is when vendors clear out the leftover holiday stock — think 30 to 70 percent off ornaments, decor, gift sets, and seasonal items. Doors open at 8AM Saturday.',
    location: 'Main Hall',
  },
]
