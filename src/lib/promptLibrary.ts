export type PromptCategory = "text" | "code" | "image";

export interface PromptTemplate {
  title: string;
  prompt: string;
  tags?: string[];
}

export const promptLibrary: Record<PromptCategory, PromptTemplate[]> = {
  text: [
    { title: "Blog post intro", tags: ["blog", "marketing"], prompt: "Write an engaging 200-word introduction for a blog post about the future of remote work." },
    { title: "Product description", tags: ["marketing", "ecom"], prompt: "Write a compelling product description for a minimalist smartwatch with 14-day battery life." },
    { title: "Tweet thread", tags: ["social", "twitter"], prompt: "Write a 5-tweet thread sharing surprising productivity tips for software engineers." },
    { title: "Instagram caption", tags: ["social", "instagram"], prompt: "Write 3 catchy Instagram captions for a travel photo of a sunset on a tropical beach, including relevant hashtags." },
    { title: "LinkedIn post", tags: ["social", "linkedin"], prompt: "Write a thoughtful LinkedIn post about a lesson learned from a recent product launch failure." },
    { title: "YouTube script intro", tags: ["video", "youtube"], prompt: "Write a punchy 60-second YouTube intro script for a tech review channel covering a new flagship phone." },
    { title: "Cold email", tags: ["sales", "email"], prompt: "Write a friendly cold outreach email to a startup founder offering UX design services." },
    { title: "Newsletter section", tags: ["email", "marketing"], prompt: "Write a 'this week in AI' newsletter section summarizing 3 noteworthy releases with brief takes." },
    { title: "Story opener", tags: ["fiction", "storytelling"], prompt: "Write the opening paragraph of a sci-fi short story set on a colony orbiting Jupiter." },
    { title: "Character bio", tags: ["fiction", "storytelling"], prompt: "Write a vivid 150-word character bio for a morally grey detective in a noir-fantasy setting." },
    { title: "Meeting summary", tags: ["work", "summary"], prompt: "Summarize the key points and action items from a product strategy meeting about Q2 priorities." },
    { title: "Ad copy (Meta)", tags: ["ads", "marketing"], prompt: "Write 3 variations of Meta ad copy for a fitness app targeting busy professionals — 25 words max each." },
  ],
  code: [
    { title: "REST API endpoint", tags: ["backend", "api"], prompt: "Write a REST API endpoint that returns a paginated list of users with filtering by status." },
    { title: "Debounce hook", tags: ["react", "utility"], prompt: "Write a reusable debounce React hook with an example of how to use it." },
    { title: "Sorting algorithm", tags: ["algorithm"], prompt: "Implement merge sort with clear comments explaining each step." },
    { title: "CSV parser", tags: ["utility", "parser"], prompt: "Write a function that parses a CSV string into an array of objects, handling quoted fields." },
    { title: "Auth middleware", tags: ["backend", "auth"], prompt: "Write JWT authentication middleware that validates tokens and attaches the user to the request." },
    { title: "Binary search tree", tags: ["algorithm", "data structures"], prompt: "Implement a binary search tree with insert, search, and in-order traversal methods." },
    { title: "Rate limiter", tags: ["backend", "utility"], prompt: "Implement a sliding-window rate limiter with configurable requests per window." },
    { title: "WebSocket chat", tags: ["realtime", "backend"], prompt: "Write a minimal WebSocket chat server that broadcasts messages to all connected clients." },
    { title: "SQL query", tags: ["sql", "database"], prompt: "Write a SQL query that returns the top 5 customers by total revenue in the last 90 days, with a running total column." },
    { title: "Form validation", tags: ["frontend", "form"], prompt: "Write a TypeScript form validation utility with required, email, and minLength rules and clear error messages." },
  ],
  image: [
    { title: "Cyberpunk city", tags: ["scene", "cyberpunk"], prompt: "A neon-lit cyberpunk city street at night, rain-soaked pavement reflecting purple and pink lights, towering holographic billboards" },
    { title: "Mountain sunrise", tags: ["landscape", "nature"], prompt: "A serene mountain landscape at sunrise, mist rolling through pine forests, golden light catching the snow-capped peaks" },
    { title: "Astronaut on moon", tags: ["space", "scene"], prompt: "An astronaut sitting on a lunar rock gazing at Earth in the distance, cinematic lighting, ultra detailed spacesuit" },
    { title: "Cozy cafe", tags: ["interior", "cozy"], prompt: "A cozy autumn cafe interior, warm amber lighting, wooden tables, steaming coffee cup by a rain-streaked window" },
    { title: "Dragon in cave", tags: ["fantasy", "creature"], prompt: "A massive ancient dragon curled around piles of gold inside a vast crystalline cave, dramatic lighting" },
    { title: "Underwater ruins", tags: ["fantasy", "underwater"], prompt: "Mysterious underwater ruins of an ancient civilization, schools of colorful fish, shafts of sunlight piercing the deep blue" },
    { title: "Portrait — character", tags: ["portrait", "character"], prompt: "Cinematic close-up portrait of a weathered explorer with piercing eyes, soft rim light, shallow depth of field" },
    { title: "Product shot", tags: ["product", "studio"], prompt: "Studio product shot of a luxury perfume bottle on a marble surface, soft top light, glossy reflections, minimal background" },
    { title: "Anime hero pose", tags: ["anime", "character"], prompt: "Anime-style hero standing on a rooftop at dusk, wind-blown coat, dramatic sky behind, expressive eyes" },
    { title: "Watercolor landscape", tags: ["painting", "landscape"], prompt: "Soft watercolor painting of a Tuscan countryside with rolling hills, cypress trees and a winding road" },
  ],
};

export const programmingLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "SQL",
  "Bash",
] as const;

export type ProgrammingLanguage = typeof programmingLanguages[number];
