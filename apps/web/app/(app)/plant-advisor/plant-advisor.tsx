"use client"

import { useState } from "react"

type Season = "Spring" | "Summer" | "Autumn" | "Winter"
type Sunlight = "Full sun" | "Partial sun" | "Shade"
type Style = "Tropical" | "Minimal" | "Colourful" | "Native" | "Edible"
type Maintenance = "Low" | "Medium" | "High"

type Plant = {
  name: string
  scientific: string
  seasons: Season[]
  sunlight: Sunlight
  style: Style
  maintenance: Maintenance
  description: string
  emoji: string
}

const PLANTS: Plant[] = [
  {
    name: "Cherry Blossom",
    scientific: "Prunus serrulata",
    seasons: ["Spring"],
    sunlight: "Full sun",
    style: "Colourful",
    maintenance: "Low",
    description: "Iconic spring bloomer with delicate pink flowers. Perfect as a centrepiece in garden beds or entranceways.",
    emoji: "🌸",
  },
  {
    name: "Lavender",
    scientific: "Lavandula angustifolia",
    seasons: ["Spring", "Summer"],
    sunlight: "Full sun",
    style: "Minimal",
    maintenance: "Low",
    description: "Fragrant purple spikes that attract pollinators. Thrives in dry, sunny spots with good drainage.",
    emoji: "💜",
  },
  {
    name: "Peony",
    scientific: "Paeonia lactiflora",
    seasons: ["Spring"],
    sunlight: "Partial sun",
    style: "Colourful",
    maintenance: "Medium",
    description: "Lush, fragrant blooms in shades of pink and white. Long-lived perennial that rewards minimal pruning.",
    emoji: "🌺",
  },
  {
    name: "Tulip",
    scientific: "Tulipa gesneriana",
    seasons: ["Spring"],
    sunlight: "Full sun",
    style: "Colourful",
    maintenance: "Low",
    description: "Classic spring bulb available in nearly every colour. Plant in autumn for a stunning spring display.",
    emoji: "🌷",
  },
  {
    name: "Sunflower",
    scientific: "Helianthus annuus",
    seasons: ["Summer"],
    sunlight: "Full sun",
    style: "Colourful",
    maintenance: "Low",
    description: "Bold, cheerful blooms that track the sun. Fast-growing annual perfect for borders and cut flower gardens.",
    emoji: "🌻",
  },
  {
    name: "Hibiscus",
    scientific: "Hibiscus rosa-sinensis",
    seasons: ["Summer"],
    sunlight: "Full sun",
    style: "Tropical",
    maintenance: "Medium",
    description: "Large showy flowers in tropical hues. Thrives in heat and humidity, making it ideal for warm climates.",
    emoji: "🌺",
  },
  {
    name: "Bougainvillea",
    scientific: "Bougainvillea spectabilis",
    seasons: ["Summer"],
    sunlight: "Full sun",
    style: "Tropical",
    maintenance: "Low",
    description: "Vigorous climber with vivid papery bracts. Drought-tolerant once established and spectacular on walls or pergolas.",
    emoji: "🪻",
  },
  {
    name: "Basil",
    scientific: "Ocimum basilicum",
    seasons: ["Summer"],
    sunlight: "Full sun",
    style: "Edible",
    maintenance: "Medium",
    description: "Aromatic culinary herb with vibrant green leaves. Grows quickly in warm weather; pinch flowers to extend harvest.",
    emoji: "🌿",
  },
  {
    name: "Tomato",
    scientific: "Solanum lycopersicum",
    seasons: ["Summer"],
    sunlight: "Full sun",
    style: "Edible",
    maintenance: "High",
    description: "Productive fruiting plant that rewards regular watering and staking. Works in beds, raised planters, or large pots.",
    emoji: "🍅",
  },
  {
    name: "Japanese Maple",
    scientific: "Acer palmatum",
    seasons: ["Autumn"],
    sunlight: "Partial sun",
    style: "Minimal",
    maintenance: "Low",
    description: "Elegant tree with finely cut leaves that turn fiery red in autumn. Stunning focal point for Japanese-inspired gardens.",
    emoji: "🍁",
  },
  {
    name: "Chrysanthemum",
    scientific: "Chrysanthemum × morifolium",
    seasons: ["Autumn"],
    sunlight: "Full sun",
    style: "Colourful",
    maintenance: "Medium",
    description: "Prolific autumn bloomer in warm golds, oranges, and reds. Excellent for seasonal container displays.",
    emoji: "🌼",
  },
  {
    name: "Ornamental Kale",
    scientific: "Brassica oleracea",
    seasons: ["Autumn", "Winter"],
    sunlight: "Full sun",
    style: "Minimal",
    maintenance: "Low",
    description: "Rosette foliage in deep purples and creamy whites. Cold-hardy and adds dramatic texture to winter displays.",
    emoji: "🥬",
  },
  {
    name: "Pumpkin",
    scientific: "Cucurbita pepo",
    seasons: ["Autumn"],
    sunlight: "Full sun",
    style: "Edible",
    maintenance: "Medium",
    description: "Sprawling vine with decorative fruit in rich orange hues. Needs space and consistent moisture to thrive.",
    emoji: "🎃",
  },
  {
    name: "Holly",
    scientific: "Ilex aquifolium",
    seasons: ["Winter"],
    sunlight: "Partial sun",
    style: "Native",
    maintenance: "Low",
    description: "Glossy evergreen with bright red berries through winter. Provides shelter for birds and year-round structure.",
    emoji: "🫐",
  },
  {
    name: "Cyclamen",
    scientific: "Cyclamen persicum",
    seasons: ["Winter"],
    sunlight: "Shade",
    style: "Colourful",
    maintenance: "Medium",
    description: "Delicate upswept flowers in pinks and whites that brighten shaded winter spots. Perfect for indoor displays too.",
    emoji: "🌸",
  },
  {
    name: "Hellebore",
    scientific: "Helleborus orientalis",
    seasons: ["Winter", "Spring"],
    sunlight: "Shade",
    style: "Minimal",
    maintenance: "Low",
    description: "Nodding flowers in muted purples and creams that bloom in the coldest months. Thrives under deciduous trees.",
    emoji: "🌾",
  },
  {
    name: "Snake Plant",
    scientific: "Sansevieria trifasciata",
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    sunlight: "Shade",
    style: "Minimal",
    maintenance: "Low",
    description: "Architectural upright leaves with striking banding. Extremely tolerant of neglect and low light — ideal for indoors.",
    emoji: "🪴",
  },
  {
    name: "Rosemary",
    scientific: "Salvia rosmarinus",
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    sunlight: "Full sun",
    style: "Edible",
    maintenance: "Low",
    description: "Hardy evergreen herb with aromatic needle-like leaves. Drought-tolerant and doubles as a fragrant garden hedge.",
    emoji: "🌿",
  },
]

const SEASONS: { label: Season | "All"; emoji: string }[] = [
  { label: "All",    emoji: "🌍" },
  { label: "Spring", emoji: "🌱" },
  { label: "Summer", emoji: "☀️" },
  { label: "Autumn", emoji: "🍂" },
  { label: "Winter", emoji: "❄️" },
]

const SEASON_GRADIENT: Record<Season, string> = {
  Spring: "from-pink-100 to-green-100",
  Summer: "from-yellow-100 to-orange-100",
  Autumn: "from-orange-100 to-red-100",
  Winter: "from-blue-100 to-slate-100",
}

const SUNLIGHT_CONFIG: Record<Sunlight, { icon: string; color: string }> = {
  "Full sun":     { icon: "☀️", color: "bg-yellow-100 text-yellow-800" },
  "Partial sun":  { icon: "⛅", color: "bg-amber-100 text-amber-800"  },
  "Shade":        { icon: "🌥️", color: "bg-slate-100 text-slate-700"  },
}

const MAINTENANCE_CONFIG: Record<Maintenance, { color: string }> = {
  Low:    { color: "bg-vg-green-light text-vg-green-dark" },
  Medium: { color: "bg-yellow-100 text-yellow-800"        },
  High:   { color: "bg-red-100 text-red-700"              },
}

const STYLE_CONFIG: Record<Style, { color: string }> = {
  Tropical:  { color: "bg-teal-100 text-teal-800"    },
  Minimal:   { color: "bg-slate-100 text-slate-700"  },
  Colourful: { color: "bg-purple-100 text-purple-800"},
  Native:    { color: "bg-lime-100 text-lime-800"    },
  Edible:    { color: "bg-green-100 text-green-800"  },
}

export function PlantCatalog() {
  const [activeSeason, setActiveSeason] = useState<Season | "All">("All")

  const filtered =
    activeSeason === "All"
      ? PLANTS
      : PLANTS.filter((p) => p.seasons.includes(activeSeason as Season))

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Plant Catalogue</h1>
        <p className="mt-1 text-base text-vg-body">Browse plants by season and find the right match for your space.</p>
      </div>

      {/* Season tabs */}
      <div className="flex flex-wrap gap-2">
        {SEASONS.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => setActiveSeason(label)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeSeason === label
                ? "bg-vg-green-dark text-white border-vg-green-dark shadow-sm"
                : "bg-white text-vg-body border-vg-border hover:bg-vg-bg-accent"
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-vg-muted -mt-4">
        Showing <span className="font-semibold text-vg-body">{filtered.length}</span> plant{filtered.length !== 1 ? "s" : ""}
        {activeSeason !== "All" && ` for ${activeSeason}`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((plant) => {
          const primarySeason = plant.seasons[0]
          const gradient = SEASON_GRADIENT[primarySeason]
          const sunCfg  = SUNLIGHT_CONFIG[plant.sunlight]
          const mainCfg = MAINTENANCE_CONFIG[plant.maintenance]
          const stylCfg = STYLE_CONFIG[plant.style]

          return (
            <div
              key={plant.name}
              className="bg-white border border-vg-border rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              {/* Photo area */}
              <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center h-36 relative`}>
                <span className="text-6xl select-none">{plant.emoji}</span>
                {/* Season badge */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {plant.seasons.map((s) => (
                    <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-sm text-vg-body">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="font-bold text-vg-heading text-base leading-tight">{plant.name}</p>
                  <p className="text-xs text-vg-muted italic mt-0.5">{plant.scientific}</p>
                </div>

                <p className="text-sm text-vg-body leading-relaxed flex-1">{plant.description}</p>

                {/* Attribute pills */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-vg-border">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${sunCfg.color}`}>
                    <span>{sunCfg.icon}</span>
                    {plant.sunlight}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${stylCfg.color}`}>
                    🎨 {plant.style}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${mainCfg.color}`}>
                    🔧 {plant.maintenance} care
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
