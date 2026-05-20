export interface Business {
  name: string;
  role: string;
  description: string;
  link: string;
  products: string[];
  duration?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  key_projects: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Identity {
  name: string;
  role: string;
  tagline: string;
  bio: string;
}

export interface Personality {
  traits: string[];
  leadership_style: string;
  decision_style: string;
  tone: string;
  archetype: string;
  values: string[];
}

export interface Story {
  mission: string;
  impact: string;
  themes: string[];
}

export interface Networking {
  audience: string;
  intent: string;
  boundaries: string[];
}

export interface Links {
  linkedin: string;
  website: string;
  portfolio: string;
  socials: string[];
}

export interface DigitalTwinProfile {
  identity: Identity;
  businesses: Business[];
  experience: Experience[];
  education: Education[];
 skills: {
  list: string[];
  coreDomains: string;
  signatureStrengths: string;
};

  personality: Personality;
  story: Story;
  networking: Networking;
  links: Links;

  // Server-assigned fields. Present on every response from
  // /api/digital-twin/{get,list,create}; absent on the in-memory form
  // state inside the wizard before save. Marked optional so a freshly
  // initialized INITIAL_DATA satisfies the type.
  _id?: string;
  isActive?: boolean;
  createdAt?: string;
  lastUpdated?: string;
  updatedAt?: string;
}
