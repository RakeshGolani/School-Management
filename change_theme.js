const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/super-admin/login/page.js',
  'src/components/layout/SuperAdminSidebar.js',
  'src/components/layout/SuperAdminHeader.js',
  'src/app/super-admin/dashboard/page.js',
  'src/app/super-admin/layout.js'
];

filesToUpdate.forEach(relativePath => {
  const absolutePath = path.join(__dirname, relativePath);
  if (fs.existsSync(absolutePath)) {
    let content = fs.readFileSync(absolutePath, 'utf8');
    
    // Replace hardcoded neutral colors with CSS variable classes
    content = content.replace(/bg-neutral-950/g, 'bg-admin-bg');
    content = content.replace(/bg-neutral-900/g, 'bg-admin-surface');
    
    fs.writeFileSync(absolutePath, content);
    console.log('Updated backgrounds in:', relativePath);
  } else {
    console.log('Not found:', relativePath);
  }
});
