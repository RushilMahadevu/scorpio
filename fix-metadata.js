const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processPage(filePath) {
  if (path.basename(filePath) !== 'page.tsx') return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/<SetPageTitle\s+title=(?:"([^"]+)"|\{([^}]+)\})\s*\/>/);
  
  if (match) {
    const staticTitle = match[1];
    const dynamicCode = match[2];
    
    // Pick a sensible static title even for dynamic pages to prevent "Scorpio" flash.
    let titleStr = staticTitle;
    if (!titleStr) {
      if (dynamicCode.includes('forkId')) titleStr = "Assignments";
      else if (dynamicCode.includes('submission.studentName')) titleStr = "Grading";
      else if (dynamicCode.includes('assignment.title')) titleStr = "Assignment";
      else titleStr = "Dashboard";
    }

    // Write layout.tsx
    const layoutPath = path.join(path.dirname(filePath), 'layout.tsx');
    if (!fs.existsSync(layoutPath)) {
      const layoutContent = `import { Metadata } from "next";

export const metadata: Metadata = {
  title: "${titleStr}",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
      fs.writeFileSync(layoutPath, layoutContent);
      console.log('Created layout.tsx for ', filePath);
    } else {
        // If layout exists, we might need to inject metadata.
        // Let's check if it already has metadata.
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        if (!layoutContent.includes('export const metadata')) {
            console.log('Needs manual metadata update: ', layoutPath);
        }
    }
    
    // Remove SetPageTitle from page.tsx entirely
    let newContent = content.replace(/import { SetPageTitle } from "[^"]+";\n?/g, '');
    newContent = newContent.replace(/<SetPageTitle[^>]+\/>/g, '');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log('Removed SetPageTitle from', filePath);
    }
  }
}

walkDir('./src/app/teacher', processPage);
walkDir('./src/app/student', processPage);
// Ensure we handle the root student/teacher correctly if they have layout.tsx

