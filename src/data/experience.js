import amazon from '../assets/organizations/amazon.png'
import northeastern from '../assets/organizations/northeastern.png'

// Ordered by portfolio relevance; dates and roles follow Joe’s supplied résumé.
export const experience = [
  {
    id: 'amazon',
    organization: 'Amazon',
    logo: amazon,
    role: 'Software Development Engineer Intern',
    dates: 'Jun–Aug 2026',
    summary: 'Built systems that helped a voice assistant gather context earlier and respond faster, while keeping slow or unavailable data sources from blocking requests.',
  },
  {
    id: 'visual-intelligence-lab',
    organization: 'Visual Intelligence Lab',
    affiliation: 'Northeastern University',
    logo: northeastern,
    role: 'Undergraduate Research Assistant',
    dates: 'Mar 2026–Present',
    summary: 'Building a synthetic data pipeline for relighting research, using varied lighting and camera views to generate training images and scaling rendering across Northeastern’s GPU cluster.',
  },
  {
    id: 'teaching-assistant',
    organization: 'Northeastern University',
    logo: northeastern,
    role: 'Teaching Assistant',
    dates: 'Sep–Dec 2026',
    summary: 'Teaching assistant for DS4400: Machine Learning and Data Mining 1, a course on supervised and unsupervised learning, predictive modeling, and evaluating models with Python and R.',
  },
  {
    id: 'physical-ai',
    organization: 'Physical AI Team',
    affiliation: 'Northeastern AI Club',
    logo: northeastern,
    role: 'Member of Technical Staff',
    dates: 'Sep 2026–Present',
    summary: 'Working on some cool stuff with the orcahand v2.',
  },
]
