/* ============================================
   TalentIQ — Skill Icon Registry
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.SKILL_ICON_BASE = 'assets/skill-icons/';
TIQ.SKILL_ICON_TILE_SIZE = 30;
TIQ.SKILL_ICON_ART_SIZE = 22;

TIQ.SKILL_ICON_RENDERABLE = {
  python: 1,
  java: 1,
  javascript: 1,
  typescript: 1,
  cpp: 1,
  csharp: 1,
  html: 1,
  css: 1,
  react: 1,
  nodejs: 1,
  excel: 1,
  aws: 1,
  docker: 1,
  git: 1,
  linux: 1,
  mongodb: 1,
  postgresql: 1,
  powerbi: 1,
  tableau: 1,
  azure: 1,
  gcp: 1,
  kubernetes: 1,
  angular: 1,
  vue: 1,
  nextjs: 1,
  django: 1,
  flask: 1,
  tensorflow: 1,
  pytorch: 1,
  pandas: 1,
  jupyter: 1,
  figma: 1,
  jira: 1,
  sap: 1,
  salesforce: 1,
  selenium: 1,
  tailwindcss: 1,
  bootstrap: 1,
  redis: 1,
  go: 1,
  rust: 1,
  php: 1,
  swift: 1,
  kotlin: 1,
  ansible: 1,
  terraform: 1,
  jenkins: 1,
  scikitlearn: 1,
  mathworks: 1,
  github: 1,
  gitlab: 1,
  bitbucket: 1,
  powerpoint: 1
};

TIQ.SKILL_ICON_AVAILABLE = {
  python: 1,
  java: 1,
  javascript: 1,
  typescript: 1,
  cpp: 1,
  csharp: 1,
  sql: 1,
  html: 1,
  css: 1,
  react: 1,
  nodejs: 1,
  excel: 1,
  aws: 1,
  docker: 1,
  git: 1,
  linux: 1,
  mongodb: 1,
  postgresql: 1,
  powerbi: 1,
  tableau: 1,
  azure: 1,
  gcp: 1,
  kubernetes: 1,
  angular: 1,
  vue: 1,
  nextjs: 1,
  django: 1,
  flask: 1,
  tensorflow: 1,
  pytorch: 1,
  pandas: 1,
  jupyter: 1,
  figma: 1,
  jira: 1,
  sap: 1,
  salesforce: 1,
  selenium: 1,
  tailwindcss: 1,
  bootstrap: 1,
  redis: 1,
  go: 1,
  rust: 1,
  php: 1,
  swift: 1,
  kotlin: 1,
  ansible: 1,
  terraform: 1,
  jenkins: 1,
  scikitlearn: 1,
  mathworks: 1,
  api: 1,
  datavisualization: 1,
  forecasting: 1,
  powerpoint: 1,
  supplychain: 1,
  logistics: 1,
  operations: 1,
  optimization: 1,
  projectmanagement: 1,
  leadership: 1,
  communication: 1,
  teamwork: 1,
  problemsolving: 1,
  analytics: 1,
  github: 1,
  gitlab: 1,
  bitbucket: 1
};

TIQ.SKILL_ICON_PALETTE = [
  '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626',
  '#0EA5E9', '#8B5CF6', '#16A34A', '#EA580C', '#DB2777',
  '#0F766E', '#4F46E5'
];

TIQ.SKILL_ICON_ALIASES = {
  'python': 'python',
  'java': 'java',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'c++': 'cpp',
  'cplusplus': 'cpp',
  'c#': 'csharp',
  'csharp': 'csharp',
  'sql': 'sql',
  'html': 'html',
  'css': 'css',
  'react': 'react',
  'node.js': 'nodejs',
  'nodejs': 'nodejs',
  'node': 'nodejs',
  'excel': 'excel',
  'powerpoint': 'powerpoint',
  'power point': 'powerpoint',
  'presentation': 'powerpoint',
  'presentations': 'powerpoint',
  'aws': 'aws',
  'amazon web services': 'aws',
  'amazonwebservices': 'aws',
  'azure': 'azure',
  'microsoft azure': 'azure',
  'microsoftazure': 'azure',
  'power bi': 'powerbi',
  'powerbi': 'powerbi',
  'tableau': 'tableau',
  'api': 'api',
  'apis': 'api',
  'rest api': 'api',
  'rest': 'api',
  'graphql': 'api',
  'websocket': 'api',
  'soap': 'api',
  'data visualization': 'datavisualization',
  'data visualisation': 'datavisualization',
  'visualization': 'datavisualization',
  'visualisation': 'datavisualization',
  'dashboard': 'datavisualization',
  'dashboards': 'datavisualization',
  'analytics': 'analytics',
  'forecasting': 'forecasting',
  'supply chain': 'supplychain',
  'logistics': 'logistics',
  'transportation': 'supplychain',
  'fleet management': 'supplychain',
  'warehouse': 'supplychain',
  'freight': 'supplychain',
  'operations': 'operations',
  'optimization': 'optimization',
  'process improvement': 'optimization',
  'process mapping': 'projectmanagement',
  'project management': 'projectmanagement',
  'leadership': 'leadership',
  'communication': 'communication',
  'teamwork': 'teamwork',
  'collaboration': 'teamwork',
  'problem solving': 'problemsolving',
  'critical thinking': 'problemsolving',
  'salesforce': 'salesforce',
  'oracle': 'oracle',
  'matlab': 'mathworks',
  'mathworks': 'mathworks',
  'docker': 'docker',
  'git': 'git',
  'linux': 'linux',
  'mongodb': 'mongodb',
  'postgresql': 'postgresql',
  'gcp': 'gcp',
  'google cloud': 'gcp',
  'googlecloud': 'gcp',
  'kubernetes': 'kubernetes',
  'angular': 'angular',
  'vue': 'vue',
  'vue.js': 'vue',
  'vuedotjs': 'vue',
  'next.js': 'nextjs',
  'nextjs': 'nextjs',
  'nextdotjs': 'nextjs',
  'django': 'django',
  'flask': 'flask',
  'tensorflow': 'tensorflow',
  'pytorch': 'pytorch',
  'pandas': 'pandas',
  'jupyter': 'jupyter',
  'figma': 'figma',
  'jira': 'jira',
  'sap': 'sap',
  'salesforce': 'salesforce',
  'selenium': 'selenium',
  'tailwind': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  'bootstrap': 'bootstrap',
  'redis': 'redis',
  'go': 'go',
  'rust': 'rust',
  'php': 'php',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'oracle': 'oracle',
  'ansible': 'ansible',
  'terraform': 'terraform',
  'jenkins': 'jenkins',
  'scikit-learn': 'scikitlearn',
  'scikitlearn': 'scikitlearn',
  'openai': 'openai',
  'github': 'github',
  'gitlab': 'gitlab',
  'bitbucket': 'bitbucket'
};

TIQ.skillIconKey = function(skill) {
  var raw = String(skill == null ? '' : skill).toLowerCase().trim();
  if (!raw) return '';
  if (TIQ.SKILL_ICON_ALIASES[raw]) return TIQ.SKILL_ICON_ALIASES[raw];

  var norm = raw
    .replace(/\+\+/g, 'pp')
    .replace(/#/g, 'sharp')
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();

  norm = norm.replace(/\s+/g, '');
  if (TIQ.SKILL_ICON_ALIASES[norm]) return TIQ.SKILL_ICON_ALIASES[norm];
  return norm;
};

TIQ.skillIconPath = function(skill) {
  var key = TIQ.skillIconKey(skill);
  return key && TIQ.SKILL_ICON_RENDERABLE[key] && TIQ.SKILL_ICON_AVAILABLE[key] ? TIQ.SKILL_ICON_BASE + key + '.svg' : '';
};

TIQ.skillMonogram = function(skill) {
  var raw = String(skill == null ? '' : skill).replace(/\s+/g, ' ').trim();
  if (!raw) return '?';
  var parts = raw.split(/\s+/);
  if (parts.length === 1) {
    var cleaned = parts[0].replace(/[^A-Za-z0-9+]/g, '');
    if (cleaned.length <= 3) return cleaned.toUpperCase();
    return cleaned.slice(0, 2).toUpperCase();
  }
  return parts.slice(0, 2).map(function(part) {
    return (part[0] || '').toUpperCase();
  }).join('');
};

TIQ.renderSkillIconTile = function(skill) {
  var label = String(skill == null ? '' : skill).replace(/\s+/g, ' ').trim();
  if (!label) return '';
  var path = TIQ.skillIconPath(label);
  var title = TIQ.escapeAttr(label);
  var text = TIQ.escapeHtml(label);
  var monogram = TIQ.escapeHtml(TIQ.skillMonogram(label));
  if (path) {
    return '<span class="skill-icon-tile" title="' + title + '" aria-label="' + title + '">' +
      '<img class="skill-icon-tile__img" src="' + TIQ.escapeAttr(path) + '" alt="" aria-hidden="true" loading="lazy" decoding="async" />' +
      '<span class="sr-only">' + text + '</span>' +
    '</span>';
  }
  return '<span class="skill-pill" title="' + title + '" aria-label="' + title + '">' + text + '</span>';
};

TIQ.renderSkillTile = TIQ.renderSkillIconTile;
