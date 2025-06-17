import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
	Audio,
	Img,
	Sequence,
	Series,
} from 'remotion';

interface LyricsProps {
	lyrics: Array<{
		text: string;
		startFrame: number;
		endFrame: number;
	}>;
	fontFamily?: string;
	backgroundColor?: string;
	textColor?: string;
	highlightColor?: string;
	backgroundImage?: string;
	audioSrc?: string;
	theme?: {
		dark: {
			primary: string;
			secondary: string;
			tertiary: string;
			background: string;
			surface: string;
			surfaceVariant: string;
			outline: string;
			onBackground: string;
			onSurface: string;
			onSurfaceVariant: string;
			error: string;
		};
	} | null;
}

// Default color palette to use if no theme is available
const DEFAULT_COLORS = {
	primary: '#3b82f6',
	onPrimary: '#ffffff',
	primaryContainer: '#d1e0ff',
	secondary: '#7c5800',
	onSecondary: '#ffffff',
	secondaryContainer: '#ffdf94',
	tertiary: '#006875',
	onTertiary: '#ffffff',
	tertiaryContainer: '#95f0ff',
	background: '#121212',
	surface: '#1e1e1e',
	surfaceVariant: '#292929',
	outline: '#74777f',
	onBackground: '#e3e3e3',
	onSurface: '#ffffff',
	onSurfaceVariant: '#c5c6d0',
	error: '#ba1a1a',
};

export interface ExtendedLyricsProps extends LyricsProps {
	songTitle?: string;
	artist?: string;
	welcomeDurationInFrames?: number;
	endingDurationInFrames?: number;
}

const WelcomeScene: React.FC<{
	title: string;
	artist?: string;
	colors: any;
	isVertical: boolean;
	backgroundImage?: string;
	fontFamily?: string;
}> = ({ title, artist, colors, isVertical, backgroundImage, fontFamily }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Entrance animations with smooth spring transitions
	const titleAnimation = spring({
		frame,
		fps,
		config: {
			damping: 10,
			mass: 1.5,
			stiffness: 120,
		},
	});

	const artistAnimation = spring({
		frame: frame - 20,
		fps,
		config: {
			damping: 12,
			mass: 1.2,
			stiffness: 100,
		},
	});

	// Exit transition for smooth series transition
	const exitTransition = spring({
		frame: frame - 60, // Start exit animation 2s before end
		fps,
		config: {
			damping: 8,
			mass: 1,
			stiffness: 150,
		},
	});

	// Parallax effect for background
	const parallaxOffset = interpolate(
		Math.sin(frame / 120),
		[-1, 1],
		[-10, 10]
	);

	// Floating animation for title
	const floatY = interpolate(Math.sin(frame / 30), [-1, 1], [-8, 8]);

	// Scale and fade for exit
	const exitScale = interpolate(exitTransition, [0, 1], [1, 0.8]);
	const exitOpacity = interpolate(exitTransition, [0, 1], [1, 0]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.background,
				fontFamily,
				overflow: 'hidden',
			}}
		>
			{/* Background image with parallax effect - same as main scene */}{' '}
			{backgroundImage && (
				<div
					style={{
						position: 'absolute',
						width: '110%',
						height: '110%',
						left: '-5%',
						top: '-5%',
						transform: `translate(${parallaxOffset}px, ${parallaxOffset * 0.7}px) scale(1.1)`,
					}}
				>
					<Sequence premountFor={100}>
						<Img
							src={backgroundImage}
							alt="Background"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								objectPosition: 'center',
								filter: 'brightness(0.4) contrast(1.2) sepia(0.15)',
							}}
							pauseWhenLoading
						/>
					</Sequence>
				</div>
			)}
			{/* Vintage film grain overlay - same as main scene */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(180deg, ${colors.background}40 0%, ${colors.surfaceVariant}90 100%)`,
					opacity: 0.9,
					mixBlendMode: 'multiply',
				}}
			/>
			{/* Animated film grain texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `
						radial-gradient(circle at ${25 + (frame % 50)}% ${30 + (frame % 30)}%, rgba(255,255,255,0.08) 1px, transparent 1px),
						radial-gradient(circle at ${75 - (frame % 40)}% ${70 - (frame % 35)}%, rgba(255,255,255,0.03) 1px, transparent 1px)
					`,
					backgroundSize: '100px 100px, 150px 150px',
					opacity: 0.4,
				}}
			/>
			{/* Vintage vignette effect */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.4) 100%)',
					pointerEvents: 'none',
				}}
			/>
			{/* Content */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '2rem',
					opacity: exitOpacity,
					transform: `scale(${exitScale}) translateY(${floatY}px)`,
				}}
			>
				<h1
					style={{
						fontSize: isVertical ? '3.5rem' : '6rem',
						fontWeight: 900,
						textAlign: 'center',
						margin: 0,
						opacity: titleAnimation,
						transform: `scale(${titleAnimation}) rotate(${interpolate(titleAnimation, [0, 1], [-2, 0])}deg)`,
						background: `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary}, ${colors.secondary})`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						color: 'transparent',
						padding: '2rem',
						maxWidth: '85%',
						textShadow: `0 4px 30px ${colors.primary}60`,
						lineHeight: 1.1,
						letterSpacing: '-0.02em',
					}}
				>
					{title}
				</h1>
				{artist && (
					<div
						style={{
							opacity: artistAnimation,
							transform: `translateY(${(1 - artistAnimation) * 30}px) scale(${artistAnimation})`,
						}}
					>
						<p
							style={{
								fontSize: isVertical ? '1.8rem' : '2.5rem',
								fontWeight: 600,
								color: colors.onSurface,
								background: `linear-gradient(135deg, ${colors.surface}95, ${colors.surfaceVariant}85)`,
								padding: '1.5rem 3rem',
								borderRadius: '3rem',
								backdropFilter: 'blur(15px)',
								border: `2px solid ${colors.primary}30`,
								boxShadow: `0 15px 35px ${colors.background}80, inset 0 1px 0 ${colors.onSurface}15`,
								margin: 0,
								letterSpacing: '0.01em',
							}}
						>
							by {artist}
						</p>
					</div>
				)}

				{/* Decorative elements */}
				<div
					style={{
						position: 'absolute',
						bottom: '15%',
						left: '50%',
						transform: 'translateX(-50%)',
						opacity: interpolate(titleAnimation, [0, 1], [0, 0.3]),
					}}
				>
					<div
						style={{
							width: isVertical ? '60px' : '80px',
							height: '2px',
							background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
							animation: 'pulse 2s ease-in-out infinite',
						}}
					/>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const EndingScene: React.FC<{
	title: string;
	artist?: string;
	colors: any;
	isVertical: boolean;
	backgroundImage?: string;
	fontFamily?: string;
}> = ({ title, artist, colors, isVertical, backgroundImage, fontFamily }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Entrance animations
	const fadeIn = spring({
		frame: frame - 10,
		fps,
		config: {
			damping: 12,
			mass: 1.5,
			stiffness: 100,
		},
	});

	const titleEntrance = spring({
		frame: frame - 20,
		fps,
		config: {
			damping: 10,
			mass: 1.2,
			stiffness: 120,
		},
	});

	const artistEntrance = spring({
		frame: frame - 35,
		fps,
		config: {
			damping: 15,
			stiffness: 80,
		},
	});

	// Parallax effect for background
	const parallaxOffset = interpolate(Math.sin(frame / 120), [-1, 1], [-8, 8]);

	// Gentle floating animation
	const floatY = interpolate(Math.sin(frame / 40), [-1, 1], [-6, 6]);

	// Pulsing glow effect
	const glowIntensity = interpolate(
		Math.sin(frame / 20),
		[-1, 1],
		[0.3, 0.7]
	);
	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.background,
				fontFamily,
				overflow: 'hidden',
			}}
		>
			{/* Background image with parallax effect - same as main scene */}{' '}
			{backgroundImage && (
				<div
					style={{
						position: 'absolute',
						width: '110%',
						height: '110%',
						left: '-5%',
						top: '-5%',
						transform: `translate(${parallaxOffset}px, ${parallaxOffset * 0.7}px) scale(1.1)`,
					}}
				>
					<Sequence premountFor={100}>
						<Img
							src={backgroundImage}
							alt="Background"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								objectPosition: 'center',
								filter: 'brightness(0.3) contrast(1.3) sepia(0.2)',
							}}
							pauseWhenLoading
						/>
					</Sequence>
				</div>
			)}
			{/* Vintage film grain overlay - same as main scene */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(180deg, ${colors.background}50 0%, ${colors.surfaceVariant}95 100%)`,
					opacity: 0.95,
					mixBlendMode: 'multiply',
				}}
			/>
			{/* Animated film grain texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `
						radial-gradient(circle at ${25 + (frame % 50)}% ${30 + (frame % 30)}%, rgba(255,255,255,0.06) 1px, transparent 1px),
						radial-gradient(circle at ${75 - (frame % 40)}% ${70 - (frame % 35)}%, rgba(255,255,255,0.02) 1px, transparent 1px)
					`,
					backgroundSize: '100px 100px, 150px 150px',
					opacity: 0.5,
				}}
			/>
			{/* Vintage vignette effect */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'radial-gradient(ellipse at center, transparent 5%, rgba(0,0,0,0.5) 100%)',
					pointerEvents: 'none',
				}}
			/>
			{/* Content */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '2rem',
					opacity: fadeIn,
					transform: `translateY(${floatY}px)`,
				}}
			>
				<div
					style={{
						fontSize: isVertical ? '1.8rem' : '2.5rem',
						color: colors.onSurfaceVariant,
						marginBottom: '1.5rem',
						opacity: fadeIn * 0.8,
						fontWeight: 300,
						letterSpacing: '0.05em',
						textAlign: 'center',
						background: `${colors.surface}60`,
						padding: '1rem 2.5rem',
						borderRadius: '2rem',
						backdropFilter: 'blur(12px)',
						border: `1px solid ${colors.outline}30`,
					}}
				>
					Thanks for watching
				</div>

				<h2
					style={{
						fontSize: isVertical ? '3rem' : '5rem',
						fontWeight: 900,
						textAlign: 'center',
						margin: 0,
						opacity: titleEntrance,
						transform: `scale(${titleEntrance}) translateY(${(1 - titleEntrance) * 20}px)`,
						background: `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary}, ${colors.secondary})`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						color: 'transparent',
						padding: '1rem',
						maxWidth: '85%',
						textShadow: `0 4px 25px ${colors.primary}${Math.floor(glowIntensity * 100)}`,
						lineHeight: 1.1,
						letterSpacing: '-0.02em',
					}}
				>
					{title}
				</h2>

				{artist && (
					<div
						style={{
							opacity: artistEntrance,
							transform: `translateY(${(1 - artistEntrance) * 15}px) scale(${artistEntrance})`,
						}}
					>
						<p
							style={{
								fontSize: isVertical ? '1.5rem' : '2rem',
								color: colors.onSurface,
								fontWeight: 500,
								margin: 0,
								background: `linear-gradient(135deg, ${colors.surface}85, ${colors.surfaceVariant}75)`,
								padding: '1.2rem 2.5rem',
								borderRadius: '2.5rem',
								backdropFilter: 'blur(15px)',
								border: `2px solid ${colors.primary}25`,
								boxShadow: `0 12px 30px ${colors.background}70, inset 0 1px 0 ${colors.onSurface}10`,
								letterSpacing: '0.01em',
							}}
						>
							by {artist}
						</p>
					</div>
				)}

				{/* Decorative sparkle elements */}
				<div
					style={{
						position: 'absolute',
						top: '20%',
						left: '20%',
						opacity: interpolate(fadeIn, [0, 1], [0, 0.4]),
						transform: `rotate(${frame * 0.5}deg)`,
					}}
				>
					<div
						style={{
							width: '3px',
							height: '20px',
							background: colors.tertiary,
							borderRadius: '2px',
						}}
					/>
					<div
						style={{
							width: '20px',
							height: '3px',
							background: colors.tertiary,
							borderRadius: '2px',
							transform: 'translateY(-11.5px)',
						}}
					/>
				</div>

				<div
					style={{
						position: 'absolute',
						top: '30%',
						right: '25%',
						opacity: interpolate(fadeIn, [0, 1], [0, 0.3]),
						transform: `rotate(${frame * -0.3}deg)`,
					}}
				>
					<div
						style={{
							width: '2px',
							height: '15px',
							background: colors.primary,
							borderRadius: '2px',
						}}
					/>
					<div
						style={{
							width: '15px',
							height: '2px',
							background: colors.primary,
							borderRadius: '2px',
							transform: 'translateY(-8.5px)',
						}}
					/>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Separate component for the main lyrics content
const LyricsContent: React.FC<
	Omit<
		ExtendedLyricsProps,
		| 'songTitle'
		| 'artist'
		| 'welcomeDurationInFrames'
		| 'endingDurationInFrames'
	>
> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	backgroundImage,
	theme,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();
	const isVertical = width / height < 1;

	// Create a color scheme based on the theme or use defaults
	const colors = React.useMemo(() => {
		if (!theme) return DEFAULT_COLORS;

		return {
			primary: theme.dark.primary,
			onPrimary: theme.dark.primary,
			primaryContainer: theme.dark.primary,
			secondary: theme.dark.secondary,
			onSecondary: theme.dark.secondary,
			secondaryContainer: theme.dark.secondary,
			tertiary: theme.dark.tertiary,
			onTertiary: theme.dark.tertiary,
			tertiaryContainer: theme.dark.tertiary,
			background: theme.dark.background,
			surface: theme.dark.surface,
			surfaceVariant: theme.dark.surfaceVariant,
			outline: theme.dark.outline,
			onBackground: theme.dark.onBackground,
			onSurface: theme.dark.onSurface,
			onSurfaceVariant: theme.dark.onSurfaceVariant,
			error: theme.dark.error,
		};
	}, [theme]);

	// Dynamic color assignments
	const dynBackgroundColor = theme ? colors.background : backgroundColor;
	const dynTextColor = theme ? colors.onSurface : textColor;
	// Find the current lyric - adjusted for welcome scene offset
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	// Parallax effect for background
	const parallaxOffset = interpolate(
		Math.sin(frame / 120),
		[-1, 1],
		[-10, 10]
	);

	// Responsive sizing based on aspect ratio
	const getResponsiveStyles = () => {
		if (isVertical) {
			// Vertical (TikTok) format
			return {
				currentLyric: {
					fontSize: '2.5rem',
					padding: '1.5rem 2rem',
					maxWidth: '90%',
					minWidth: '400px',
					top: '60%', // Lower position for vertical
				},
				nextLyric: {
					fontSize: '1.5rem',
					bottom: '10%',
					width: '85%',
					padding: '0.8rem',
				},
			};
		} else {
			// Horizontal (YouTube) format
			return {
				currentLyric: {
					fontSize: '3.5rem',
					padding: '2rem 3rem',
					maxWidth: '800px',
					minWidth: '300px',
					top: '50%', // Centered for horizontal
				},
				nextLyric: {
					fontSize: '2rem',
					bottom: '2%',
					width: '80%',
					padding: '1rem',
				},
			};
		}
	};

	const responsiveStyles = getResponsiveStyles();

	const renderLyrics = () => {
		if (currentLyricIndex === -1) return null;
		const currentLyric = lyrics[currentLyricIndex];
		const nextLyric = lyrics[currentLyricIndex + 1];

		// Calculate progress through current lyric using original lyric timing
		const progress =
			(frame - currentLyric.startFrame) /
			(currentLyric.endFrame - currentLyric.startFrame);

		// Enhanced spring animation with vintage feel
		const entrance = spring({
			frame: frame - currentLyric.startFrame,
			fps,
			config: {
				damping: 12,
				mass: 1.2,
				stiffness: 100,
			},
		});

		// Smooth fade out animation
		const exitStart = 0.8;
		const fadeOut =
			progress > exitStart
				? interpolate(progress, [exitStart, 1], [1, 0], {
						easing: (t) => 1 - Math.pow(1 - t, 3),
					})
				: 1;

		// Combined opacity with subtle pulsing
		const pulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.9, 1]);
		const opacity = entrance * fadeOut * pulse;

		// Dynamic scale and rotation for vintage feel
		const scale = interpolate(entrance, [0, 1], [0.7, 1], {
			easing: (t) => 1 - Math.pow(1 - t, 2),
		});

		const rotation = interpolate(entrance, [0, 1], [-5, 0]);

		// Subtle floating animation - reduced for vertical format
		const floatIntensity = isVertical ? 4 : 8;
		const floatY = interpolate(
			Math.sin((frame + currentLyricIndex * 30) / 25),
			[-1, 1],
			[-floatIntensity, floatIntensity]
		);

		return (
			<>
				{/* Current lyric positioned based on aspect ratio */}
				<div
					style={{
						position: 'absolute',
						opacity,
						left: '50%',
						top: responsiveStyles.currentLyric.top,
						transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${scale}) rotate(${rotation}deg)`,
						textAlign: 'center',
						zIndex: 10,
					}}
				>
					<p
						style={{
							fontSize: responsiveStyles.currentLyric.fontSize,
							fontWeight: 800,
							lineHeight: isVertical ? 1.4 : 1.3,
							color: dynTextColor,
							letterSpacing: '-0.03em',
							margin: 0,
							padding: responsiveStyles.currentLyric.padding,
							borderRadius: isVertical ? '1rem' : '1.5rem',
							background: theme
								? `linear-gradient(135deg, ${colors.surface}90, ${colors.surfaceVariant}80)`
								: 'rgba(0,0,0,0.7)',
							border: theme
								? `2px solid ${colors.primary}40`
								: '2px solid rgba(255,255,255,0.2)',
							backdropFilter: 'blur(1px)',
							boxShadow: theme
								? `0 20px 40px ${colors.background}60, inset 0 1px 0 ${colors.onSurface}20`
								: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
							textShadow: '0 2px 10px rgba(0,0,0,0.3)',
							maxWidth: responsiveStyles.currentLyric.maxWidth,
							minWidth: responsiveStyles.currentLyric.minWidth,
						}}
					>
						<span
							style={{
								background: theme
									? `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary})`
									: 'linear-gradient(135deg, var(--primary), var(--accent))',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								color: 'transparent',
								position: 'relative',
								display: 'inline-block',
							}}
						>
							{currentLyric.text}
						</span>
					</p>
				</div>

				{/* Next lyric with aspect ratio specific positioning */}
				{nextLyric && (
					<p
						style={{
							position: 'absolute',
							opacity: 0.5,
							bottom: responsiveStyles.nextLyric.bottom,
							left: '50%',
							transform: 'translateX(-50%)',
							textAlign: 'center',
							fontSize: responsiveStyles.nextLyric.fontSize,
							fontWeight: 400,
							lineHeight: isVertical ? 1.4 : 1.3,
							color: dynTextColor,
							letterSpacing: '-0.01em',
							width: responsiveStyles.nextLyric.width,
							maxWidth: isVertical ? '350px' : '900px',
							margin: 0,
							padding: responsiveStyles.nextLyric.padding,
							borderRadius: isVertical ? '0.5rem' : '0.75rem',
							background: theme
								? `${colors.surface}40`
								: 'rgba(255,255,255,0.1)',
							backdropFilter: 'blur(10px)',
						}}
					>
						{nextLyric.text}
					</p>
				)}
			</>
		);
	};

	// If theme is null, we are still loading the dynamic colors
	if (theme === null) {
		return <AbsoluteFill style={{ backgroundColor: backgroundColor }} />;
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: dynBackgroundColor,
				fontFamily,
				overflow: 'hidden',
			}}
		>
			{/* Background image with parallax effect */}
			{backgroundImage && (
				<div
					style={{
						position: 'absolute',
						width: '110%',
						height: '110%',
						left: '-5%',
						top: '-5%',
						transform: `translate(${parallaxOffset}px, ${parallaxOffset * 0.7}px) scale(1.1)`,
					}}
				>
					<Sequence premountFor={100}>
						<Img
							src={backgroundImage}
							alt="Background"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								objectPosition: 'top center',
								filter: 'brightness(0.7) contrast(1.1) sepia(0.1)',
							}}
							pauseWhenLoading
						/>
					</Sequence>
				</div>
			)}

			{/* Vintage film grain overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: theme
						? `linear-gradient(180deg, ${colors.background}60 0%, ${colors.surfaceVariant}80 100%)`
						: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
					opacity: 0.8,
					mixBlendMode: 'multiply',
				}}
			/>

			{/* Animated film grain texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `
                        radial-gradient(circle at ${25 + (frame % 50)}% ${30 + (frame % 30)}%, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle at ${75 - (frame % 40)}% ${70 - (frame % 35)}%, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
					backgroundSize: '100px 100px, 150px 150px',
					opacity: 0.3,
				}}
			/>

			{/* Vintage vignette effect */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 100%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Main Lyrics Scene */}
			{renderLyrics()}
		</AbsoluteFill>
	);
};

// Main RetroReel component using Series
const RetroReel: React.FC<ExtendedLyricsProps> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	backgroundImage,
	audioSrc,
	theme,
	songTitle,
	artist,
	welcomeDurationInFrames = 90, // 3 seconds at 30fps
	endingDurationInFrames = 90,
}) => {
	const { width, height } = useVideoConfig();
	const isVertical = width / height < 1;

	// Create a color scheme based on the theme or use defaults
	const colors = React.useMemo(() => {
		if (!theme) return DEFAULT_COLORS;
		return {
			primary: theme.dark.primary,
			onPrimary: theme.dark.primary,
			primaryContainer: theme.dark.primary,
			secondary: theme.dark.secondary,
			onSecondary: theme.dark.secondary,
			secondaryContainer: theme.dark.secondary,
			tertiary: theme.dark.tertiary,
			onTertiary: theme.dark.tertiary,
			tertiaryContainer: theme.dark.tertiary,
			background: theme.dark.background,
			surface: theme.dark.surface,
			surfaceVariant: theme.dark.surfaceVariant,
			outline: theme.dark.outline,
			onBackground: theme.dark.onBackground,
			onSurface: theme.dark.onSurface,
			onSurfaceVariant: theme.dark.onSurfaceVariant,
			error: theme.dark.error,
		};
	}, [theme]);

	// Calculate total lyrics duration
	const lyricsDuration =
		lyrics.length > 0 ? lyrics[lyrics.length - 1].endFrame : 0;

	if (theme === null) {
		// If theme is null, we are still loading the dynamic colors
		return <AbsoluteFill style={{ backgroundColor: backgroundColor }} />;
	}

	return (
		<AbsoluteFill>
			{' '}
			<Series>
				{/* Welcome Scene */}
				{songTitle && (
					<Series.Sequence durationInFrames={welcomeDurationInFrames}>
						<WelcomeScene
							title={songTitle}
							artist={artist}
							colors={colors}
							isVertical={isVertical}
							backgroundImage={backgroundImage}
							fontFamily={fontFamily}
						/>
					</Series.Sequence>
				)}

				{/* Main Lyrics Scene */}
				<Series.Sequence durationInFrames={lyricsDuration}>
					{' '}
					<LyricsContent
						lyrics={lyrics}
						fontFamily={fontFamily}
						backgroundColor={backgroundColor}
						textColor={textColor}
						backgroundImage={backgroundImage}
						theme={theme}
						highlightColor={''}
					/>
				</Series.Sequence>

				{/* Ending Scene */}
				{songTitle && (
					<Series.Sequence durationInFrames={endingDurationInFrames}>
						<EndingScene
							title={songTitle}
							artist={artist}
							colors={colors}
							isVertical={isVertical}
							backgroundImage={backgroundImage}
							fontFamily={fontFamily}
						/>
					</Series.Sequence>
				)}
			</Series>{' '}
			{/* Audio plays throughout the entire composition, starting from welcome scene */}
			{audioSrc && (
				<Audio src={audioSrc} startFrom={welcomeDurationInFrames} />
			)}
		</AbsoluteFill>
	);
};

export default RetroReel;
