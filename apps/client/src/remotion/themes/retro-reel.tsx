import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
	Audio,
	Img,
} from 'remotion';
import { useColorFlow } from '@/hooks/use-color-flow';
import type { LyricsProps } from '../schema';

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

export const RetroReel: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	backgroundImage,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// Determine aspect ratio
	const aspectRatio = width / height;
	const isVertical = aspectRatio < 1; // Vertical if width < height

	// Use the color flow hook instead of local implementation
	const theme = useColorFlow();

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

	// Find the current lyric
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
					minWidth: '250px',
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

		// Calculate progress through current lyric
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
							lineHeight: isVertical ? 1.2 : 1.1,
							color: dynTextColor,
							letterSpacing: '-0.03em',
							margin: 0,
							padding: responsiveStyles.currentLyric.padding,
							borderRadius: isVertical ? '1rem' : '1.5rem',
							background: theme
								? `linear-gradient(135deg, ${colors.surface}90, ${colors.surfaceVariant}80)`
								: 'rgba(0,0,0,0.7)',
							backdropFilter: 'blur(20px)',
							border: theme
								? `2px solid ${colors.primary}40`
								: '2px solid rgba(255,255,255,0.2)',
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
							opacity: 0.25,
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
					<Img
						src={backgroundImage}
						alt="Background"
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							objectPosition: 'center',
							filter: 'brightness(0.7) contrast(1.1) sepia(0.1)',
						}}
						pauseWhenLoading
						onError={(e) => {
							console.error('Error loading image:', e);
							e.currentTarget.src =
								'https://example.com/default-image.jpg';
						}}
					/>
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

			{renderLyrics()}
			{audioSrc && <Audio src={audioSrc} pauseWhenBuffering />}
		</AbsoluteFill>
	);
};
