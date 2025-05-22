const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [16, 32, 48, 64, 192, 512];
const inputFile = path.join(__dirname, '../public/logo.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(inputFile);

    // Generate favicon.ico (multiple sizes in one file)
    const faviconSizes = [16, 32, 48, 64];
    const faviconBuffers = await Promise.all(
      faviconSizes.map(size => 
        sharp(svgBuffer)
          .resize(size, size)
          .toFormat('png')
          .toBuffer()
      )
    );

    await sharp(faviconBuffers[1]) // Use 32x32 for favicon
      .toFile(path.join(outputDir, 'favicon.ico'));

    // Generate PNG files
    await Promise.all(
      sizes.map(async size => {
        const filename = size === 192 ? 'logo192.png' : 
                        size === 512 ? 'logo512.png' : 
                        `logo-${size}.png`;
        
        await sharp(svgBuffer)
          .resize(size, size)
          .toFormat('png')
          .toFile(path.join(outputDir, filename));
        
        console.log(`Generated ${filename}`);
      })
    );

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 