import { Music } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/card';
import { memo } from 'react';

export const LyricHeader = memo(function LyricHeader() {
	return (
		<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
			<CardTitle className="flex items-center gap-2">
				<Music className="h-5 w-5 text-primary" />
				Lyric Editor
			</CardTitle>
		</CardHeader>
	);
});
