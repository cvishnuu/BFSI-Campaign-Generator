/**
 * Demo Page - Interactive simulation of BFSI Campaign Generator
 * Shows the full workflow with pre-populated data and guided tour
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, MessageSquare, Loader2, PlayCircle, Eye, X, Check, Edit, RefreshCw } from 'lucide-react';
import { DemoTour } from '@/components/demo-tour';
import { XaiReasoningPanel } from '@/components/xai/XaiReasoningPanel';
import { ComplianceXaiPanel } from '@/components/xai/ComplianceXaiPanel';
import {
  DEMO_CSV_DATA,
  DEMO_CAMPAIGN_PROMPT,
  DEMO_GENERATED_MESSAGES,
  DEMO_EXECUTION_ID,
} from '@/lib/demo-data';

export default function DemoPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [demoStep, setDemoStep] = useState<'upload' | 'execution' | 'review'>('upload');
  const [showTour, setShowTour] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent'>('professional');

  // Review screen state
  const [selectedMessage, setSelectedMessage] = useState<typeof DEMO_GENERATED_MESSAGES[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Start demo tour after 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle tour step changes to synchronize UI (steps are now 1-8)
  const handleStepChange = (stepIndex: number) => {
    console.log(`📍 Tour step changed to: ${stepIndex}`);

    // Step 1 (CSV Upload): Already showing

    // Step 2 (Campaign Prompt): Auto-fill prompt
    if (stepIndex === 2) {
      setTimeout(() => {
        setPrompt(DEMO_CAMPAIGN_PROMPT);
      }, 500);
    }

    // Step 3 (Tone Selection): Set tone to professional
    if (stepIndex === 3) {
      setTimeout(() => {
        setTone('professional');
      }, 500);
    }

    // Step 5 (Review Table): Just highlight the table row, don't open dialog yet
    // Narration: "All messages are shown here with compliance scores..."

    // Step 6 (Message Details): Open dialog to show Edit/Regenerate buttons
    // Narration: "Here's the full message. Click Edit to modify..."
    if (stepIndex === 6) {
      setTimeout(() => {
        console.log('📍 Step 6: Opening dialog to show message details and Edit/Regenerate buttons');
        handleViewMessage(DEMO_GENERATED_MESSAGES[0]);
      }, 500);
    }

    // Step 7 (XAI Tabs): Dialog already open, just highlights XAI tabs
    // Narration: "These tabs show AI transparency. Content Analysis..."
    // No action needed - tooltip will attach to tabs

    // Step 8 (Download): Close the dialog to show the download section
    // Narration: "That's it! You can now approve and download..."
    if (stepIndex === 8) {
      setTimeout(() => {
        console.log('📍 Step 8: Closing dialog to show download section');
        setIsDialogOpen(false);
      }, 500);
    }

    // Step 4 (AI Generation): Change to execution screen AFTER audio finishes
    // The audio onended handler will call tour.next() which triggers step 5
    // Step 5 will then change to review screen

    // Note: Screen changes are now handled by the demo-tour component
    // via custom events emitted when specific audio files finish
  };

  // Simulate campaign creation
  const handleStartDemo = () => {
    // Populate prompt
    setPrompt(DEMO_CAMPAIGN_PROMPT);

    // Wait 2 seconds, then move to execution
    setTimeout(() => {
      setDemoStep('execution');

      // Wait 3 seconds for "generation", then move to review
      setTimeout(() => {
        setDemoStep('review');
      }, 3000);
    }, 2000);
  };

  const handleComplete = () => {
    console.log('🎬 Demo complete - checking login status');
    console.log(`   isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}`);

    // Wait for Clerk to load if not ready yet
    if (!isLoaded) {
      console.log('⏳ Clerk not loaded yet, waiting...');
      setTimeout(handleComplete, 500);
      return;
    }

    // Redirect based on login status
    if (isSignedIn) {
      console.log('✅ User is logged in - redirecting to /dashboard');
      router.push('/dashboard');
    } else {
      console.log('❌ User not logged in - redirecting to home page');
      router.push('/');
    }
  };

  // Handle screen changes triggered by audio completion
  const handleScreenChange = (screen: 'upload' | 'execution' | 'review') => {
    console.log(`🖥️ Changing screen to: ${screen}`);
    setDemoStep(screen);
  };

  // Review screen handlers
  const handleViewMessage = (message: typeof DEMO_GENERATED_MESSAGES[0]) => {
    setSelectedMessage(message);
    setEditedContent(message.message);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditMessage = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedMessage) {
      // In a real app, this would call an API
      // For demo, just simulate success
      setIsEditing(false);
      // Update the message locally
      selectedMessage.message = editedContent;
    }
  };

  const handleCancelEdit = () => {
    if (selectedMessage) {
      setEditedContent(selectedMessage.message);
    }
    setIsEditing(false);
  };

  const getComplianceBadge = (score: number, status: string) => {
    if (status === 'pass') {
      return <Badge variant="success" className="shrink-0">✓ {score}% Compliant</Badge>;
    } else if (status === 'warning') {
      return <Badge variant="warning" className="shrink-0">⚠ {score}% Compliant</Badge>;
    } else {
      return <Badge variant="destructive" className="shrink-0">✗ {score}% Compliant</Badge>;
    }
  };

  // Render tour across all screens
  const renderTour = () => {
    return showTour ? (
      <DemoTour
        onComplete={handleComplete}
        onStepChange={handleStepChange}
        onScreenChange={handleScreenChange}
        autoStart={true}
      />
    ) : null;
  };

  if (demoStep === 'execution') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {renderTour()}
        <Card className="max-w-md" data-demo-step="4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-[#FA7315] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Generating Campaign...</h3>
              <p className="text-sm text-gray-700 mb-4">
                AI is creating personalized messages and checking compliance
              </p>
              <div className="space-y-2 text-left text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span>Analyzing customer profiles...</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span>Generating personalized content...</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                  <span>Running compliance checks...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (demoStep === 'review') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderTour()}
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/demo">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Demo
              </Button>
            </Link>
          </div>
        </header>

        {/* Review Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Review Generated Campaign</h1>
            <p className="text-lg text-gray-700">
              3 messages generated successfully with 95% average compliance score
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Messages</CardDescription>
                <CardTitle className="text-3xl">3</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Passed</CardDescription>
                <CardTitle className="text-3xl text-green-600">3</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Failed</CardDescription>
                <CardTitle className="text-3xl text-red-600">0</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Score</CardDescription>
                <CardTitle className="text-3xl">95%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Messages Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generated Messages</CardTitle>
              <CardDescription>Review and edit AI-generated messages with compliance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_GENERATED_MESSAGES.map((msg, index) => (
                    <TableRow
                      key={msg.row}
                      data-demo-step={index === 0 ? "5" : undefined}
                      className={index === 0 ? "bg-orange-50 hover:bg-orange-100" : undefined}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{msg.name}</p>
                          <p className="text-xs text-gray-600">Row {msg.row}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                      </TableCell>
                      <TableCell>
                        {getComplianceBadge(msg.complianceScore, msg.complianceStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMessage(msg)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Message Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Message Details</DialogTitle>
                <DialogDescription>
                  {selectedMessage?.name} - Row {selectedMessage?.row}
                </DialogDescription>
              </DialogHeader>

              {selectedMessage && (
                <div className="space-y-6">
                  {/* Message Content */}
                  <div className="space-y-2" data-demo-step="6">
                    <div className="flex items-center justify-between">
                      <Label>Message Content</Label>
                      <div className="flex gap-2">
                        {!isEditing && (
                          <Button variant="outline" size="sm" onClick={handleEditMessage}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {isEditing && (
                          <>
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleSaveEdit}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      disabled={!isEditing}
                      rows={6}
                      className={isEditing ? 'border-[#FA7315]' : ''}
                    />
                  </div>

                  {/* Compliance Badge */}
                  <div className="flex items-center gap-2">
                    <Label>Compliance Status:</Label>
                    {getComplianceBadge(selectedMessage.complianceScore, selectedMessage.complianceStatus)}
                  </div>

                  {/* XAI Tabs */}
                  <Tabs defaultValue="content" data-demo-step="7">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Content Analysis</TabsTrigger>
                      <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="space-y-4">
                      <XaiReasoningPanel
                        xai={selectedMessage.xai}
                        title="How was this message generated?"
                        description="AI reasoning and decision-making process"
                      />
                    </TabsContent>
                    <TabsContent value="compliance" className="space-y-4">
                      <ComplianceXaiPanel
                        complianceXai={selectedMessage.compliance_xai}
                        title="How was compliance evaluated?"
                        description="AI compliance checking and regulatory analysis"
                      />
                    </TabsContent>
                  </Tabs>

                  {/* Regenerate Option */}
                  <div className="border-t pt-4">
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate with Feedback
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* CTA */}
          <Card className="border-orange-200 bg-gradient-to-r from-[#FA7315] to-orange-400" data-demo-step="download">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-xl mb-2 text-white">Demo Complete!</h3>
                <p className="text-sm text-white mb-4">
                  Ready to create your own compliant campaigns?
                </p>
                <Button onClick={handleComplete} size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload step (default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Tour */}
      {renderTour()}

      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Badge variant="secondary" className="text-sm">
            <PlayCircle className="w-4 h-4 mr-1" />
            Demo Mode
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Create Marketing Campaign</h1>
          <p className="text-lg text-gray-700">
            Watch how easy it is to generate compliant campaigns
          </p>
        </div>

        {/* CSV Upload Section */}
        <Card data-demo-step="csv-upload" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-[#FA7315] font-bold">1</span>
              </div>
              Upload Customer Data
            </CardTitle>
            <CardDescription>CSV file with customer details (max 100 rows)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-semibold">
                  ✅ sample-customers.csv loaded
                </p>
                <p className="text-xs text-gray-600">3 customers ready to process</p>
                <div className="mt-4 text-xs text-left bg-white p-3 rounded border max-w-md mx-auto">
                  <div className="font-mono">
                    <div className="text-gray-600">customer_id, name, email, occupation...</div>
                    <div className="text-gray-900">1001, Rajesh Kumar, rajesh@...</div>
                    <div className="text-gray-900">1002, Priya Sharma, priya@...</div>
                    <div className="text-gray-900">1003, Amit Patel, amit@...</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-[#FA7315] font-bold">2</span>
              </div>
              Configure Campaign
            </CardTitle>
            <CardDescription>Set your campaign parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2" data-demo-step="prompt">
              <Label htmlFor="prompt" className="flex items-center gap-2 text-gray-900">
                <MessageSquare className="w-4 h-4" />
                Campaign Prompt
              </Label>
              <Textarea
                id="prompt"
                placeholder="Describe your campaign..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Tone */}
            <div className="space-y-2" data-demo-step="tone">
              <Label className="text-gray-900">Message Tone</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['professional', 'friendly', 'urgent'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={tone === t ? 'default' : 'outline'}
                    onClick={() => setTone(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card className="border-orange-200 bg-gradient-to-r from-[#FA7315] to-orange-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white">Ready to Generate?</h3>
                <p className="text-sm text-white">Start the AI campaign generation</p>
              </div>
              <Button onClick={handleStartDemo} size="lg" className="px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
