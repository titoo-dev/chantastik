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
import type { LyricsProps } from './schema';
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

export const MyComposition: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	highlightColor = 'var(--primary)',
	backgroundImage,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

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
	const dynHighlightColor = theme ? colors.primary : highlightColor;

	// Find the current lyric
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	const renderLyrics = () => {
		if (currentLyricIndex === -1) return null;

		const currentLyric = lyrics[currentLyricIndex];
		const nextLyric = lyrics[currentLyricIndex + 1];

		// Calculate progress through current lyric
		const progress =
			(frame - currentLyric.startFrame) /
			(currentLyric.endFrame - currentLyric.startFrame);

		// Modern entrance animation with spring physics
		const entrance = spring({
			frame: frame - currentLyric.startFrame,
			fps,
			config: {
				damping: 16,
				mass: 0.9,
				stiffness: 150,
			},
		});

		// Smooth exit animation
		const exitStart = 0.85;
		const exitOpacity =
			progress > exitStart
				? interpolate(progress, [exitStart, 1], [1, 0])
				: 1;

		// Combined opacity
		const opacity = entrance * exitOpacity;

		// Subtle entrance transform
		const translateY = interpolate(entrance, [0, 1], [25, 0]);
		const scale = interpolate(entrance, [0, 1], [0.92, 1]);

		return (
			<>
				{/* Current lyric with shadcn-inspired styling */}
				<p
					style={{
						position: 'absolute',
						opacity,
						bottom: '30%',
						left: '50%',
						transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
						textAlign: 'center',
						fontSize: '4rem',
						fontWeight: 700,
						lineHeight: 1.2,
						color: dynTextColor,
						letterSpacing: '-0.02em',
						width: '90%',
						maxWidth: '1200px',
						textShadow: theme
							? `0 2px 10px ${colors.background}80`
							: `0 2px 8px rgba(0,0,0,0.15)`,
						margin: 0,
						padding: '1.5rem',
						borderRadius: '1rem',
					}}
				>
					<span
						style={{
							color: dynHighlightColor,
							fontWeight: 800,
							position: 'relative',
							display: 'inline-block',
							zIndex: 1,
							textDecoration: theme
								? `underline 4px ${colors.primary}80`
								: 'none',
							textUnderlineOffset: '8px',
							paddingBottom: '4px',
						}}
					>
						{currentLyric.text}
					</span>
				</p>
				{/* Next lyric with low opacity */}
				{nextLyric && (
					<p
						style={{
							position: 'absolute',
							opacity: 0.3, // Low opacity for next line
							bottom: '22%', // Below the current lyric
							left: '50%',
							transform: 'translateX(-50%)',
							textAlign: 'center',
							fontSize: '2.5rem', // Smaller than current lyric
							fontWeight: 500,
							lineHeight: 1.2,
							color: dynTextColor,
							letterSpacing: '-0.02em',
							width: '90%',
							maxWidth: '1200px',
							margin: 0,
						}}
					>
						<span>{nextLyric.text}</span>
					</p>
				)}
			</>
		);
	};

	// Get accent colors from dynamic theme or fall back to CSS variables
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
			{/* Background image with minimal movement */}
			{backgroundImage && (
				<Img
					src={backgroundImage}
					alt="Background"
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'center',
						filter: 'brightness(0.9)',
					}}
					pauseWhenLoading
					onError={(e) => {
						console.error('Error loading image:', e);
						// Fallback to a default image or color
						e.currentTarget.src =
							'https://example.com/default-image.jpg'; // Replace with your default image URL
					}}
				/>
			)}
			{/* Modern gradient overlay with dynamic colors */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: theme
						? `linear-gradient(180deg, ${colors.surfaceVariant}80 0%, ${colors.background}cc 100%)`
						: `linear-gradient(135deg, var(--background), var(--accent))`,
					opacity: 0.85,
					backdropFilter: 'blur(8px)',
				}}
			/>
			{/* Modern minimalist patterns */}
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					opacity: 0.08,
				}}
			>
				{/* Abstract shapes */}
				<path
					d={`M${width * 0.8},${height * 0.2} Q${width * 0.9},${height * 0.15} ${width * 0.85},${height * 0.3}`}
					stroke={accentColor1}
					strokeWidth="3"
					fill="none"
				/>
				<path
					d={`M${width * 0.2},${height * 0.7} Q${width * 0.3},${height * 0.85} ${width * 0.1},${height * 0.8}`}
					stroke={accentColor2}
					strokeWidth="3"
					fill="none"
				/>

				{/* Floating circles */}
				<circle
					cx={width * 0.85}
					cy={height * 0.15}
					r={width * 0.02}
					fill={accentColor1}
					opacity="0.6"
				/>
				<circle
					cx={width * 0.15}
					cy={height * 0.85}
					r={width * 0.015}
					fill={accentColor2}
					opacity="0.6"
				/>
				<circle
					cx={width * 0.75}
					cy={height * 0.7}
					r={width * 0.01}
					fill={accentColor3}
					opacity="0.6"
				/>
			</svg>
			{/* Animated gradient bar */}
			<div
				style={{
					position: 'absolute',
					bottom: '100px',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '40%',
					height: '2px',
					background: `linear-gradient(90deg, transparent, ${accentColor1}, ${accentColor2}, transparent)`,
					opacity: interpolate(
						Math.sin(frame / 30),
						[-1, 1],
						[0.3, 0.6]
					),
					borderRadius: '1px',
				}}
			/>
			{/* Subtle dot pattern with dynamic colors */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: theme
						? `radial-gradient(${colors.onSurfaceVariant}20 1px, transparent 1px), radial-gradient(${colors.onSurface}10 1px, transparent 1px)`
						: `radial-gradient(var(--chart-3) 1px, transparent 1px), radial-gradient(var(--chart-5) 1px, transparent 1px)`,
					backgroundSize: '40px 40px, 30px 30px',
					backgroundPosition: '0 0, 20px 20px',
					opacity: 0.05,
				}}
			/>
			{renderLyrics()}
			{audioSrc && <Audio src={audioSrc} pauseWhenBuffering />}
		</AbsoluteFill>
	);
};
