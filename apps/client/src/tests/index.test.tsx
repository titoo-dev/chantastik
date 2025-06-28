import { LyricStudioHeader } from '@/components/lyric-studio/lyrics-studio-header';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/app/store';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';

// Mock the hooks
vi.mock('@/stores/app/store');
vi.mock('@/hooks/use-responsive-mobile');

const mockToggleShowExternalLyrics = vi.fn();
const mockToggleShowVideoPreview = vi.fn();
const mockIsValidLyricLines = vi.fn();

describe('LyricStudioHeader components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock useAppStore
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [],
                showExternalLyrics: false,
                trackLoaded: false,
            };
            return selector ? selector(state) : state;
        });

        // Mock useAppStore.getState
        vi.mocked(useAppStore.getState).mockReturnValue({
            // State properties
            trackLoaded: false,
            projectId: undefined,
            audio: undefined,
            lyricLines: [],
            externalLyrics: '',
            showExternalLyrics: false,
            showVideoPreview: false,
            // Action methods
            toggleShowExternalLyrics: mockToggleShowExternalLyrics,
            toggleShowVideoPreview: mockToggleShowVideoPreview,
            isValidLyricLines: mockIsValidLyricLines,
            // Mock other required actions
            setTrackLoaded: vi.fn(),
            updateProjectId: vi.fn(),
            setAudio: vi.fn(),
            setLyricLines: vi.fn(),
            setExternalLyrics: vi.fn(),
            setShowExternalLyrics: vi.fn(),
            setShowVideoPreview: vi.fn(),
            jumpToLyricLine: vi.fn(),
            addLyricLine: vi.fn(),
            updateLyricLine: vi.fn(),
            deleteLyricLine: vi.fn(),
            addLinesFromExternal: vi.fn(),
            setVideoTime: vi.fn(),
            resetAllStatesAndPlayers: vi.fn(),
            toggleLyricLineSelection: vi.fn(),
            clearLyricLineSelection: vi.fn(),
            selectAllLyricLines: vi.fn(),
            areLyricLinesWithoutTimestamps: vi.fn(),
            isLyricLinesInOrder: vi.fn(),
            generateLRC: vi.fn(),
            handleDownload: vi.fn()
        });

        // Mock useResponsiveMobile
        vi.mocked(useResponsiveMobile).mockReturnValue({
            deviceType: 'mobile',
            isMobile: false,
            isSmallMobile: false,
            isTablet: false,
            isDesktop: false,
            isLargeDesktop: false,
            screenWidth: 0,
            screenHeight: 0
        });
    });

    it('should render the app title in h1', () => {
        render(<LyricStudioHeader />);
        const heading = screen.getByTestId('title');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/Create Amazing Lyrics$/);
        expect(heading.tagName).toBe('H1');
    });

    it('should not show buttons when track is not loaded', () => {
        render(<LyricStudioHeader />);
        expect(screen.queryByTestId('video-preview-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('external-lyrics-button')).not.toBeInTheDocument();
    });

    it('should show buttons when track is loaded', () => {
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        render(<LyricStudioHeader />);
        expect(screen.getByTestId('video-preview-button')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-button')).toBeInTheDocument();
    });

    it('should call toggleShowVideoPreview when video preview button is clicked', async () => {
        const user = userEvent.setup();
        
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        mockIsValidLyricLines.mockReturnValue(true);

        render(<LyricStudioHeader />);
        const videoButton = screen.getByTestId('video-preview-button');
        
        await user.click(videoButton);
        expect(mockToggleShowVideoPreview).toHaveBeenCalledOnce();
    });

    it('should call toggleShowExternalLyrics when external lyrics button is clicked', async () => {
        const user = userEvent.setup();
        
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        mockIsValidLyricLines.mockReturnValue(true);

        render(<LyricStudioHeader />);
        const externalLyricsButton = screen.getByTestId('external-lyrics-button');
        
        await user.click(externalLyricsButton);
        expect(mockToggleShowExternalLyrics).toHaveBeenCalledOnce();
    });

    it('should disable video preview button when lyrics are invalid', () => {
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        mockIsValidLyricLines.mockReturnValue(false);

        render(<LyricStudioHeader />);
        const videoButton = screen.getByTestId('video-preview-button');
        expect(videoButton).toBeDisabled();
    });

    it('should disable external lyrics button when video preview is shown', () => {
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: true,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        mockIsValidLyricLines.mockReturnValue(true);

        render(<LyricStudioHeader />);
        const externalLyricsButton = screen.getByTestId('external-lyrics-button');
        expect(externalLyricsButton).toBeDisabled();
    });

    it('should show mobile layout on mobile devices', () => {
        vi.mocked(useResponsiveMobile).mockReturnValue({
            isMobile: true,
            isSmallMobile: false,
            deviceType: 'mobile',
            isTablet: false,
            isDesktop: false,
            isLargeDesktop: false,
            screenWidth: 0,
            screenHeight: 0
        });

        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        render(<LyricStudioHeader />);
        
        // Check for mobile-specific button text
        expect(screen.getByText('Video')).toBeInTheDocument();
        expect(screen.getByText('Lyrics')).toBeInTheDocument();
    });

    it('should show desktop layout on desktop devices', () => {
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: false,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: false,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        render(<LyricStudioHeader />);
        
        // Check for desktop-specific button text
        expect(screen.getByText('Video Preview')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('should toggle button text based on state', () => {
        vi.mocked(useAppStore).mockImplementation((selector: any) => {
            const state = {
                showVideoPreview: true,
                lyricLines: [{ text: 'test', start: 0, end: 1000 }],
                showExternalLyrics: true,
                trackLoaded: true,
            };
            return selector ? selector(state) : state;
        });

        render(<LyricStudioHeader />);
        
        expect(screen.getByText('Hide Video Preview')).toBeInTheDocument();
        expect(screen.getByText('Hide Notes')).toBeInTheDocument();
    });
});