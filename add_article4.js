const fs = require('fs');

// Read the files
const articleJs = fs.readFileSync('js/article.js', 'utf8');
const content = fs.readFileSync('articles/4_content.txt', 'utf8');

// Escape backslashes, backticks, and ${ for template string
let escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

// Build article 4 object literal (without the trailing comma and closing brace)
const article4Obj = `4: {
  id: 4,
  title: '从零搭个人博客：我都干了什么',
  date: '2026-04-09',
  tags: ['技术', '复盘'],
  readTime: '6 分钟',
  prev: 3,
  next: null,
  content: \`${escaped}\`
}`;

// Find the last '};' in the file and replace it with ', article4Obj\n};'
// We need to be careful to only replace the final '};' that closes ARTICLES
const lastBraceSemi = articleJs.lastIndexOf('\n};');
if (lastBraceSemi === -1) {
  console.error('Could not find }; to replace');
  process.exit(1);
}

const newContent = articleJs.substring(0, lastBraceSemi) + '\n,' + article4Obj + '\n};';

// Write back
fs.writeFileSync('js/article.js', newContent);

// Verify syntax
const { execSync } = require('child_process');
try {
  execSync('node -c js/article.js', { cwd: '.', stdio: 'pipe' });
  console.log('Syntax OK');
} catch(e) {
  console.log('Syntax Error:', e.stdout?.toString(), e.stderr?.toString());
}
