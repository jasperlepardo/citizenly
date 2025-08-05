const fs = require('fs-extra')
const path = require('path')

async function copyStorybook() {
  const source = path.join(__dirname, '../storybook-static')
  const destination = path.join(__dirname, '../public/storybook-static')
  
  try {
    // Check if storybook-static exists
    if (await fs.pathExists(source)) {
      // Remove existing destination
      await fs.remove(destination)
      
      // Copy storybook-static to public
      await fs.copy(source, destination)
      
      console.log('✅ Storybook static files copied to public/storybook-static')
    } else {
      console.log('⚠️  storybook-static directory not found. Run npm run build-storybook first.')
    }
  } catch (error) {
    console.error('❌ Error copying Storybook files:', error)
    process.exit(1)
  }
}

copyStorybook()