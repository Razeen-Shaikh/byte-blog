import {
  ArticleStatus,
  CommentStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";
import "dotenv/config";

const prisma = new PrismaClient();

const defaultPassword = "Password123!";

function paragraph(title: string, body: string) {
  return `<h2>${title}</h2><p>${body}</p>`;
}

function codeBlock(code: string) {
  return `<pre><code>${code}</code></pre>`;
}

const articleBodies = [
  `<p>The modern web platform is less about any single framework win and more about predictable boundaries: routing, data fetching, rendering, and caching. Teams that document those boundaries early ship calmer refactors later.</p>
${paragraph("Why boundaries matter", "When UI, transport, and persistence logic bleed together, every feature becomes a migration project. Next.js App Router encourages colocation without sacrificing server-first defaults.")}
${codeBlock("export async function GET() {\n  return Response.json({ ok: true });\n}")}
<p>That small handler is a contract: IO stays at the edge, domain rules live in services, and the database is accessed through one module.</p>`,

  `<p>Postgres on Neon gives you branching that matches Git workflows. A reader should be able to open a pull request and get a database that looks like production without copying customer secrets.</p>
${paragraph("Branch per PR", "Schema-only branches are perfect for reviews. Reset-from-parent keeps long-lived staging environments honest.")}
<ul><li>Isolate risky migrations</li><li>Benchmark queries with production-shaped stats</li><li>Delete branches when the work merges</li></ul>`,

  `<p>TypeScript plus Zod is a practical defense layer for APIs. Parse once at the edge, pass typed objects inward, and let Prisma enforce relational integrity at the database.</p>
${paragraph("Validation ergonomics", "Coercion helps with query strings; strict schemas protect writes. Keep user-facing errors short and log the rest.")}`,

  `<p>Editorial systems need more than a textarea. Rich HTML from TipTap, sanitization on save, and reading-time estimates help authors and readers alike.</p>
${paragraph("Content hygiene", "Store canonical HTML, sanitize on write, and never trust client-rendered markup in feeds or emails.")}`,

  `<p>Rate limiting registration and newsletter signup is cheap insurance. In-memory limiters are fine for single-node dev; swap for Redis when you scale horizontally.</p>`,

  `<p>Authentication with Auth.js and credentials keeps onboarding simple while leaving room for OAuth providers. JWT sessions reduce database chatter for read-heavy blogs.</p>
${paragraph("Role modeling", "USER, AUTHOR, EDITOR, and ADMIN are enough to start. Enforce authorization in route handlers, not only in the UI.")}`,

  `<p>Search across articles, tags, and authors improves discoverability without standing up Elasticsearch on day one. Postgres <code>ILIKE</code> is surprisingly capable for editorial sites.</p>`,

  `<p>Featured stories deserve intentional placement, but the underlying metric should still be editorial judgment, not only page views. Combine <code>featured</code> flags with chronological ordering.</p>`,

  `<p>Newsletter growth compounds when the signup form is fast and unsubscribes are one click. Store an unsubscribe token per subscriber and honor it in every campaign tool.</p>`,

  `<p>Observability for content sites is underrated: track publish latency, failed webhooks, and background job retries. Your readers notice when comments silently stop working.</p>
${paragraph("Operational empathy", "Admin dashboards with counts for drafts, pending comments, and subscribers save support time.")}`,
];

const articleMeta = [
  {
    title: "Designing Calm API Boundaries in Next.js",
    slug: "designing-calm-api-boundaries-in-nextjs",
    excerpt:
      "How to keep route handlers thin and services testable in App Router projects.",
    featured: true,
  },
  {
    title: "Branch-First Postgres Workflows with Neon",
    slug: "branch-first-postgres-workflows-with-neon",
    excerpt: "Treat database branches like Git branches to de-risk migrations.",
    featured: true,
  },
  {
    title: "Zod at the Edge, Prisma at the Core",
    slug: "zod-at-the-edge-prisma-at-the-core",
    excerpt: "A practical validation stack for typed full-stack TypeScript.",
    featured: false,
  },
  {
    title: "Building an Editorial Pipeline with TipTap",
    slug: "building-an-editorial-pipeline-with-tiptap",
    excerpt: "Rich text, sanitization, and reading-time estimates for authors.",
    featured: false,
  },
  {
    title: "Rate Limiting Public Endpoints Without Drama",
    slug: "rate-limiting-public-endpoints-without-drama",
    excerpt: "Lightweight throttles for register and newsletter routes.",
    featured: false,
  },
  {
    title: "Auth.js Sessions for Content-Heavy Apps",
    slug: "authjs-sessions-for-content-heavy-apps",
    excerpt: "Credentials, JWT sessions, and role gates that scale with your newsroom.",
    featured: true,
  },
  {
    title: "Search That Ships Before Elasticsearch",
    slug: "search-that-ships-before-elasticsearch",
    excerpt: "Global search queries that are good enough for editorial catalogs.",
    featured: false,
  },
  {
    title: "Featured Stories Without Gaming Metrics",
    slug: "featured-stories-without-gaming-metrics",
    excerpt: "Using editorial flags alongside engagement signals.",
    featured: false,
  },
  {
    title: "Newsletter UX That Respects Readers",
    slug: "newsletter-ux-that-respects-readers",
    excerpt: "Double opt-in optional, one-click unsubscribe mandatory.",
    featured: false,
  },
  {
    title: "Operating a Blog Like a Product",
    slug: "operating-a-blog-like-a-product",
    excerpt: "Dashboards, pending comments, and publish latency as first-class metrics.",
    featured: false,
  },
];

async function main() {
  console.log("Seeding Byte Blog…");

  await prisma.articleView.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.authorFollow.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? defaultPassword,
    12,
  );
  const authorPasswordHash = await bcrypt.hash(defaultPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME ?? "Byte Admin",
      email: (process.env.ADMIN_EMAIL ?? "admin@byte.blog").toLowerCase(),
      username: (process.env.ADMIN_USERNAME ?? "byteadmin").toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
      bio: "Editor-in-chief and platform administrator for Byte Blog.",
      website: "https://byte.blog",
      github: "byteblog",
    },
  });

  const maya = await prisma.user.create({
    data: {
      name: "Maya Chen",
      email: "maya@byte.blog",
      username: "mayachen",
      passwordHash: authorPasswordHash,
      role: UserRole.AUTHOR,
      bio: "Staff writer covering frontend platforms and developer experience.",
      twitter: "mayachen",
    },
  });

  const jonah = await prisma.user.create({
    data: {
      name: "Jonah Park",
      email: "jonah@byte.blog",
      username: "jonahpark",
      passwordHash: authorPasswordHash,
      role: UserRole.AUTHOR,
      bio: "Infrastructure reporter focused on databases, deploys, and observability.",
      linkedin: "jonah-park",
    },
  });

  const reader = await prisma.user.create({
    data: {
      name: "Alex Reader",
      email: "alex@example.com",
      username: "alexreader",
      passwordHash: authorPasswordHash,
      role: UserRole.USER,
      bio: "Avid reader and weekend tinkerer.",
    },
  });

  const categories = await Promise.all(
    [
      {
        name: "Engineering",
        slug: "engineering",
        description: "Architecture, frameworks, and implementation notes.",
      },
      {
        name: "Product",
        slug: "product",
        description: "Roadmaps, editorial strategy, and reader experience.",
      },
      {
        name: "Platform",
        slug: "platform",
        description: "Infra, databases, and deployment workflows.",
      },
      {
        name: "Culture",
        slug: "culture",
        description: "Teams, process, and how we work together.",
      },
      {
        name: "Tutorials",
        slug: "tutorials",
        description: "Hands-on guides with reproducible steps.",
      },
    ].map((category) => prisma.category.create({ data: category })),
  );

  const tags = await Promise.all(
    [
      "nextjs",
      "prisma",
      "typescript",
      "postgres",
      "auth",
      "performance",
      "dx",
      "editorial",
      "security",
      "observability",
    ].map((slug) =>
      prisma.tag.create({
        data: {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
        },
      }),
    ),
  );

  const authors = [admin, maya, jonah];
  const articles = [];

  for (let i = 0; i < articleMeta.length; i += 1) {
    const meta = articleMeta[i]!;
    const publishedAt = subDays(new Date(), i + 1);
    const author = authors[i % authors.length]!;
    const category = categories[i % categories.length]!;
    const tagSlice = tags.slice(i % 3, (i % 3) + 3);

    const words = articleBodies[i]!.replace(/<[^>]*>/g, " ").split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const article = await prisma.article.create({
      data: {
        title: meta.title,
        slug: meta.slug,
        excerpt: meta.excerpt,
        content: articleBodies[i]!,
        coverImage:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        status: ArticleStatus.PUBLISHED,
        featured: meta.featured,
        readingTime,
        viewCount: 120 + i * 37,
        likeCount: 0,
        commentCount: 0,
        publishedAt,
        authorId: author.id,
        categoryId: category.id,
        tags: {
          create: tagSlice.map((tag) => ({ tagId: tag.id })),
        },
      },
    });

    articles.push(article);
  }

  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content:
          "This clarified how we should structure our upcoming App Router migration. Saving for the team wiki.",
        status: CommentStatus.APPROVED,
        articleId: articles[0]!.id,
        authorId: reader.id,
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Branch-per-PR is the missing piece in our review flow—going to prototype this on Neon next week.",
        status: CommentStatus.APPROVED,
        articleId: articles[1]!.id,
        authorId: admin.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Would love a follow-up on pooling vs direct connections.",
        status: CommentStatus.APPROVED,
        articleId: articles[1]!.id,
        authorId: maya.id,
      },
    }),
  ]);

  await prisma.article.updateMany({
    data: { commentCount: 0 },
  });

  const commentCounts = await prisma.comment.groupBy({
    by: ["articleId"],
    where: { status: CommentStatus.APPROVED },
    _count: { _all: true },
  });

  for (const row of commentCounts) {
    await prisma.article.update({
      where: { id: row.articleId },
      data: { commentCount: row._count._all },
    });
  }

  await prisma.like.createMany({
    data: [
      { userId: reader.id, articleId: articles[0]!.id },
      { userId: maya.id, articleId: articles[0]!.id },
      { userId: reader.id, articleId: articles[5]!.id },
      { userId: jonah.id, articleId: articles[2]!.id },
    ],
  });

  await prisma.article.update({
    where: { id: articles[0]!.id },
    data: { likeCount: 2 },
  });
  await prisma.article.update({
    where: { id: articles[5]!.id },
    data: { likeCount: 1 },
  });
  await prisma.article.update({
    where: { id: articles[2]!.id },
    data: { likeCount: 1 },
  });

  await prisma.bookmark.createMany({
    data: [
      { userId: reader.id, articleId: articles[3]!.id },
      { userId: reader.id, articleId: articles[6]!.id },
      { userId: admin.id, articleId: articles[4]!.id },
    ],
  });

  await prisma.authorFollow.createMany({
    data: [
      { followerId: reader.id, followingId: maya.id },
      { followerId: reader.id, followingId: jonah.id },
      { followerId: maya.id, followingId: jonah.id },
    ],
  });

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "news@example.com", isActive: true },
      { email: "digest@byte.blog", isActive: true },
      { email: "unsubscribed@example.com", isActive: false },
    ],
  });

  await prisma.articleView.createMany({
    data: articles.slice(0, 4).flatMap((article, index) =>
      Array.from({ length: 3 + index }, () => ({
        articleId: article.id,
        userId: index % 2 === 0 ? reader.id : null,
        ipHash: `seed-${article.slug}-${index}`,
      })),
    ),
  });

  console.log("Seed complete.");
  console.log({
    users: 4,
    categories: categories.length,
    tags: tags.length,
    articles: articles.length,
    comments: comments.length,
    adminLogin: {
      email: admin.email,
      username: admin.username,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });