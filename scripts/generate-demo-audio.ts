/**
 * Generate Demo Audio Files using Google Cloud Text-to-Speech
 *
 * Setup:
 * 1. Install Google Cloud TTS client: pnpm add @google-cloud/text-to-speech
 * 2. Set up Google Cloud credentials: https://cloud.google.com/text-to-speech/docs/before-you-begin
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 4. Run: npx tsx scripts/generate-demo-audio.ts
 *
 * Free tier: 1 million characters/month (our demo uses ~500 characters)
 */

import * as fs from 'fs';
import * as path from 'path';
import { DEMO_VOICEOVER_SCRIPTS } from '../lib/demo-data';

// Google Cloud TTS types
interface SynthesizeSpeechRequest {
  input: { text: string };
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
  };
}

async function generateAudioWithGoogleTTS() {
  try {
    // Dynamic import to avoid issues if library not installed
    const textToSpeech = await import('@google-cloud/text-to-speech');
    const client = new textToSpeech.TextToSpeechClient({
      apiKey: process.env.GOOGLE_TTS_API_KEY
    });

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'demo', 'audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎤 Generating demo audio files with Google Cloud TTS...\n');

    for (const script of DEMO_VOICEOVER_SCRIPTS) {
      const request: SynthesizeSpeechRequest = {
        input: { text: script.text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-F', // Professional female voice
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0, // Normal speed
          pitch: 0.0, // Normal pitch
        },
      };

      const stepIndex = DEMO_VOICEOVER_SCRIPTS.indexOf(script);
      console.log(`Generating step-${stepIndex}.mp3 (Step ${script.step})...`);

      const [response] = await client.synthesizeSpeech(request);

      if (response.audioContent) {
        const filename = `step-${stepIndex}.mp3`;
        const filepath = path.join(outputDir, filename);

        // Write audio content to file
        fs.writeFileSync(filepath, response.audioContent as Buffer, 'binary');

        console.log(`✅ Created: ${filename} (${script.duration}ms)\n`);
      }
    }

    console.log('🎉 All audio files generated successfully!');
    console.log(`📁 Location: ${outputDir}\n`);
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    console.log('\n⚠️  Fallback: Using Web Speech API instead (browser-based)');
    console.log('No audio files needed - will generate at runtime in browser.\n');
  }
}

// Alternative: Browser-based Web Speech API (no server-side generation needed)
function generateBrowserAudioInstructions() {
  console.log('📝 Browser-based audio generation (no pre-generation needed):\n');
  console.log('The demo tour will use the Web Speech API to generate audio at runtime.');
  console.log('This requires no setup and works in all modern browsers.\n');
  console.log('Voice used: Browser default female voice');
  console.log('Quality: Good (not as high as Google Cloud TTS)\n');
}

// Check if Google Cloud TTS is available
async function main() {
  try {
    await import('@google-cloud/text-to-speech');
    await generateAudioWithGoogleTTS();
  } catch (error) {
    console.log('ℹ️  Google Cloud TTS not available. Using browser-based speech synthesis.\n');
    generateBrowserAudioInstructions();
  }
}

main();
