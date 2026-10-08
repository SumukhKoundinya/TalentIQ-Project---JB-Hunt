const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const views = fs.readFileSync(path.join(root, 'views.js'), 'utf8');

assert(!/<section class="topbar"/.test(html), 'shared shell has no page-level title/header region');
assert(!/id="globalSearchWrap"|id="pageTitle"|class="breadcrumb"/.test(html), 'shared shell has no global search, title or breadcrumb');
assert(/<aside class="sidebar"[\s\S]*?class="recruiter-picker"/.test(html), 'recruiter selection lives in the sidebar');
assert(/<span class="brand-title"><span class="brand-title__talent">Talent<\/span><span class="brand-title__iq">IQ<\/span><\/span>/.test(html), 'sidebar branding uses TalentIQ wordmark');
assert(/\.brand-title__talent\s*\{[^}]*color:\s*(?:var\(--jbh-dark-sidebar\)|#(?:211F20|211f20))/.test(css), 'Talent wordmark uses the JB Hunt black');
assert(/\.brand-title__iq\s*\{[^}]*color:\s*var\(--jbh-yellow-accent\)/.test(css), 'IQ wordmark uses JB Hunt yellow');
assert(!/getElementById\("pageTitle"\)|globalSearchWrap/.test(app), 'router does not depend on removed shared header controls');
assert(/id="view-overview"[\s\S]*?<h1 class="view-title">Event Results<\/h1>/.test(views), 'Event Results keeps its useful content heading');
assert(/id="view-metrics"[\s\S]*?<h1 class="view-title">Research Metrics<\/h1>/.test(views), 'Research Metrics keeps its useful content heading');
assert(/\.main-content\s*\{[^}]*padding:\s*24px\s+var\(--app-gutter\)/s.test(css), 'main content uses shared 24px+ outer spacing');
assert(!/calc\(100dvh\s*-\s*var\(--header-height\)\)/.test(css), 'view height does not reserve a removed header strip');
console.log('Shared shell contract: all checks passed');
