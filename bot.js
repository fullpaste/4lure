const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ============================================================
// YOUR SCENE PACK DATABASE — ADD YOUR OWN PACKS HERE
// ============================================================
const scenePacks = [
  {
    category: "Star Wars Franchise",
    name: "Darth Vader – All Episodes [4K]",
    url: "https://yourlink.com/darth-vader-4k",
    tags: ["star wars", "darth vader", "4k", "franchise", "sci fi"],
    creator: "parallel.scps",
  },
  {
    category: "Marvel",
    name: "Iron Man – All Movies [4K]",
    url: "https://yourlink.com/ironman-4k",
    tags: ["marvel", "iron man", "tony stark", "4k", "superhero"],
    creator: "4lure.scps",
  },
  {
    category: "Anime",
    name: "Attack on Titan – Season 4 [1080p]",
    url: "https://yourlink.com/aot-s4",
    tags: ["anime", "attack on titan", "aot", "eren", "1080p"],
    creator: "4lure.scps",
  },
  {
    category: "DC",
    name: "Batman – The Dark Knight Trilogy [4K]",
    url: "https://yourlink.com/batman-4k",
    tags: ["dc", "batman", "dark knight", "4k", "superhero"],
    creator: "4lure.scps",
  },
  // ✏️ ADD MORE PACKS BELOW IN THE SAME FORMAT:
  // {
  //   category: "Category Name",
  //   name: "Pack Name [Quality]",
  //   url: "https://your-download-link.com",
  //   tags: ["keyword1", "keyword2"],
  //   creator: "yourcredit.scps",
  // },
];
// ============================================================

const PREFIX = "4lure";

client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  client.user.setActivity("4lure lookup {value}", { type: 3 }); // "Watching"
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  // Trigger: "4lure lookup {query}"
  if (!content.startsWith(`${PREFIX} lookup `)) return;

  const query = message.content.slice(`${PREFIX} lookup `.length).trim();

  if (!query) {
    return message.reply(
      "❓ Please provide a search term. Example: `4lure lookup star wars`"
    );
  }

  const queryLower = query.toLowerCase();

  // Search packs by tags, name, and category
  const results = scenePacks.filter((pack) => {
    const inTags = pack.tags.some((tag) => tag.includes(queryLower) || queryLower.includes(tag));
    const inName = pack.name.toLowerCase().includes(queryLower);
    const inCategory = pack.category.toLowerCase().includes(queryLower);
    return inTags || inName || inCategory;
  });

  // Group results by category
  const grouped = {};
  for (const pack of results) {
    if (!grouped[pack.category]) grouped[pack.category] = [];
    grouped[pack.category].push(pack);
  }

  // Build embed
  const embed = new EmbedBuilder()
    .setColor(results.length > 0 ? 0x5865f2 : 0xff4444)
    .setAuthor({
      name: "4lure Bot",
      iconURL: message.guild?.iconURL() ?? undefined,
    })
    .setFooter({
      text: "4lure Cloud • Safe Search Active",
      iconURL:
        "https://cdn.discordapp.com/emojis/1059491862357405696.webp?size=96",
    })
    .setTimestamp();

  // Breadcrumb path
  const breadcrumb = `HOME › LOOKUP › ${query.toUpperCase()}`;

  if (results.length === 0) {
    embed
      .setTitle(breadcrumb)
      .setDescription(
        `**Found 0 results**\n\n⚠️ No scene packs matched **"${query}"**.\nTry a different keyword!`
      );
  } else {
    let description = `**Found ${results.length} result${results.length !== 1 ? "s" : ""}**\n`;
    description += `⚠️ **Reminder:** Give credit to the scenepack owners when using these clips.\n\n`;

    for (const [category, packs] of Object.entries(grouped)) {
      description += `📁 **${category}**\n`;
      for (const pack of packs) {
        description += `┃ 🎬 • [${pack.name}](${pack.url})\n`;
      }
      description += "\n";
    }

    embed.setTitle(breadcrumb).setDescription(description);
  }

  // Send as reply in same channel, styled like the screenshot
  await message.channel.send({ embeds: [embed] });
});

// Login with your bot token
client.login(process.env.DISCORD_TOKEN);
