import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';

export function useExternalLyricsSection() {
	const { addLinesFromExternal, setExternalLyrics } = useAppStore.getState();

	const { externalLyrics, showExternalLyrics, showPreview } = useAppStore(
		useShallow((state) => ({
			externalLyrics: state.externalLyrics,
			showExternalLyrics: state.showExternalLyrics,
			showPreview: state.showPreview,
		}))
	);

	const handleConvertToLines = () => {
		// Split the text into lines and filter out empty lines
		const lines = externalLyrics
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		addLinesFromExternal(lines);
	};

	const handleTextareaChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setExternalLyrics(e.target.value);
		// Auto-resize the textarea
		e.target.style.height = 'auto';
		e.target.style.height = `${e.target.scrollHeight}px`;
	};

	const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
		// Ensure correct height on focus
		e.target.style.height = 'auto';
		e.target.style.height = `${e.target.scrollHeight}px`;
	};

	const isConvertDisabled = !externalLyrics.trim();
	const shouldRender = showExternalLyrics && !showPreview;

	return {
		externalLyrics,
		handleConvertToLines,
		handleTextareaChange,
		handleTextareaFocus,
		isConvertDisabled,
		shouldRender,
	};
}
