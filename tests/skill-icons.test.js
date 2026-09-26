const { loadApp, assert } = require('./harness');
const fs = require('fs');
const path = require('path');

function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js']);

  assert(TIQ.skillIconPath('Java') === 'assets/skill-icons/java.svg', 'new batch icon resolves to local asset');
  assert(TIQ.skillIconPath('Python') === 'assets/skill-icons/python.svg', 'known icon resolves to local asset');
  assert(TIQ.skillIconPath('Excel') === 'assets/skill-icons/excel.svg', 'Excel resolves to a local asset');
  assert(TIQ.skillIconPath('PowerPoint') === 'assets/skill-icons/powerpoint.svg', 'PowerPoint resolves to a local asset');
  assert(TIQ.skillIconPath('Logistics') === '', 'logistics stays a readable pill');
  assert(TIQ.skillIconPath('APIs') === '', 'APIs stays a readable pill');
  assert(TIQ.skillIconPath('Data Visualization') === '', 'data visualization stays a readable pill');
  assert(TIQ.skillIconPath('Forecasting') === '', 'forecasting stays a readable pill');
  assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'skill-icons', 'css.svg')), 'CSS asset exists locally');

  const colored = TIQ.renderSkillIconTile('Python');
  assert(colored.indexOf('skill-icon-tile__img') >= 0, 'known icon renders as an image asset');
  assert(colored.indexOf('src="assets/skill-icons/python.svg"') >= 0, 'known icon points at the local asset');
  assert(colored.indexOf('<img') >= 0, 'known icon renders with an image tag');

  const fallback = TIQ.renderSkillIconTile('Patent Law');
  assert(fallback.indexOf('skill-pill') >= 0, 'unsupported skill falls back to a pill badge');
  assert(fallback.indexOf('<img') === -1, 'unsupported skill does not render an image');

  const semantic = TIQ.renderSkillIconTile('Data Visualization');
  assert(semantic.indexOf('skill-pill') >= 0, 'semantic skill renders as a pill badge');
  assert(semantic.indexOf('<img') === -1, 'semantic skill does not render an image');

  const matlab = TIQ.skillIconPath('MATLAB');
  assert(matlab === 'assets/skill-icons/mathworks.svg', 'MATLAB maps to MathWorks badge');
}

main();
