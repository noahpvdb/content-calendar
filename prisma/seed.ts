import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const ideas = [
  { title: 'Behind the Scenes: Morning Prep', description: 'Show the team preparing fresh produce before the store opens. Highlight our dedication to quality.', platform: 'instagram', pillar: 'community', tags: '["behind-the-scenes","team","morning"]', priority: 'high', caption: 'Every great day starts before the sun rises. Our team is up early ensuring you get only the freshest finds.' },
  { title: 'New Arrivals: Imported Italian Truffles', description: 'Showcase our latest shipment of black and white truffles from Umbria, Italy.', platform: 'instagram', pillar: 'promotion', tags: '["truffles","newArrival","luxury"]', priority: 'high', caption: 'Just landed: the finest truffles from Umbria. Available in-store for a limited time.' },
  { title: 'Wine Pairing Guide: Summer Roses', description: 'Educational post on pairing rose wines with summer foods. Feature 3 bottles from our selection.', platform: 'facebook', pillar: 'education', tags: '["wine","pairing","rose","summer"]', priority: 'medium', caption: 'Summer is rose season. Here are our top 3 picks and exactly what to pair them with.' },
  { title: 'Customer Spotlight: The Andersons', description: 'Feature a long-time loyal customer family and their favourite products.', platform: 'facebook', pillar: 'community', tags: '["customerSpotlight","community","loyalty"]', priority: 'medium' },
  { title: 'TikTok: Cheese Cutting ASMR', description: 'Satisfying video cutting through a wheel of aged Gruyere. No talking, just the sounds.', platform: 'tiktok', pillar: 'entertainment', tags: '["asmr","cheese","satisfying","viral"]', priority: 'high', caption: 'This is the most satisfying thing you will see today' },
  { title: 'How to Store Fresh Herbs', description: 'Quick tips video on keeping fresh herbs alive longer at home.', platform: 'tiktok', pillar: 'education', tags: '["tips","herbs","kitchen","fresh"]', priority: 'medium', caption: 'Stop throwing away your herbs! Try this instead' },
  { title: 'LinkedIn: Our Sourcing Philosophy', description: 'Long-form post about how we source products directly from small farms and producers.', platform: 'linkedin', pillar: 'education', tags: '["sourcing","philosophy","smallBusiness","quality"]', priority: 'medium' },
  { title: 'LinkedIn: 10 Years in Winnipeg', description: 'Milestone post celebrating 10 years of serving the Winnipeg community.', platform: 'linkedin', pillar: 'community', tags: '["anniversary","milestone","winnipeg","gratitude"]', priority: 'high' },
  { title: 'X/Twitter: Weekend Market Hours', description: 'Reminder of extended weekend hours for summer.', platform: 'twitter', pillar: 'promotion', tags: '["hours","weekend","reminder"]', priority: 'low' },
  { title: 'YouTube: Full Wine Tasting Event Recap', description: 'Long-form video recap of our monthly wine tasting evening. Include interviews with guests.', platform: 'youtube', pillar: 'community', tags: '["wine","event","recap","tasting"]', priority: 'high' },
  { title: 'Farmer Feature: Harvest Moon Farm', description: 'Introduce one of our local produce suppliers. Show their farm, story, and what they grow for us.', platform: 'instagram', pillar: 'community', tags: '["local","farmer","produce","story"]', priority: 'medium' },
  { title: 'Recipe: Summer Stone Fruit Galette', description: 'Feature a simple rustic tart using our stone fruits. Link to full recipe on website.', platform: 'instagram', pillar: 'education', tags: '["recipe","baking","summer","fruit"]', priority: 'medium', caption: 'Rustic, beautiful, and absolutely delicious. Full recipe linked in bio.' },
  { title: 'Poll: Your Favourite Cheese', description: 'Interactive poll asking followers their favourite cheese category.', platform: 'instagram', pillar: 'entertainment', tags: '["poll","interactive","cheese","engagement"]', priority: 'low' },
  { title: 'New Wine Arrivals: Burgundy Collection', description: 'Announce the arrival of our curated Burgundy wine selection for the season.', platform: 'facebook', pillar: 'promotion', tags: '["wine","burgundy","newArrival","france"]', priority: 'high' },
  { title: 'TikTok: Guess the Cheese Rind', description: 'Fun video where viewers guess the cheese by only seeing the rind close-up.', platform: 'tiktok', pillar: 'entertainment', tags: '["quiz","cheese","fun","engagement"]', priority: 'medium', caption: 'Can you guess what cheese this is?' },
  { title: 'Summer Charcuterie Board Ideas', description: 'Visual inspiration post with 4 different summer-themed charcuterie boards using our products.', platform: 'instagram', pillar: 'inspiration', tags: '["charcuterie","summer","entertaining","boards"]', priority: 'high', caption: 'Summer entertaining starts with a beautiful board. All products available in-store.' },
  { title: 'Olive Oil Tasting 101', description: 'Educational breakdown of how to properly taste and evaluate olive oil quality.', platform: 'youtube', pillar: 'education', tags: '["oliveoil","tasting","education","cooking"]', priority: 'medium' },
  { title: 'Weekend Promo: 15% Off All Specialty Cheese', description: 'Promotional post for the weekend cheese sale.', platform: 'facebook', pillar: 'promotion', tags: '["sale","promo","cheese","weekend"]', priority: 'high', caption: 'This weekend only: 15% off our entire specialty cheese collection. In-store only.' },
  { title: 'Morning Market Vibes Reel', description: 'Short cinematic reel of the store in the morning light - shelves stocked, flowers fresh, coffee brewing.', platform: 'instagram', pillar: 'inspiration', tags: '["reel","morning","aesthetic","mood"]', priority: 'medium', caption: 'Good morning, Winnipeg. Come find your favourites.' },
  { title: 'X/Twitter: Canada Day Local Picks', description: 'Canada Day themed post highlighting our Canadian-made and local products.', platform: 'twitter', pillar: 'promotion', tags: '["canadaDay","local","canadian","holiday"]', priority: 'medium', caption: 'Canada Day is almost here! Celebrate with these incredible Canadian-made finds from our shelves.' },
]

async function main() {
  console.log('Seeding database...')

  await prisma.scheduledPost.deleteMany()
  await prisma.contentIdea.deleteMany()

  const createdIdeas = []
  for (const idea of ideas) {
    const created = await prisma.contentIdea.create({
      data: {
        ...idea,
        tags: idea.tags ?? '[]',
        status: Math.random() > 0.5 ? 'idea' : Math.random() > 0.5 ? 'draft' : 'idea',
      },
    })
    createdIdeas.push(created)
  }

  const now = new Date()
  const scheduleDates = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
  ]

  for (let i = 0; i < Math.min(7, createdIdeas.length); i++) {
    await prisma.scheduledPost.create({
      data: {
        ideaId: createdIdeas[i].id,
        scheduledDate: scheduleDates[i],
        scheduledTime: ['09:00', '11:00', '14:00', '16:00', '18:00'][i % 5],
        platform: createdIdeas[i].platform,
        status: i < 2 ? 'posted' : i < 4 ? 'scheduled' : 'draft',
        caption: createdIdeas[i].caption ?? createdIdeas[i].description ?? '',
      },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
