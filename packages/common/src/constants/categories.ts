export const SERVICE_CATEGORIES = [
  'document-analysis',
  'code-generation',
  'code-review',
  'data-analysis',
  'translation',
  'content-creation',
  'image-generation',
  'research',
  'customer-support',
  'financial-analysis',
  'legal-analysis',
  'medical-analysis',
  'education',
  'creative-writing',
  'summarization',
  'general',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  'document-analysis': 'Document parsing, extraction, and analysis',
  'code-generation': 'Source code generation and scaffolding',
  'code-review': 'Code review, bug detection, and optimization',
  'data-analysis': 'Data processing, statistics, and visualization',
  'translation': 'Language translation and localization',
  'content-creation': 'Blog posts, articles, marketing copy',
  'image-generation': 'AI image generation and editing',
  'research': 'Research, fact-checking, and information gathering',
  'customer-support': 'Customer service and support automation',
  'financial-analysis': 'Financial modeling and analysis',
  'legal-analysis': 'Legal document review and analysis',
  'medical-analysis': 'Medical data analysis (non-diagnostic)',
  'education': 'Tutoring, course creation, educational content',
  'creative-writing': 'Fiction, poetry, screenwriting',
  'summarization': 'Text summarization and key point extraction',
  'general': 'General-purpose AI agent tasks',
};
