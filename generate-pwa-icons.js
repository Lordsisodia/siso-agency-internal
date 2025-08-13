const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Icon sizes needed for PWA
const sizes = [
  { size: 96, name: 'icon-96x96.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  const sourceImage = path.join(__dirname, 'public/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png');
  const outputDir = path.join(__dirname, 'public');

  try {
    // Check if source image exists
    await fs.access(sourceImage);
    
    // Generate each icon size
    for (const { size, name } of sizes) {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✓ Generated ${name}`);
    }
    
    console.log('\n✅ All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install sharp');
    console.log('2. Run this script: node generate-pwa-icons.js');
    console.log('3. Deploy and test on iPhone');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nMake sure to install sharp: npm install sharp');
  }
}

// Run the icon generation
generateIcons();