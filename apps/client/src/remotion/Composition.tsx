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
				{/* Current lyric */}
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
						color: textColor,
						letterSpacing: '-0.02em',
						width: '90%',
						maxWidth: '1200px',
						textShadow: `0 2px 8px rgba(0,0,0,0.15)`,
						margin: 0,
					}}
				>
					<span
						style={{
							color: highlightColor,
							fontWeight: 800,
							position: 'relative',
							display: 'inline-block',
							zIndex: 1,
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
							color: textColor,
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

	// Get accent colors from theme variables for decorative elements
	const accentColor1 = 'var(--chart-1)'; // Purple
	const accentColor2 = 'var(--chart-2)'; // Teal
	const accentColor3 = 'var(--chart-4)'; // Gold/Yellow

	return (
		<AbsoluteFill
			style={{
				backgroundColor,
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
				/>
			)}

			{/* Modern gradient overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: backgroundImage
						? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)'
						: `linear-gradient(135deg, var(--background), var(--accent))`,
					opacity: 0.8,
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

			{/* Subtle dot pattern */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `radial-gradient(var(--chart-3) 1px, transparent 1px), radial-gradient(var(--chart-5) 1px, transparent 1px)`,
					backgroundSize: '40px 40px, 30px 30px',
					backgroundPosition: '0 0, 20px 20px',
					opacity: 0.03,
				}}
			/>

			{renderLyrics()}

			{audioSrc && <Audio src={audioSrc} pauseWhenBuffering />}
		</AbsoluteFill>
	);
};
