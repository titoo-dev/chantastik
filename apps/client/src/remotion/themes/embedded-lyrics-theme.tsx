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
	primary: '#1ed760',
	onPrimary: '#ffffff',
	primaryContainer: '#d1e0ff',
	secondary: '#ff6b35',
	onSecondary: '#ffffff',
	secondaryContainer: '#ffdf94',
	tertiary: '#8a2be2',
	onTertiary: '#ffffff',
	tertiaryContainer: '#95f0ff',
	background: '#121212',
	surface: '#181818',
	surfaceVariant: '#242424',
	outline: '#535353',
	onBackground: '#ffffff',
	onSurface: '#ffffff',
	onSurfaceVariant: '#b3b3b3',
	error: '#f25555',
};

export const EmbeddedLyricsTheme: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'var(--background)',
	textColor = 'var(--foreground)',
	backgroundImage,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// Determine aspect ratio for responsive design
	const aspectRatio = width / height;
	const isVertical = aspectRatio < 1;

	// Use the color flow hook for dynamic theming
	const theme = useColorFlow();

	// Create color scheme based on theme or use defaults
	const colors = React.useMemo(() => {
		if (!theme) return DEFAULT_COLORS;

		return {
			primary: theme.dark.primary,
			onPrimary: theme.dark.onPrimary,
			primaryContainer: theme.dark.primaryContainer,
			secondary: theme.dark.secondary,
			onSecondary: theme.dark.onSecondary,
			secondaryContainer: theme.dark.secondaryContainer,
			tertiary: theme.dark.tertiary,
			onTertiary: theme.dark.onTertiary,
			tertiaryContainer: theme.dark.tertiaryContainer,
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
	const cardBackgroundColor = theme ? colors.surface : '#1a1a1a';
	const accentColor = theme ? colors.primary : '#1ed760';

	// Find the current lyric
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	// Parallax effects for background
	const parallaxX = interpolate(Math.sin(frame / 180), [-1, 1], [-15, 15]);
	const parallaxY = interpolate(Math.cos(frame / 220), [-1, 1], [-8, 8]);

	// Wave effect for the embedded card
	const waveOffset = interpolate(Math.sin(frame / 60), [-1, 1], [-5, 5]);

	// Floating animation for the card
	const cardFloat = interpolate(Math.sin(frame / 90), [-1, 1], [-3, 3]);

	// Responsive card dimensions
	const getCardDimensions = () => {
		if (isVertical) {
			return {
				width: '85%',
				maxWidth: '350px',
				padding: '2rem 1.5rem',
				borderRadius: '1.5rem',
				currentFontSize: '2rem',
				nextFontSize: '1.2rem',
			};
		} else {
			return {
				width: '70%',
				maxWidth: '600px',
				padding: '3rem 2.5rem',
				borderRadius: '2rem',
				currentFontSize: '2.8rem',
				nextFontSize: '1.6rem',
			};
		}
	};

	const cardDimensions = getCardDimensions();

	// Generate wave path for SVG
	const generateWavePath = (
		amplitude: number,
		frequency: number,
		phase: number
	) => {
		const points: string[] = [];
		const step = 2;

		for (let x = 0; x <= width; x += step) {
			const y =
				amplitude * Math.sin(x * frequency + phase) + height * 0.8;
			points.push(`${x},${y}`);
		}

		return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
	};

	const renderLyrics = () => {
		if (currentLyricIndex === -1) return null;

		const currentLyric = lyrics[currentLyricIndex];
		const nextLyric = lyrics[currentLyricIndex + 1];

		// Calculate progress through current lyric
		const progress =
			(frame - currentLyric.startFrame) /
			(currentLyric.endFrame - currentLyric.startFrame);

		// Spring entrance animation
		const entrance = spring({
			frame: frame - currentLyric.startFrame,
			fps,
			config: {
				damping: 18,
				mass: 1,
				stiffness: 120,
			},
		});

		// Smooth exit animation
		const exitStart = 0.85;
		const fadeOut =
			progress > exitStart
				? interpolate(progress, [exitStart, 1], [1, 0], {
						easing: (t) => 1 - Math.pow(1 - t, 3),
					})
				: 1;

		// Combined opacity with subtle pulsing
		const pulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.95, 1]);
		const opacity = entrance * fadeOut * pulse;

		// Scale animation for entrance
		const scale = interpolate(entrance, [0, 1], [0.9, 1], {
			easing: (t) => 1 - Math.pow(1 - t, 2),
		});

		return (
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: `translate(-50%, -50%) translateY(${cardFloat}px) scale(${scale})`,
					width: cardDimensions.width,
					maxWidth: cardDimensions.maxWidth,
					background: `linear-gradient(135deg, ${cardBackgroundColor}f0, ${colors.surfaceVariant}e0)`,
					backdropFilter: 'blur(20px) saturate(1.2)',
					borderRadius: cardDimensions.borderRadius,
					padding: cardDimensions.padding,
					border: `1px solid ${theme ? colors.outline + '40' : 'rgba(255,255,255,0.1)'}`,
					boxShadow: `
						0 8px 32px rgba(0,0,0,0.3),
						0 2px 16px rgba(0,0,0,0.2),
						inset 0 1px 0 rgba(255,255,255,0.1)
					`,
					opacity,
					zIndex: 10,
				}}
			>
				{/* Card glow effect */}
				<div
					style={{
						position: 'absolute',
						top: '-2px',
						left: '-2px',
						right: '-2px',
						bottom: '-2px',
						background: `linear-gradient(135deg, ${accentColor}40, ${colors.tertiary || '#8a2be2'}30)`,
						borderRadius: cardDimensions.borderRadius,
						zIndex: -1,
						filter: 'blur(4px)',
						opacity: 0.6,
					}}
				/>

				{/* Music icon or album art placeholder */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '3rem',
						height: '3rem',
						background: `linear-gradient(135deg, ${accentColor}, ${colors.tertiary || '#8a2be2'})`,
						borderRadius: '50%',
						margin: '0 auto 1.5rem',
						boxShadow: `0 4px 12px ${accentColor}40`,
					}}
				>
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 24 24"
						fill="white"
						style={{ opacity: 0.9 }}
					>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
					</svg>
				</div>

				{/* Current lyric text */}
				<div
					style={{
						textAlign: 'center',
						marginBottom: nextLyric ? '2rem' : '0',
					}}
				>
					<p
						style={{
							fontSize: cardDimensions.currentFontSize,
							fontWeight: 700,
							lineHeight: 1.2,
							color: dynTextColor,
							letterSpacing: '-0.02em',
							margin: '0',
							background: `linear-gradient(135deg, ${dynTextColor}, ${accentColor})`,
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							textShadow: 'none',
						}}
					>
						{currentLyric.text}
					</p>
				</div>

				{/* Next lyric preview */}
				{nextLyric && (
					<div
						style={{
							borderTop: `1px solid ${theme ? colors.outline + '30' : 'rgba(255,255,255,0.1)'}`,
							paddingTop: '1.5rem',
							textAlign: 'center',
						}}
					>
						<p
							style={{
								fontSize: cardDimensions.nextFontSize,
								fontWeight: 400,
								lineHeight: 1.3,
								color: `${dynTextColor}80`,
								letterSpacing: '-0.01em',
								margin: '0',
								opacity: 0.7,
							}}
						>
							<span style={{ opacity: 0.6, fontSize: '0.9em' }}>
								Next:{' '}
							</span>
							{nextLyric.text}
						</p>
					</div>
				)}

				{/* Decorative elements */}
				<div
					style={{
						position: 'absolute',
						top: '1rem',
						right: '1rem',
						width: '4px',
						height: '4px',
						background: accentColor,
						borderRadius: '50%',
						opacity: 0.6,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: '1rem',
						left: '1rem',
						width: '6px',
						height: '6px',
						background: `${colors.tertiary || '#8a2be2'}60`,
						borderRadius: '50%',
						opacity: 0.4,
					}}
				/>
			</div>
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
						transform: `translate(${parallaxX}px, ${parallaxY}px)`,
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
							filter: 'brightness(0.4) blur(1px) contrast(1.1)',
						}}
						pauseWhenLoading
						onError={(e) => {
							console.error('Error loading image:', e);
						}}
					/>
				</div>
			)}

			{/* Gradient overlay for depth */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `
						radial-gradient(ellipse at center, transparent 20%, ${dynBackgroundColor}80 80%),
						linear-gradient(135deg, ${accentColor}10 0%, ${colors.tertiary || '#8a2be2'}08 100%)
					`,
					opacity: 0.9,
				}}
			/>

			{/* Floating particles for ambiance */}
			{Array.from({ length: 8 }, (_, i) => {
				const particleX = interpolate(
					Math.sin((frame + i * 30) / 120),
					[-1, 1],
					[i * (width / 8), (i + 1) * (width / 8)]
				);
				const particleY = interpolate(
					Math.cos((frame + i * 45) / 150),
					[-1, 1],
					[height * 0.2, height * 0.8]
				);
				const particleOpacity = interpolate(
					Math.sin((frame + i * 20) / 90),
					[-1, 1],
					[0.1, 0.4]
				);

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: particleX,
							top: particleY,
							width: '3px',
							height: '3px',
							background:
								i % 2 === 0
									? accentColor
									: colors.tertiary || '#8a2be2',
							borderRadius: '50%',
							opacity: particleOpacity,
							filter: 'blur(0.5px)',
							zIndex: 2,
						}}
					/>
				);
			})}

			{/* Subtle grid pattern overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `
						linear-gradient(${colors.outline || '#535353'}20 1px, transparent 1px),
						linear-gradient(90deg, ${colors.outline || '#535353'}20 1px, transparent 1px)
					`,
					backgroundSize: '40px 40px',
					opacity: 0.03,
					zIndex: 1,
				}}
			/>

			{renderLyrics()}
			{audioSrc && <Audio src={audioSrc} pauseWhenBuffering />}
		</AbsoluteFill>
	);
};
