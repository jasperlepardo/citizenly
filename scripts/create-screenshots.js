const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createScreenshots() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  // Ensure directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create desktop dashboard screenshot (1280x720)
  const desktopScreenshot = sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 4,
      background: { r: 17, g: 24, b: 39, alpha: 1 } // gray-900
    }
  });

  await desktopScreenshot
    .png()
    .toFile(path.join(screenshotsDir, 'desktop-dashboard.png'));

  // Create mobile residents screenshot (390x844)
  const mobileScreenshot = sharp({
    create: {
      width: 390,
      height: 844,
      channels: 4,
      background: { r: 17, g: 24, b: 39, alpha: 1 } // gray-900
    }
  });

  await mobileScreenshot
    .png()
    .toFile(path.join(screenshotsDir, 'mobile-residents.png'));

  console.log('✅ PWA screenshots created successfully');
}

createScreenshots().catch(console.error);