import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ToyNest database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@toynest.com.au" },
    update: {},
    create: {
      email: "admin@toynest.com.au",
      name: "ToyNest Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "educational-stem" },
      update: {},
      create: {
        name: "STEM & Educational",
        slug: "educational-stem",
        description: "Science, technology, engineering and math toys that make learning fun",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "action-figures-dolls" },
      update: {},
      create: {
        name: "Dolls & Action Figures",
        slug: "action-figures-dolls",
        description: "Imaginative play with dolls, figures, and playsets",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: "outdoor-sports" },
      update: {},
      create: {
        name: "Outdoor & Sports",
        slug: "outdoor-sports",
        description: "Get kids moving with outdoor and sports toys",
        image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400",
        sortOrder: 3,
      },
    }),
    db.category.upsert({
      where: { slug: "arts-crafts" },
      update: {},
      create: {
        name: "Arts & Crafts",
        slug: "arts-crafts",
        description: "Unleash creativity with art, craft, and DIY kits",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
        sortOrder: 4,
      },
    }),
  ]);
  console.log("✅ Categories:", categories.length);

  // Products
  const products = [
    {
      name: "Junior Science Lab Kit",
      slug: "junior-science-lab-kit",
      description:
        "Ignite your child's curiosity with 30+ science experiments! This complete lab kit includes test tubes, safety goggles, chemical compounds (all safe), and a full-colour experiment book. Perfect for budding scientists aged 6 and up.\n\n✅ 30+ experiments\n✅ All materials included\n✅ Parent guide included\n✅ STEM curriculum aligned",
      shortDescription: "30+ hands-on experiments for curious young scientists",
      price: 49.95,
      compareAtPrice: 64.95,
      images: [
        "https://images.unsplash.com/photo-1532094349884-543559383f88?w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
      ],
      categoryId: categories[0].id,
      ageMin: 6,
      ageMax: 12,
      safetyBadges: ["CE", "AS/NZS"],
      tags: ["science", "stem", "experiments", "educational"],
      stock: 45,
      isFeatured: true,
    },
    {
      name: "Magnetic Building Tiles 64pc",
      slug: "magnetic-building-tiles-64pc",
      description:
        "Build anything you can imagine with these vibrant magnetic building tiles. The strong magnets snap together easily for endless 2D and 3D creations.\n\n✅ 64 pieces in 6 colours\n✅ Strong safe magnets\n✅ Builds spatial thinking\n✅ Compatible with major brands",
      shortDescription: "64 colourful magnetic tiles for endless creative building",
      price: 79.95,
      compareAtPrice: 99.95,
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
      ],
      categoryId: categories[0].id,
      ageMin: 3,
      ageMax: 12,
      safetyBadges: ["CE", "ASTM"],
      tags: ["building", "magnetic", "stem", "creative"],
      stock: 28,
      isFeatured: true,
    },
    {
      name: "Princess Castle Doll Set",
      slug: "princess-castle-doll-set",
      description:
        "Every child deserves a royal adventure! This enchanting castle comes with 2 princess dolls, 8 accessories, and a fold-out playset with multiple rooms.",
      shortDescription: "Magical castle playset with 2 dolls and 8 accessories",
      price: 59.95,
      images: [
        "https://images.unsplash.com/photo-1559295896-7e891e3a2de5?w=800",
      ],
      categoryId: categories[1].id,
      ageMin: 3,
      ageMax: 8,
      safetyBadges: ["CE", "EN71"],
      tags: ["dolls", "castle", "princess", "pretend-play"],
      stock: 33,
      isFeatured: true,
    },
    {
      name: "Superhero Action Figure 5-Pack",
      slug: "superhero-action-figure-5-pack",
      description:
        "Assemble the ultimate team! This pack features 5 detailed superhero action figures with articulated joints, capes, and accessories. Hours of imaginative play guaranteed.",
      shortDescription: "5 poseable superhero figures with accessories",
      price: 39.95,
      compareAtPrice: 54.95,
      images: [
        "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800",
      ],
      categoryId: categories[1].id,
      ageMin: 4,
      ageMax: 10,
      safetyBadges: ["CE", "ASTM"],
      tags: ["superhero", "action-figures", "imaginative-play"],
      stock: 52,
      isFeatured: false,
    },
    {
      name: "Balance Bike Pro — Red",
      slug: "balance-bike-pro-red",
      description:
        "The perfect first bike for toddlers. No pedals, no training wheels — just pure balance learning! Lightweight aluminium frame, adjustable seat, and pneumatic tyres make this the smoothest ride for little ones.",
      shortDescription: "Lightweight aluminium balance bike for toddlers",
      price: 129.95,
      compareAtPrice: 159.95,
      images: [
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800",
      ],
      categoryId: categories[2].id,
      ageMin: 2,
      ageMax: 5,
      safetyBadges: ["AS/NZS", "CE"],
      tags: ["bike", "outdoor", "balance", "toddler"],
      stock: 15,
      isFeatured: true,
    },
    {
      name: "Glow-in-the-Dark Frisbee Set",
      slug: "glow-in-the-dark-frisbee-set",
      description:
        "Take the fun into the night! This set of 2 LED-activated frisbees glow brightly in the dark for evening backyard fun. Durable and weather-resistant.",
      shortDescription: "2 LED frisbees that glow in the dark — perfect for night play",
      price: 24.95,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      ],
      categoryId: categories[2].id,
      ageMin: 5,
      ageMax: 12,
      safetyBadges: ["CE"],
      tags: ["outdoor", "frisbee", "glow", "sports"],
      stock: 67,
      isFeatured: false,
    },
    {
      name: "Rainbow Art Studio Kit",
      slug: "rainbow-art-studio-kit",
      description:
        "Everything an aspiring artist needs in one beautiful box! Includes 24 watercolour paints, 12 coloured pencils, 6 paint brushes, a canvas pad, stencils, and a step-by-step art guide.",
      shortDescription: "Complete art kit with paints, pencils, brushes and more",
      price: 44.95,
      compareAtPrice: 59.95,
      images: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
      ],
      categoryId: categories[3].id,
      ageMin: 5,
      ageMax: 12,
      safetyBadges: ["CE", "EN71"],
      tags: ["art", "painting", "creative", "craft"],
      stock: 41,
      isFeatured: true,
    },
    {
      name: "Slime Lab Mega Kit",
      slug: "slime-lab-mega-kit",
      description:
        "Make 20 types of slime! Fluffy slime, glitter slime, glow slime, and more. All ingredients are non-toxic and child-safe. Includes storage containers and full instructions.",
      shortDescription: "Make 20 types of safe, colourful slime at home",
      price: 34.95,
      images: [
        "https://images.unsplash.com/photo-1558618047-f4e80a9a19ab?w=800",
      ],
      categoryId: categories[3].id,
      ageMin: 6,
      ageMax: 12,
      safetyBadges: ["CE", "ASTM"],
      tags: ["slime", "craft", "diy", "chemistry"],
      stock: 89,
      isFeatured: false,
    },
    {
      name: "Coding Robot for Kids",
      slug: "coding-robot-for-kids",
      description:
        "Teach kids programming concepts through fun physical play! This programmable robot responds to colour cards — no screens required. A perfect introduction to computational thinking.",
      shortDescription: "Screen-free programmable robot — perfect intro to coding",
      price: 89.95,
      compareAtPrice: 109.95,
      images: [
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800",
      ],
      categoryId: categories[0].id,
      ageMin: 4,
      ageMax: 8,
      safetyBadges: ["CE", "AS/NZS"],
      tags: ["coding", "robot", "stem", "technology"],
      stock: 22,
      isFeatured: true,
    },
    {
      name: "Giant Bubble Wand Set",
      slug: "giant-bubble-wand-set",
      description:
        "Create massive, jaw-dropping bubbles up to 1 metre wide! Perfect for backyard fun and parties. Includes 3 giant wands, bubble solution concentrate, and a mixing bucket.",
      shortDescription: "Make massive 1-metre bubbles with this giant wand set",
      price: 19.95,
      images: [
        "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800",
      ],
      categoryId: categories[2].id,
      ageMin: 3,
      ageMax: 10,
      safetyBadges: ["CE"],
      tags: ["outdoor", "bubbles", "summer", "party"],
      stock: 120,
      isFeatured: false,
    },
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("✅ Products:", products.length);

  // Sample coupon
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 30,
      isActive: true,
    },
  });

  await db.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      description: "Free shipping on any order",
      type: "FREE_SHIPPING",
      value: 9.95,
      isActive: true,
    },
  });

  console.log("✅ Coupons: WELCOME10, FREESHIP");
  console.log("\n🎉 Seed complete!");
  console.log("   Admin login: admin@toynest.com.au / Admin@1234");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
