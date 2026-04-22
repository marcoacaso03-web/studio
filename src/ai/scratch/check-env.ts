
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  const key = envConfig['GOOGLE_GENAI_API_KEY'] || envConfig['GOOGLE_API_KEY'];
  if (key) {
    console.log(`Key found. Prefix: ${key.substring(0, 7)}... Length: ${key.length}`);
    console.log(`Raw value starts with quote? ${key.startsWith('"') || key.startsWith("'")}`);
  } else {
    console.log('Key NOT found in .env.local');
  }
} else {
  console.log('.env.local NOT found in current directory');
}
