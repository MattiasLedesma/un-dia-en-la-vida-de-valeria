const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = '/home/mledesma/Desktop/one-year-with-you/proyecto-valeria/prompts';
const ASSETS_SPRITES = '/home/mledesma/Desktop/one-year-with-you/proyecto-valeria/assets/sprites';
const PUBLIC_SPRITES = '/home/mledesma/Desktop/one-year-with-you/proyecto-valeria/public/sprites';
const BGS_DIR = '/home/mledesma/Desktop/one-year-with-you/proyecto-valeria/public/bgs';

if (!fs.existsSync(PUBLIC_SPRITES)) fs.mkdirSync(PUBLIC_SPRITES, { recursive: true });
if (!fs.existsSync(BGS_DIR)) fs.mkdirSync(BGS_DIR, { recursive: true });

function getRGB(color) {
    return {
        r: (color >> 24) & 255,
        g: (color >> 16) & 255,
        b: (color >> 8) & 255,
        a: color & 255
    };
}

function colorDistance(c1, c2) {
    return Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b);
}

async function processSprite(inputFile, outputFile, isStrip = false) {
    if (!fs.existsSync(inputFile)) {
        console.log('Skipping (not found): ' + inputFile);
        return;
    }
    
    try {
        const image = await Jimp.read(inputFile);
        let targetImg = image;
        
        if (isStrip) {
            const frameWidth = image.bitmap.width / 4;
            targetImg = image.crop({ x: 0, y: 0, w: frameWidth, h: image.bitmap.height });
        }

        // Leer dos píxeles de las esquinas para atrapar los dos colores del checkerboard
        const bg1 = getRGB(targetImg.getPixelColor(0, 0));
        const bg2 = getRGB(targetImg.getPixelColor(10, 0)); // Un pixel un poco más allá, con suerte es el otro color del checkerboard
        
        targetImg.scan(0, 0, targetImg.bitmap.width, targetImg.bitmap.height, function (x, y, idx) {
            const current = getRGB(this.getPixelColor(x, y));
            
            // Si el pixel es muy parecido a ALGUNO de los dos colores del fondo, lo hacemos transparente
            if (colorDistance(bg1, current) < 40 || colorDistance(bg2, current) < 40) {
                this.bitmap.data[idx + 3] = 0; // alpha = 0
            }
        });

        if (targetImg.bitmap.width > 128) {
             targetImg.resize({ w: 64 });
        }

        await targetImg.write(outputFile);
        console.log(`Processed ${path.basename(inputFile)} -> ${outputFile}`);
    } catch (e) {
        console.error(`Error processing ${inputFile}:`, e.message);
    }
}

async function splitPets(inputFile) {
    if (!fs.existsSync(inputFile)) return;
    try {
        const image = await Jimp.read(inputFile);
        const w = image.bitmap.width / 3;
        const h = image.bitmap.height;
        
        const makeTransparent = (img) => {
            const bg1 = getRGB(img.getPixelColor(0, 0));
            const bg2 = getRGB(img.getPixelColor(10, 0));
            
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
                const current = getRGB(this.getPixelColor(x, y));
                if (colorDistance(bg1, current) < 40 || colorDistance(bg2, current) < 40) {
                    this.bitmap.data[idx + 3] = 0;
                }
            });
            if (img.bitmap.width > 128) img.resize({w: 64});
            return img;
        };

        const rufino = makeTransparent(image.clone().crop({x: 0, y: 0, w: w, h}));
        await rufino.write(path.join(PUBLIC_SPRITES, 'rufino.png'));
        
        const berlioz = makeTransparent(image.clone().crop({x: w, y: 0, w: w, h}));
        await berlioz.write(path.join(PUBLIC_SPRITES, 'berlioz.png'));
        
        const bacco = makeTransparent(image.clone().crop({x: w*2, y: 0, w: w, h}));
        await bacco.write(path.join(PUBLIC_SPRITES, 'bacco.png'));
        
        console.log('Processed pets split');
    } catch (e) {
        console.error('Error split pets:', e.message);
    }
}

async function processBackground(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) return;
    try {
        const image = await Jimp.read(inputFile);
        image.cover({ w: 800, h: 600 });
        await image.write(outputFile);
        console.log(`Processed BG ${path.basename(inputFile)}`);
    } catch (e) {
        console.error('Error processing BG:', e.message);
    }
}

async function run() {
    console.log("Starting image processing...");
    
    await processSprite(path.join(ASSETS_SPRITES, 'valeria.png'), path.join(PUBLIC_SPRITES, 'valeria.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'benja.png'), path.join(PUBLIC_SPRITES, 'benja.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'camila.png'), path.join(PUBLIC_SPRITES, 'camila.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'sol_rama.png'), path.join(PUBLIC_SPRITES, 'rama_sol.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'tiziano.png'), path.join(PUBLIC_SPRITES, 'tiziano.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'mati.png'), path.join(PUBLIC_SPRITES, 'matias.png'), true);
    await processSprite(path.join(PROMPTS_DIR, 'zombie.png'), path.join(PUBLIC_SPRITES, 'zombie.png'), true);
    
    await splitPets(path.join(PROMPTS_DIR, 'rufino_berlioz_bacco.png'));
    
    await processBackground(path.join(PROMPTS_DIR, 'casa_vale.png'), path.join(BGS_DIR, 'room.png'));
    await processBackground(path.join(PROMPTS_DIR, 'guernica.png'), path.join(BGS_DIR, 'guernica.png'));
    await processBackground(path.join(PROMPTS_DIR, 'allaria.png'), path.join(BGS_DIR, 'allaria.png'));
    await processBackground(path.join(PROMPTS_DIR, 'uade.png'), path.join(BGS_DIR, 'uade.png'));
    await processBackground(path.join(PROMPTS_DIR, 'tren.png'), path.join(BGS_DIR, 'tren.png'));
    await processBackground(path.join(PROMPTS_DIR, 'subte.png'), path.join(BGS_DIR, 'subte.png'));
    await processBackground(path.join(PROMPTS_DIR, 'casa_mati.png'), path.join(BGS_DIR, 'casa_mati.png'));
    
    console.log("Done!");
}

run();
