/**
 * Interactive Demo Tour Component
 * Professional cinematic demo with MP3 voiceover narration
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface DemoTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
  onStepChange?: (stepIndex: number) => void;
  onScreenChange?: (screen: 'upload' | 'execution' | 'review') => void;
}

export function DemoTour({ onComplete, autoStart = false, onStepChange, onScreenChange }: DemoTourProps) {
  const tourRef = useRef<Tour | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onStepChangeRef = useRef(onStepChange);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onStepChangeRef.current = onStepChange;
  }, [onComplete, onStepChange]);

  // Play audio for a step (steps 1-8)
  const playStepAudio = (stepNumber: number) => {
    const audioId = `audio-${stepNumber}-${Date.now()}`;
    console.log(`🔊 [${audioId}] Creating audio for step ${stepNumber}`);

    // Simply release the reference to the old audio (which has already ended)
    // Don't call pause() as it can interfere with the new audio's play()
    if (audioRef.current) {
      console.log(`   Releasing previous audio reference: ${audioRef.current.src}`);
      audioRef.current = null;
    }

    // Create new audio
    const audio = new Audio(`/demo/audio/step-${stepNumber}.mp3`);
    audioRef.current = audio;

    audio.onloadeddata = () => {
      console.log(`✅ [${audioId}] Audio loaded - duration: ${audio.duration}s`);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      console.log(`▶️ [${audioId}] Audio playing`);
    };

    audio.ontimeupdate = () => {
      // Log every 2 seconds
      if (audio.currentTime > 0 && Math.floor(audio.currentTime) % 2 === 0 && Math.floor(audio.currentTime * 10) % 20 < 2) {
        console.log(`⏱️ [${audioId}] Time: ${audio.currentTime.toFixed(1)}s / ${audio.duration.toFixed(1)}s`);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      console.log(`✓ [${audioId}] Step ${stepNumber} audio finished`);
      console.log(`   Current time: ${audio.currentTime}, Duration: ${audio.duration}`);

      // Wait for audio to fully finish
      setTimeout(() => {
        console.log(`→ [${audioId}] In setTimeout callback (1000ms delay)`);
        const tour = tourRef.current;
        if (!tour || !tour.isActive()) {
          console.log(`⚠️ [${audioId}] Tour not active, skipping advance`);
          return;
        }

        const currentIndex = tour.steps.indexOf(tour.getCurrentStep()!);
        console.log(`   Current step index: ${currentIndex}, Total steps: ${tour.steps.length}`);

        // Handle screen changes and UI state based on step
        if (stepNumber === 3 && onScreenChange) {
          console.log(`→ [${audioId}] Changing to execution screen`);
          onScreenChange('execution');
        }

        if (stepNumber === 4 && onScreenChange) {
          console.log(`→ [${audioId}] Changing to review screen`);
          onScreenChange('review');
        }

        // Step 5 ends → trigger dialog open via onStepChange callback
        if (stepNumber === 5 && onStepChangeRef.current) {
          console.log(`→ [${audioId}] Triggering dialog open for step 6`);
          onStepChangeRef.current(6); // Tell parent to open dialog NOW
        }

        // Determine delay and whether we need to wait for DOM rendering
        // Screen changes: steps 3→4 (execution screen), 4→5 (review screen)
        // Dialog opens: step 5→6 (dialog with message content)
        const needsScreenRender = (stepNumber === 3 || stepNumber === 4);
        const needsDialogOpen = (stepNumber === 5); // Step 6 opens dialog
        const needsDOMWait = needsScreenRender || needsDialogOpen;
        // Longer delays: 1500ms for screen changes, 1000ms for dialog, 500ms for normal
        const advanceDelay = needsScreenRender ? 1500 : (needsDialogOpen ? 1000 : 500);

        // Advance to next step
        if (currentIndex < tour.steps.length - 1) {
          console.log(`→ [${audioId}] Advancing to step ${stepNumber + 1} (delay: ${advanceDelay}ms)`);

          setTimeout(() => {
            console.log(`→ [${audioId}] NOW advancing to step ${stepNumber + 1}`);

            // For steps that need DOM rendering, wait for element to exist
            if (needsDOMWait) {
              // Hide current step tooltip to prevent overlap during DOM wait
              const currentStep = tour.getCurrentStep();
              if (currentStep) {
                currentStep.hide();
                console.log(`→ [${audioId}] Hidden current step tooltip (DOM wait)`);
              }
              const nextStepNumber = stepNumber + 1;
              const targetSelector = `[data-demo-step="${nextStepNumber}"]`;
              console.log(`→ [${audioId}] Waiting for DOM element: ${targetSelector}`);

              // Poll for element existence (max 5 seconds)
              let attempts = 0;
              const maxAttempts = 50; // 50 * 100ms = 5 seconds
              const checkElement = () => {
                attempts++;
                const element = document.querySelector(targetSelector);

                if (element) {
                  console.log(`→ [${audioId}] Element found after ${attempts * 100}ms! Advancing tour...`);
                  tour.next();

                  // Play audio for next step after tour advances
                  setTimeout(() => {
                    console.log(`→ [${audioId}] NOW calling playStepAudio(${nextStepNumber})`);
                    playStepAudio(nextStepNumber);
                  }, 500);
                } else if (attempts < maxAttempts) {
                  console.log(`→ [${audioId}] Element not found yet (attempt ${attempts}/${maxAttempts}), retrying...`);
                  setTimeout(checkElement, 100);
                } else {
                  console.error(`→ [${audioId}] ❌ Element ${targetSelector} not found after ${maxAttempts * 100}ms!`);
                }
              };

              checkElement();
            } else {
              // No DOM wait needed, advance immediately
              tour.next();

              // Play audio for next step after tour advances
              console.log(`→ [${audioId}] About to call playStepAudio(${stepNumber + 1})`);
              setTimeout(() => {
                console.log(`→ [${audioId}] NOW calling playStepAudio(${stepNumber + 1})`);
                playStepAudio(stepNumber + 1);
              }, 500);
            }
          }, advanceDelay);
        } else {
          console.log(`✓ [${audioId}] Demo tour complete!`);
          // Step 8 audio finished - auto-redirect
          if (stepNumber === 8) {
            console.log(`🔄 Step 8 audio finished - triggering auto-redirect`);
            tour.complete();
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }
        }
      }, 1000);
    };

    audio.onerror = (e) => {
      console.error(`❌ [${audioId}] Audio error:`, e, audio.error);
      setIsPlaying(false);
    };

    // Start playing immediately
    console.log(`▶️ [${audioId}] Calling play()...`);
    audio.play().then(() => {
      console.log(`✅ [${audioId}] Play promise resolved`);
    }).catch((error) => {
      console.error(`❌ [${audioId}] Play failed:`, error);
      setIsPlaying(false);
    });
  };

  const stopAudio = () => {
    console.log('🛑 stopAudio() called');
    if (audioRef.current) {
      console.log(`   Stopping audio: ${audioRef.current.src}`);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    // Initialize Shepherd tour (without welcome step)
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-cinematic',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true,
        },
        when: {
          show() {
            const stepIndex = tour.steps.indexOf(tour.getCurrentStep()!);
            const stepNumber = stepIndex + 1;
            console.log(`📍 Showing step ${stepNumber}`);

            // Notify parent component (step numbers are now 1-7 instead of 0-7)
            if (onStepChangeRef.current) {
              onStepChangeRef.current(stepNumber);
            }

            // Note: Audio is now manually controlled from onended handlers
            // No automatic audio playback here to prevent race conditions
          },
        },
      },
    });

    // Step 1: CSV Upload
    tour.addStep({
      id: 'csv-upload',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3>Step 1: Upload Customer Data</h3>
          </div>
          <p class="demo-description">
            Upload a CSV file with customer details like name, email, and occupation.
          </p>
          <div class="demo-highlight">
            ✨ Sample file loaded: 3 customers ready
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="csv-upload"]',
        on: 'bottom',
      },
      buttons: [],
    });

    // Step 2: Campaign Prompt
    tour.addStep({
      id: 'campaign-prompt',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3>Step 2: Describe Your Campaign</h3>
          </div>
          <p class="demo-description">
            Tell the AI what kind of message you want to generate.
          </p>
          <div class="demo-example">
            💡 "Generate credit card offers with cashback benefits"
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="prompt"]',
        on: 'bottom',
      },
      buttons: [],
    });

    // Step 3: Tone Selection
    tour.addStep({
      id: 'tone-selection',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3>Step 3: Choose Message Tone</h3>
          </div>
          <p class="demo-description">
            Select professional, friendly, or urgent to match your brand voice.
          </p>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="tone"]',
        on: 'bottom',
      },
      buttons: [],
    });

    // Step 4: AI Generation
    tour.addStep({
      id: 'generation',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3>Step 4: AI Generation & Compliance</h3>
          </div>
          <p class="demo-description">
            Our AI generates personalized messages and automatically checks compliance.
          </p>
          <div class="demo-badges">
            <span class="demo-badge">RBI</span>
            <span class="demo-badge">SEBI</span>
            <span class="demo-badge">IRDAI</span>
            <span class="demo-badge">TRAI</span>
          </div>
        </div>
      `,
      buttons: [],
    });

    // Step 5: Review Messages Table
    tour.addStep({
      id: 'review-table',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Step 5: Review Generated Messages</h3>
          </div>
          <p class="demo-description">
            All generated messages shown in a table with customer details and compliance scores.
          </p>
          <div class="demo-actions">
            <span>👁️ Click "View" to see full message details</span>
            <span>✏️ Edit content directly</span>
            <span>🔄 Regenerate with feedback</span>
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="5"]',
        on: 'left',
      },
      buttons: [],
    });

    // Step 6: View Message & XAI
    tour.addStep({
      id: 'message-detail',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3>Step 6: Message Details & Actions</h3>
          </div>
          <p class="demo-description">
            View full message content with edit/save functionality.
          </p>
          <div class="demo-highlight">
            💡 Click "Edit" to modify, "Save" to update, or "Regenerate" for new version
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="6"]',
        on: 'right',
      },
      buttons: [],
    });

    // Step 7: XAI Tabs
    tour.addStep({
      id: 'xai-tabs',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Step 7: AI Explainability (XAI)</h3>
          </div>
          <p class="demo-description">
            Full transparency into AI decision-making process.
          </p>
          <div class="demo-highlight">
            <strong>Content Analysis:</strong> How message was generated<br/>
            <strong>Compliance Check:</strong> Regulatory analysis with violations
          </div>
          <div class="demo-badges">
            <span class="demo-badge">RBI</span>
            <span class="demo-badge">SEBI</span>
            <span class="demo-badge">IRDAI</span>
            <span class="demo-badge">TRAI</span>
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="7"]',
        on: 'top',
      },
      buttons: [],
    });

    // Step 8: Download (Final Step - no button, auto-redirect after audio)
    tour.addStep({
      id: 'download',
      text: `
        <div class="demo-step">
          <div class="demo-step-header">
            <div class="demo-icon-wrapper">
              <svg class="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3>Step 8: Download & Deploy</h3>
          </div>
          <p class="demo-description">
            Approve and download your campaign as Excel - ready to use!
          </p>
          <div class="demo-success">
            <div class="success-icon">✓</div>
            <div>
              <strong>Demo Complete!</strong>
              <p>Redirecting you now...</p>
            </div>
          </div>
        </div>
      `,
      attachTo: {
        element: '[data-demo-step="download"]',
        on: 'top',
      },
      buttons: [],
    });

    tourRef.current = tour;

    // Cleanup
    return () => {
      console.log('🧹 useEffect cleanup running');
      stopAudio();
      if (tour) {
        tour.complete();
      }
    };
  }, []); // Empty deps - only run once on mount, cleanup on unmount

  // Handle Start Demo button click
  const handleStartDemo = () => {
    console.log('👆 User clicked Start Demo');

    // Hide welcome modal
    setShowWelcome(false);

    // Play welcome audio
    playWelcomeAudio();
  };

  // Play welcome audio, then start tour
  const playWelcomeAudio = () => {
    console.log('🔊 Playing welcome audio');

    const audio = new Audio('/demo/audio/step-0.mp3');
    audioRef.current = audio;

    audio.onloadeddata = () => {
      console.log('✅ Welcome audio loaded');
    };

    audio.onplay = () => {
      setIsPlaying(true);
      console.log('▶️ Welcome audio playing');
    };

    audio.onended = () => {
      setIsPlaying(false);
      console.log('✓ Welcome audio finished, starting tour');

      // Start tour from step 1 and manually play step 1 audio
      setTimeout(() => {
        const tour = tourRef.current;
        if (tour) {
          setTourStarted(true);
          tour.start();

          // Manually play step 1 audio after tour starts
          setTimeout(() => {
            playStepAudio(1);
          }, 500);
        }
      }, 500);
    };

    audio.onerror = (e) => {
      console.error('❌ Welcome audio error:', e);
      setIsPlaying(false);
    };

    audio.play().catch((error) => {
      console.error('❌ Failed to play welcome audio:', error);
      setIsPlaying(false);
    });
  };

  // Render
  return (
    <>
      {/* Welcome Modal */}
      {showWelcome && autoStart && !tourStarted && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="demo-step max-w-md bg-white rounded-2xl p-8 shadow-2xl">
            <div className="demo-step-header">
              <div className="demo-icon-wrapper">
                <svg className="demo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome to BFSI Campaign Generator!</h3>
            </div>
            <p className="demo-description text-gray-700 my-4">
              Let me show you how to create compliant marketing campaigns in minutes using AI.
            </p>
            <div className="demo-info-box bg-orange-50 p-4 rounded-lg flex items-start gap-3 mb-6">
              <svg className="info-icon w-5 h-5 text-[#FA7315] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              <span className="text-sm text-gray-700">This 1-minute demo runs automatically with voiceover. Click Start to begin!</span>
            </div>
            <button
              onClick={handleStartDemo}
              className="shepherd-button-primary w-full py-3 px-6 bg-[#FA7315] hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              ▶ Start Demo
            </button>
          </div>
        </div>
      )}

      {/* Audio Indicator */}
      {isPlaying && (
        <div className="demo-audio-indicator">
          <div className="audio-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="audio-text">Playing narration...</span>
        </div>
      )}
    </>
  );
}

// Export helper to trigger demo from anywhere
export function startDemo() {
  if (typeof window !== 'undefined' && (window as any).__demoTour) {
    (window as any).__demoTour.start();
  }
}
