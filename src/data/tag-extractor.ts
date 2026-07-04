/** Alias map: normalize keywords → canonical tag */
const TAG_ALIASES: Record<string, string> = {
  // AI
  ia: "AI",
  ai: "AI",
  llm: "AI",
  "intelligence artificielle": "AI",
  "machine learning": "AI",
  ml: "AI",
  "code-assist": "AI",
  codeassist: "AI",
  "code assistant": "AI",
  vibecoding: "AI",
  copilot: "AI",
  prompt: "AI",
  // Security
  security: "Security",
  sécurité: "Security",
  xdr: "Security",
  siem: "Security",
  edr: "Security",
  vulnerability: "Security",
  // DevOps
  devops: "DevOps",
  k8s: "DevOps",
  kubernetes: "DevOps",
  docker: "DevOps",
  dockerfile: "DevOps",
  infrastructure: "DevOps",
  iac: "DevOps",
  dora: "DevOps",
  terraform: "DevOps",
  // Open Source
  oss: "Open Source",
  "open-source": "Open Source",
  "open source": "Open Source",
  opensource: "Open Source",
  // Web / Frontend
  frontend: "Web",
  web: "Web",
  css: "Web",
  js: "Web",
  animation: "Web",
  design: "Web",
  // Green IT
  green: "Green IT",
  greenit: "Green IT",
  ecoconception: "Green IT",
  "écoconception": "Green IT",
  "numerique responsable": "Green IT",
  empreinte: "Green IT",
  // API
  api: "API",
  openapi: "API",
  // Git
  git: "Git",
  github: "Git",
  // Testing
  test: "Testing",
  benchmark: "Testing",
  testing: "Testing",
  // Data
  data: "Data",
  sql: "Data",
  // Tools
  tool: "Tools",
  tools: "Tools",
  outils: "Tools",
  cli: "Tools",
  ide: "Tools",
  // Cloud
  cloud: "Cloud",
  // Documentation
  docs: "Documentation",
  documentation: "Documentation",
  docusaurus: "Documentation",
  slides: "Documentation",
  blog: "Documentation",
  // Languages
  language: "Languages",
  rust: "Languages",
  java: "Languages",
  typescript: "Languages",
  // Collaboration
  collaborative: "Collaboration",
  chat: "Collaboration",
  social: "Collaboration",
  // Training
  training: "Training",
  courses: "Training",
};

const STOPWORDS = new Set([
  "le", "la", "les", "de", "du", "des", "un", "une",
  "et", "ou", "en", "pour", "par", "avec", "qui", "que",
  "dans", "sur", "il", "a", "fait", "même", "son", "ses",
  "the", "is", "are", "an", "to", "of", "and", "for",
  "in", "on", "with", "your", "all", "you", "should",
  "why", "how", "what", "from", "but", "it", "this",
  "that", "not", "or", "its", "has", "was", "be", "by",
  "at", "more", "also", "can", "been", "have", "their",
  "très", "plus", "mais", "aussi", "faire", "comme",
  "peut", "être", "permet", "utiliser", "lien", "article",
  "réduire", "using", "open", "source",
]);

export function extractTags(subject: string): string[] {
  const lower = subject.toLowerCase();
  const found = new Set<string>();

  // First pass: check multi-word aliases
  for (const [alias, tag] of Object.entries(TAG_ALIASES)) {
    if (alias.includes(" ") && lower.includes(alias)) {
      found.add(tag);
    }
  }

  // Second pass: check single-word aliases
  const words = lower
    .replace(/[^a-zà-ÿ0-9\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  for (const word of words) {
    const tag = TAG_ALIASES[word];
    if (tag) found.add(tag);
  }

  // If no tags found from a long subject, mark as "Other"
  if (found.size === 0) {
    found.add("Other");
  }

  return Array.from(found).sort();
}

export function getAllTags(subjects: string[]): string[] {
  const tagSet = new Set<string>();
  for (const subject of subjects) {
    for (const tag of extractTags(subject)) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
