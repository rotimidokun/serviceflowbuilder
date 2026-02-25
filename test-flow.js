import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTemplateSwitch() {
    const browser = await chromium.launch({
        headless: false,
    });

    try {
        const page = await browser.newPage();
        const indexPath = `file://${path.join(__dirname, 'index.html')}`;
        console.log(`Opening index.html at ${indexPath}`);
        
        await page.goto(indexPath);

        // Verify initial title
        const initialTitle = await page.textContent('#preview-title');
        console.log(`Initial Title: ${initialTitle}`);

        // Change template to Winning Edge - Virtual
        console.log('Selecting "wed-v" template...');
        await page.selectOption('#select-template', 'wed-v');

        // Wait for preview to update
        await page.waitForTimeout(1000);

        const updatedTitle = await page.textContent('#preview-title');
        console.log(`Updated Title: ${updatedTitle}`);

        if (updatedTitle.includes('VIRTUAL')) {
            console.log('✅ Template switch verified successfully!');
        } else {
            console.error('❌ Template switch failed to reflect in UI.');
            process.exit(1);
        }

    } catch (error) {
        console.error('An error occurred during testing:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

testTemplateSwitch();
