import { useRef } from 'react';

export function TrackPlayerContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	const playerRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/95 with-blur"
			ref={playerRef}
			tabIndex={0}
		>
			{children}
		</div>
	);
}
