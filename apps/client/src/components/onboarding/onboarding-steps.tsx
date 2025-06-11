import type { OnboardingStep } from '@/hooks/use-onboarding';

export const onboardingSteps: OnboardingStep[] = [
	{
		target: 'body',
		content: (
			<div className="text-center">
				<h2 className="text-xl font-semibold text-foreground mb-2">
					Welcome to Karaoke Milay! 🎤
				</h2>
				<p className="text-muted-foreground mb-4">
					Let's take a quick tour to help you create amazing karaoke
					videos.
				</p>
				<p className="text-sm text-muted-foreground">
					This walkthrough will show you the main features in just a
					few steps.
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
		hideCloseButton: false,
		styles: {
			options: {
				width: 400,
				zIndex: 10000,
			},
		},
	},
	{
		target: '[data-onboarding="upload-section"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					📂 Step 1: Upload Your Audio
				</h3>
				<p className="text-muted-foreground mb-3">
					Start by uploading an audio file or drag & drop it here.
					Supported formats include MP3, WAV, and more.
				</p>
				<div className="bg-muted/50 rounded-lg p-3 text-sm">
					<p className="font-medium text-foreground mb-1">
						💡 Pro Tip:
					</p>
					<p className="text-muted-foreground">
						You can also separate vocals from instrumentals after
						uploading!
					</p>
				</div>
			</div>
		),
		placement: 'top',
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="lyric-editor"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					✏️ Step 2: Create Your Lyrics
				</h3>
				<p className="text-muted-foreground mb-3">
					Add lyrics line by line here. Each line can have its own
					timestamp for perfect synchronization.
				</p>
				<div className="bg-muted/50 rounded-lg p-3 text-sm">
					<p className="font-medium text-foreground mb-1">
						🎯 Quick Actions:
					</p>
					<ul className="text-muted-foreground space-y-1">
						<li>
							• Click the timestamp button to sync with current
							audio time
						</li>
						<li>
							• Import existing LRC files using "Load from LRC"
						</li>
						<li>
							• Use the external lyrics section to paste bulk text
						</li>
					</ul>
				</div>
			</div>
		),
		placement: 'right',
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="lyrics-preview"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					👀 Step 3: Preview & Sync
				</h3>
				<p className="text-muted-foreground mb-3">
					Watch your lyrics come to life! The preview shows how your
					karaoke video will look.
				</p>
				<div className="bg-muted/50 rounded-lg p-3 text-sm">
					<p className="font-medium text-foreground mb-1">
						✨ Features:
					</p>
					<ul className="text-muted-foreground space-y-1">
						<li>
							• Click any lyric line to jump to that timestamp
						</li>
						<li>• Real-time synchronization with audio playback</li>
						<li>• Beautiful animations and transitions</li>
					</ul>
				</div>
			</div>
		),
		placement: 'left',
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="external-lyrics"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					📝 Step 4: Bulk Import (Optional)
				</h3>
				<p className="text-muted-foreground mb-3">
					Have lyrics ready? Paste them here and convert to individual
					lines instantly.
				</p>
				<div className="bg-muted/50 rounded-lg p-3 text-sm">
					<p className="font-medium text-foreground mb-1">
						⚡ Time Saver:
					</p>
					<p className="text-muted-foreground">
						Copy lyrics from any source and let the app split them
						into lines automatically.
					</p>
				</div>
			</div>
		),
		placement: 'top',
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="projects-drawer"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-2">
					💾 Step 5: Save & Manage Projects
				</h3>
				<p className="text-muted-foreground mb-3">
					Access your saved projects here. All your work is
					automatically saved as you go.
				</p>
				<div className="bg-muted/50 rounded-lg p-3 text-sm">
					<p className="font-medium text-foreground mb-1">
						🗂️ Project Management:
					</p>
					<ul className="text-muted-foreground space-y-1">
						<li>• Browse all your karaoke projects</li>
						<li>• Quick preview with cover art</li>
						<li>• Easy project switching</li>
					</ul>
				</div>
			</div>
		),
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: 'body',
		content: (
			<div className="text-center">
				<h2 className="text-xl font-semibold text-foreground mb-2">
					🎉 You're All Set!
				</h2>
				<p className="text-muted-foreground mb-4">
					You now know the basics of creating karaoke videos with
					Karaoke Milay.
				</p>
				<div className="bg-primary/10 rounded-lg p-4 mb-4">
					<p className="font-medium text-primary mb-2">
						🚀 Ready to Create?
					</p>
					<p className="text-sm text-muted-foreground">
						Start by uploading an audio file and adding your first
						lyrics!
					</p>
				</div>
				<p className="text-xs text-muted-foreground">
					You can restart this tour anytime from the help menu.
				</p>
			</div>
		),
		placement: 'center',
		disableBeacon: true,
		styles: {
			options: {
				width: 420,
				zIndex: 10000,
			},
		},
	},
];
