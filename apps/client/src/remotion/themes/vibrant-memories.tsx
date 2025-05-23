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
import type { LyricsProps } from '../schema';
import { useColorFlow } from '@/hooks/use-color-flow';

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

export const VibrantMemories: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'DM Serif Display, serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	highlightColor = 'var(--primary)',
	backgroundImage,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps, height } = useVideoConfig();

	// Use the color flow hook to extract colors from background image
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

	// Dynamic color assignments with warm, cinematic palette
	const dynBackgroundColor = theme ? colors.background : backgroundColor;
	const dynTextColor = theme ? colors.onSurface : textColor;
	const dynHighlightColor = theme ? colors.primary : highlightColor;

	// Find the current lyric
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	// Camera shake effect - organic, subtle movement
	const shakeX = Math.sin(frame / 15) * 3;
	const shakeY = Math.cos(frame / 17) * 2;

	// Film grain opacity that fluctuates gently
	const grainOpacity = interpolate(
		Math.sin(frame / 40),
		[-1, 1],
		[0.05, 0.12]
	);

	// Light leak effect that moves slowly
	const lightLeakPosition = (frame / 120) % 200;
	const lightLeakOpacity = interpolate(
		Math.sin(frame / 120),
		[-1, 1],
		[0.1, 0.25]
	);

	const renderLyrics = () => {
		if (currentLyricIndex === -1) return null;

		const currentLyric = lyrics[currentLyricIndex];
		const nextLyric = lyrics[currentLyricIndex + 1];

		// Calculate progress through current lyric
		const progress =
			(frame - currentLyric.startFrame) /
			(currentLyric.endFrame - currentLyric.startFrame);

		// Organic entrance animation with spring physics
		const entrance = spring({
			frame: frame - currentLyric.startFrame,
			fps,
			config: {
				damping: 12, // Less damping for more bouncy effect
				mass: 0.8,
				stiffness: 120,
			},
		});

		// Smooth, fade-like exit animation
		const exitStart = 0.85;
		const exitOpacity =
			progress > exitStart
				? interpolate(progress, [exitStart, 1], [1, 0])
				: 1;

		// Combined opacity
		const opacity = entrance * exitOpacity;

		// Wiggly text effect - subtle movement that varies with time
		const wiggle = Math.sin(frame / 8) * 1.5;
		const wiggleRotate = Math.sin(frame / 10) * 0.4;

		// Dreamier entrance with more dramatic transform
		const translateY = interpolate(entrance, [0, 1], [40, 0]);
		const scale = interpolate(entrance, [0, 1], [0.8, 1]);
		const rotate = interpolate(entrance, [0, 1], [1, 0]);

		return (
			<>
				{/* Current lyric with vintage cinematic styling */}
				<div
					style={{
						position: 'absolute',
						opacity,
						bottom: '30%',
						left: '50%',
						transform: `translateX(-50%) translateY(${translateY + wiggle}px) rotate(${wiggleRotate + rotate}deg) scale(${scale})`,
						textAlign: 'center',
						width: '90%',
						maxWidth: '1000px',
						padding: '2rem',
					}}
				>
					<p
						style={{
							fontSize: '4.5rem',
							fontWeight: 600,
							lineHeight: 1.1,
							color: dynTextColor,
							letterSpacing: '0.01em',
							textShadow: `0 4px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)`,
							margin: 0,
							fontFamily: fontFamily,
						}}
					>
						<span
							style={{
								color: dynHighlightColor,
								position: 'relative',
								display: 'inline-block',
								zIndex: 1,
								filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
							}}
						>
							{currentLyric.text}
						</span>
					</p>
				</div>

				{/* Next lyric with dreamy styling */}
				{nextLyric && (
					<p
						style={{
							position: 'absolute',
							opacity: 0.3 * exitOpacity, // Fades out with current lyric
							bottom: '20%',
							left: '50%',
							transform: `translateX(-50%) translateY(${wiggle / 2}px)`,
							textAlign: 'center',
							fontSize: '2.2rem',
							fontWeight: 400,
							lineHeight: 1.2,
							color: dynTextColor,
							letterSpacing: '0.03em',
							width: '90%',
							maxWidth: '1200px',
							margin: 0,
							textShadow: `0 2px 8px rgba(0,0,0,0.25)`,
						}}
					>
						<span>{nextLyric.text}</span>
					</p>
				)}
			</>
		);
	};

	// Get accent colors for cinematic look
	const accentColor1 = theme ? colors.primary : 'var(--chart-1)';
	const accentColor2 = theme ? colors.tertiary : 'var(--chart-2)';
	const accentColor3 = theme ? colors.secondary : 'var(--chart-4)';

	return (
		<AbsoluteFill
			style={{
				backgroundColor: dynBackgroundColor,
				fontFamily,
				overflow: 'hidden',
			}}
		>
			{/* Background image with subtle camera movement */}
			{backgroundImage && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
					}}
				>
					<Img
						src={backgroundImage}
						alt="Background"
						style={{
							width: '105%',
							height: '105%',
							objectFit: 'cover',
							objectPosition: 'center',
							filter: 'brightness(0.85) contrast(1.05)',
							transform: `translate(${shakeX}px, ${shakeY}px) scale(1.02)`,
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

			{/* Cinematic vignette overlay using theme colors */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(ellipse at center, transparent 30%, ${theme ? colors.background : 'var(--background)'}ee 100%)`,
					opacity: 0.9,
				}}
			/>

			{/* Dreamy gradient overlay with dynamic colors */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: theme
						? `linear-gradient(170deg, ${colors.surfaceVariant}80 0%, ${colors.background}cc 100%)`
						: `linear-gradient(170deg, var(--accent-muted) 0%, var(--background) 100%)`,
					opacity: 0.8,
					mixBlendMode: 'soft-light',
				}}
			/>

			{/* Film grain texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					opacity: grainOpacity,
					mixBlendMode: 'overlay',
				}}
			/>

			{/* Light leak effect with dynamic colors */}
			<div
				style={{
					position: 'absolute',
					top: -100 + lightLeakPosition,
					left: '10%',
					width: '80%',
					height: '200px',
					background: `radial-gradient(ellipse at center, ${accentColor1}99 0%, transparent 70%)`,
					opacity: lightLeakOpacity,
					mixBlendMode: 'soft-light',
					transform: 'rotate(-20deg) scale(2)',
					filter: 'blur(20px)',
				}}
			/>

			{/* Secondary light leak for additional dynamic color */}
			<div
				style={{
					position: 'absolute',
					bottom: -50 - lightLeakPosition / 2,
					right: '15%',
					width: '60%',
					height: '150px',
					background: `radial-gradient(ellipse at center, ${accentColor3}99 0%, transparent 70%)`,
					opacity: lightLeakOpacity * 0.7,
					mixBlendMode: 'soft-light',
					transform: 'rotate(15deg) scale(1.5)',
					filter: 'blur(25px)',
				}}
			/>

			{/* Film scratches - vertical lines */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${Math.random() * 100 + 100}px, rgba(255,255,255,0.03) ${Math.random() * 2 + 1}px, transparent ${Math.random() * 2 + 2}px)`,
					opacity: 0.2,
					mixBlendMode: 'overlay',
				}}
			/>

			{/* Horizontal film scratch that changes with time */}
			<div
				style={{
					position: 'absolute',
					top: Math.sin(frame / 200) * height * 0.3 + height * 0.5,
					left: 0,
					width: '100%',
					height: '1px',
					backgroundColor: 'rgba(255,255,255,0.4)',
					opacity: Math.random() > 0.995 ? 0.4 : 0, // Occasional flash
				}}
			/>

			{/* Subtle vintage frame border */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					boxShadow: `inset 0 0 0 1px ${theme ? colors.outline + '20' : 'rgba(255,255,255,0.05)'}`,
					pointerEvents: 'none',
				}}
			/>

			{/* Bottom decorative line with glow using theme colors */}
			<div
				style={{
					position: 'absolute',
					bottom: '12%',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '30%',
					height: '1px',
					background: `linear-gradient(90deg, transparent, ${accentColor1}80, ${accentColor2}80, transparent)`,
					opacity: interpolate(
						Math.sin(frame / 30),
						[-1, 1],
						[0.2, 0.5]
					),
					boxShadow: `0 0 10px ${accentColor1}60`,
				}}
			/>

			{renderLyrics()}
			{audioSrc && <Audio src={audioSrc} pauseWhenBuffering />}
		</AbsoluteFill>
	);
};
