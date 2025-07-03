import { LyricStudioHeader } from '@/components/lyric-studio/lyrics-studio-header';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/app/store';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';

// Mock the hooks
vi.mock('@/stores/app/store');
vi.mock('@/hooks/use-responsive-mobile');

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
            // Action methods
            isValidLyricLines: mockIsValidLyricLines,
            // Mock other required actions
            setTrackLoaded: vi.fn(),
            updateProjectId: vi.fn(),
            setAudio: vi.fn(),
            setLyricLines: vi.fn(),
            setExternalLyrics: vi.fn(),
            jumpToLyricLine: vi.fn(),
            addLinesFromExternal: vi.fn(),
            setVideoTime: vi.fn(),
            resetAllStatesAndPlayers: vi.fn(),
            areLyricLinesWithoutTimestamps: vi.fn(),
            isLyricLinesInOrder: vi.fn(),
            generateLRC: vi.fn(),
            handleDownload: vi.fn(),
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
        expect(screen.getByText('Create Amazing Lyrics')).toBeInTheDocument();
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
        
        expect(screen.getByText('Create Amazing Lyrics')).toBeInTheDocument();
    });
});