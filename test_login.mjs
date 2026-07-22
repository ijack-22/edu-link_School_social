import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('request', request => {
    console.log(`Request: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`Response: ${response.status()} ${response.url()}`);
  });

  console.log('Navigating to https://edulink-school-social.vercel.app/');
  await page.goto('https://edulink-school-social.vercel.app/', { waitUntil: 'networkidle2' });
  
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  if (currentUrl.includes('vercel.com')) {
    console.log('Vercel Authentication is blocking access!');
    await browser.close();
    process.exit(1);
  }
  
  console.log('Filling login form...');
  await page.type('input[type="email"]', 'admin@edulink.com');
  await page.type('input[type="password"]', 'Admin@123');
  
  console.log('Clicking login button...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation or error...');
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
    console.log('Successfully logged in and navigated to:', page.url());
  } catch (e) {
    console.log('No navigation happened. Checking for error messages...');
    // wait a bit for react state to update
    await new Promise(r => setTimeout(r, 1000));
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Invalid email or password')) {
      console.log('FOUND ERROR ON SCREEN: Invalid email or password');
    } else {
      console.log('Current text on screen:', bodyText.substring(0, 500));
    }
  }
  
  await browser.close();
})();
