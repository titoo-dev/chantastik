import React from 'react';
import type { LyricsProps } from '../schema';
import { useColorFlow } from '@/hooks/use-color-flow';
import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
	Audio,
	Img,
} from 'remotion';

// Palette de couleurs inspirée de Madagascar - terres rouges, océan, et baobabs
const MALAGASY_COLORS = {
	primary: '#D2691E', // Terre rouge de Madagascar
	onPrimary: '#ffffff',
	primaryContainer: '#8B4513', // Terre sombre
	secondary: '#228B8D', // Océan Indien
	onSecondary: '#ffffff',
	secondaryContainer: '#20B2AA', // Turquoise
	tertiary: '#8FBC8F', // Végétation tropicale
	onTertiary: '#2F4F2F',
	tertiaryContainer: '#98FB98', // Vert tendre
	background: '#2C1810', // Brun foncé terre
	surface: '#3D2817', // Surface terre
	surfaceVariant: '#4A2F1A', // Variant terre
	outline: '#8B7355', // Contour sable
	onBackground: '#F5DEB3', // Beige clair
	onSurface: '#FAEBD7', // Blanc antique
	onSurfaceVariant: '#DEB887', // Beige sable
	error: '#CD5C5C',
	// Couleurs spéciales malgaches
	baobab: '#8B4513', // Tronc de baobab
	sunset: '#FF6347', // Coucher de soleil
	ocean: '#4682B4', // Océan profond
	gold: '#FFD700', // Or pour les accents
};

export const MalagasyHistoryComposition: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'Playfair Display, Georgia, serif',
	backgroundImage,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();
	const theme = useColorFlow();

	// Use Malagasy palette or dynamic theme
	const colors = React.useMemo(() => {
		return theme
			? {
					primary: theme.dark.primary,
					secondary: theme.dark.secondary,
					tertiary: theme.dark.tertiary,
					background: theme.dark.background,
					surface: theme.dark.surface,
					surfaceVariant: theme.dark.surfaceVariant,
					onSurface: theme.dark.onSurface,
					onBackground: theme.dark.onBackground,
				}
			: MALAGASY_COLORS;
	}, [theme]);

	const dynBackgroundColor = colors.background;
	const dynTextColor = colors.onSurface;
	const dynHighlightColor = theme ? colors.primary : MALAGASY_COLORS.gold;

	// Find current line
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	// Minimal floating particles (max 10 for performance)
	const dustParticles = React.useMemo(
		() =>
			Array.from({ length: 8 }, (_, i) => {
				const x = (width / 8) * i + Math.sin(frame / 60 + i) * 20;
				const y = height * 0.3 + Math.cos(frame / 80 + i * 2) * 30;
				const opacity = interpolate(
					Math.sin(frame / 40 + i),
					[-1, 1],
					[0.1, 0.3]
				);
				return { x, y, opacity, id: i };
			}),
		[frame, width, height]
	);

	const renderLyrics = () => {
		if (currentLyricIndex === -1) return null;

		const currentLyric = lyrics[currentLyricIndex];
		const nextLyric = lyrics[currentLyricIndex + 1];

		const progress =
			(frame - currentLyric.startFrame) /
			(currentLyric.endFrame - currentLyric.startFrame);

		// Smooth entrance animation respecting reduced motion
		const entrance = spring({
			frame: frame - currentLyric.startFrame,
			fps,
			config: {
				damping: 20,
				mass: 1.2,
				stiffness: 100,
			},
		});

		const opacity = entrance;
		const translateY = interpolate(entrance, [0, 1], [20, 0]);

		return (
			<>
				{/* Current line - Maximum prominence */}
				<div
					style={{
						position: 'absolute',
						opacity,
						top: '40%',
						left: '50%',
						transform: `translateX(-50%) translateY(${translateY}px)`,
						textAlign: 'center',
						width: '90%',
						maxWidth: '1200px',
						willChange: entrance < 1 ? 'transform' : 'auto',
					}}
				>
					<p
						style={{
							fontSize: '4.5rem',
							fontWeight: 700,
							lineHeight: 1.2,
							color: dynTextColor,
							letterSpacing: '-0.01em',
							margin: 0,
							textShadow: `0 2px 10px ${colors.background}80`,
							padding: '1rem 0',
						}}
					>
						<span
							style={{
								background: `linear-gradient(135deg, ${dynHighlightColor}, ${MALAGASY_COLORS.sunset})`,
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								position: 'relative',
							}}
						>
							{currentLyric.text}
						</span>
					</p>
				</div>

				{/* Next line preview - Subtle and well-spaced */}
				{nextLyric && (
					<p
						style={{
							position: 'absolute',
							opacity: 0.4,
							bottom: '20%',
							left: '50%',
							transform: 'translateX(-50%)',
							textAlign: 'center',
							fontSize: '2.2rem',
							fontWeight: 400,
							fontStyle: 'italic',
							color: dynTextColor,
							width: '80%',
							maxWidth: '900px',
							lineHeight: 1.4,
							margin: 0,
							marginTop: '4rem', // Generous spacing from current line
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
			{/* Background image with accessibility-friendly contrast */}
			{backgroundImage && (
				<Img
					src={backgroundImage}
					alt="Background"
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'center',
						filter: 'sepia(15%) brightness(0.7) contrast(1.1)',
					}}
				/>
			)}

			{/* High contrast overlay for text readability */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(ellipse at center, ${colors.background}50 0%, ${colors.background}95 100%)`,
					opacity: 0.9,
				}}
			/>

			{/* Minimal decorative elements */}
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					opacity: 0.08,
					pointerEvents: 'none',
				}}
			>
				{/* Simple baobab silhouette */}
				<rect
					x={width * 0.05}
					y={height * 0.7}
					width="6"
					height={height * 0.25}
					fill={MALAGASY_COLORS.baobab}
					rx="3"
				/>

				{/* Minimal wave pattern */}
				<path
					d={`M0,${height * 0.85} Q${width * 0.3},${height * 0.8} ${width * 0.6},${height * 0.85} T${width},${height * 0.85}`}
					stroke={MALAGASY_COLORS.ocean}
					strokeWidth="1"
					fill="none"
					opacity="0.4"
				/>

				{/* Subtle stars */}
				{Array.from({ length: 3 }, (_, i) => (
					<circle
						key={i}
						cx={width * (0.75 + i * 0.08)}
						cy={height * (0.12 + i * 0.03)}
						r="1.5"
						fill={MALAGASY_COLORS.gold}
						opacity={0.6}
					/>
				))}
			</svg>

			{/* Performance-optimized particles */}
			{dustParticles.map((particle) => (
				<div
					key={particle.id}
					style={{
						position: 'absolute',
						left: particle.x,
						top: particle.y,
						width: '2px',
						height: '2px',
						borderRadius: '50%',
						backgroundColor: MALAGASY_COLORS.gold,
						opacity: particle.opacity,
						pointerEvents: 'none',
						willChange: 'transform',
					}}
				/>
			))}

			{/* Simple bottom accent */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: '20%',
					right: '20%',
					height: '3px',
					background: `linear-gradient(90deg, 
                        transparent,
                        ${MALAGASY_COLORS.gold}80, 
                        ${MALAGASY_COLORS.ocean}60,
                        transparent
                    )`,
					opacity: 0.6,
				}}
			/>

			{renderLyrics()}

			{audioSrc && <Audio src={audioSrc} />}
		</AbsoluteFill>
	);
};
