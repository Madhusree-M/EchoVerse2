const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function generateBookCover(title, author, theme, width = 300, height = 400) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Create gradient based on theme
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    switch(theme) {
        case 'horror':
            gradient.addColorStop(0, '#8b0000'); // Dark red
            gradient.addColorStop(0.5, '#4a0000');
            gradient.addColorStop(1, '#000000'); // Black
            break;
        case 'christmas':
            gradient.addColorStop(0, '#228b22'); // Forest green
            gradient.addColorStop(0.5, '#006400');
            gradient.addColorStop(1, '#8b0000'); // Christmas red
            break;
        case 'psychological':
            gradient.addColorStop(0, '#ffd700'); // Gold
            gradient.addColorStop(0.5, '#daa520');
            gradient.addColorStop(1, '#8b4513'); // Saddle brown
            break;
        case 'southern':
            gradient.addColorStop(0, '#cd853f'); // Peru
            gradient.addColorStop(0.5, '#8b4513');
            gradient.addColorStop(1, '#2f4f4f'); // Dark slate gray
            break;
    }
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add texture overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 50; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    
    // Add title
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    
    // Wrap title text
    const words = title.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 40) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    
    // Draw title lines
    const startY = 80;
    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + (index * 35));
    });
    
    // Add author
    ctx.font = '18px serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`by ${author}`, width / 2, height - 60);
    
    // Add decorative elements based on theme
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#ffffff';
    const centerY = height / 2 + 20;
    
    switch(theme) {
        case 'horror':
            // Draw eye shape
            ctx.beginPath();
            ctx.ellipse(width / 2, centerY, 60, 30, 0, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width / 2, centerY, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#000000';
            ctx.fill();
            break;
        case 'christmas':
            // Draw gift box
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(width / 2 - 30, centerY - 20, 60, 40);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(width / 2 - 5, centerY - 20, 10, 40);
            ctx.fillRect(width / 2 - 30, centerY - 5, 60, 10);
            break;
        case 'psychological':
            // Draw wallpaper pattern
            ctx.font = '24px serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 3; j++) {
                    ctx.fillText('❋', 50 + (i * 50), 200 + (j * 40));
                }
            }
            break;
        case 'southern':
            // Draw cross
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(width / 2 - 5, centerY - 30, 10, 60);
            ctx.fillRect(width / 2 - 20, centerY - 5, 40, 10);
            break;
    }
    
    // Add border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Add inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    return canvas;
}

// Generate images for all stories
const stories = [
    { title: 'The Tell-Tale Heart', author: 'Edgar Allan Poe', theme: 'horror', filename: 'tell-tale-heart.png' },
    { title: 'The Gift of the Magi', author: 'O. Henry', theme: 'christmas', filename: 'gift-of-magi.png' },
    { title: 'The Yellow Wallpaper', author: 'Charlotte Perkins Gilman', theme: 'psychological', filename: 'yellow-wallpaper.png' },
    { title: 'A Good Man Is Hard to Find', author: 'Flannery O\'Connor', theme: 'southern', filename: 'good-man-hard-to-find.png' }
];

const publicDir = path.join(__dirname, '..', 'public');

stories.forEach(story => {
    const canvas = generateBookCover(story.title, story.author, story.theme);
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(publicDir, story.filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`Generated: ${story.filename}`);
});

console.log('All default images generated successfully!');
