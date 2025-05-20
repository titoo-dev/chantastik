import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
	staticFile,
	Audio,
	Img,
} from 'remotion';
import type { LyricsProps } from './schema';

export const MyComposition: React.FC<LyricsProps> = ({
	lyrics,
	fontFamily = 'Inter, system-ui, sans-serif',
	backgroundColor = 'hsl(0 0% 7%)',
	textColor = 'hsl(0 0% 98%)',
	highlightColor = 'hsl(252 100% 69%)',
	backgroundImage = staticFile('assets/background.jpg'), // Default background image
}) => {
	const frame = useCurrentFrame();
	const { fps, width } = useVideoConfig();

	// Find the current lyric
	const currentLyricIndex = lyrics.findIndex(
		(l) => frame >= l.startFrame && frame <= l.endFrame
	);

	const renderCurrentLyric = () => {
		if (currentLyricIndex === -1) return null;

		const lyric = lyrics[currentLyricIndex];

		// Calculate how far into the current lyric we are (0-1)
		const progress =
			(frame - lyric.startFrame) / (lyric.endFrame - lyric.startFrame);

		// Entrance animation
		const entrance = spring({
			frame: frame - lyric.startFrame,
			fps,
			config: {
				damping: 26,
				mass: 0.9,
				stiffness: 170,
			},
		});

		// Exit animation - starts 80% through the lyric duration
		const exitStart = 0.8;
		const exitOpacity =
			progress > exitStart
				? interpolate(progress, [exitStart, 1], [1, 0], {
						extrapolateRight: 'clamp',
					})
				: 1;

		// Combined opacity
		const opacity =
			interpolate(entrance, [0, 0.2], [0, 1], {
				extrapolateRight: 'clamp',
			}) * exitOpacity;

		return (
			<div
				className="current-lyric"
				style={{
					position: 'absolute',
					bottom: '5rem',
					right: '5rem',
					maxWidth: width * 0.5,
					opacity,
					padding: '1.5rem 2rem',
					color: textColor,
					fontSize: '2.8rem',
					fontWeight: 700,
					textAlign: 'right',
					lineHeight: 1.3,
					transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
				}}
			>
				{lyric.text}
			</div>
		);
	};

	// Subtle parallax effect for background image
	const parallaxX = interpolate(frame, [0, 1000], [0, -50], {
		extrapolateRight: 'clamp',
	});
	const parallaxY = interpolate(Math.sin(frame / 200), [-1, 1], [-20, 20]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor,
				fontFamily,
				overflow: 'hidden',
			}}
		>
			{/* Background image with parallax effect */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					overflow: 'hidden',
					transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.1)`,
					transition: 'transform 0.5s ease-out',
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
						filter: 'brightness(0.4)',
					}}
					pauseWhenLoading
				/>
			</div>

			{/* Overlay gradient */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					background: `radial-gradient(ellipse at bottom right, ${highlightColor}40 0%, ${backgroundColor}CC 70%)`,
					opacity: 0.85,
				}}
			/>

			{/* Visual elements in background */}
			<div
				style={{
					position: 'absolute',
					top: '5%',
					left: '10%',
					width: '40%',
					height: '40%',
					opacity: 0.6,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '15%',
					right: '25%',
					width: '30%',
					height: '30%',
					opacity: 0.7,
				}}
			/>

			{renderCurrentLyric()}

			<Audio src={staticFile('assets/friends.mp3')} pauseWhenBuffering />
		</AbsoluteFill>
	);
};
