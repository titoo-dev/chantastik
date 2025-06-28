import { ExternalLyricsSection } from '@/components/lyric-studio/external-lyrics-section';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useExternalLyricsSection } from '@/hooks/use-external-lyrics-section';

// Mock the hook
vi.mock('@/hooks/use-external-lyrics-section');

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
    writable: true,
    value: mockWindowOpen,
});

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: mockLocalStorage,
});

const mockHandleConvertToLines = vi.fn();
const mockHandleTextareaChange = vi.fn();
const mockHandleTextareaFocus = vi.fn();

describe('ExternalLyricsSection component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock useExternalLyricsSection default state
        vi.mocked(useExternalLyricsSection).mockReturnValue({
            externalLyrics: '',
            handleConvertToLines: mockHandleConvertToLines,
            handleTextareaChange: mockHandleTextareaChange,
            handleTextareaFocus: mockHandleTextareaFocus,
            isConvertDisabled: false,
            shouldRender: true,
        });

        // Mock localStorage with valid audio metadata
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
            metadata: {
                artist: 'Test Artist',
                title: 'Test Song'
            }
        }));
    });

    it('should render external lyrics section when shouldRender is true', () => {
        render(<ExternalLyricsSection />);
        
        expect(screen.getByTestId('external-lyrics-section')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-title')).toHaveTextContent('Notes');
    });

    it('should not render when shouldRender is false', () => {
        vi.mocked(useExternalLyricsSection).mockReturnValue({
            externalLyrics: '',
            handleConvertToLines: mockHandleConvertToLines,
            handleTextareaChange: mockHandleTextareaChange,
            handleTextareaFocus: mockHandleTextareaFocus,
            isConvertDisabled: false,
            shouldRender: false,
        });

        render(<ExternalLyricsSection />);
        
        expect(screen.queryByTestId('external-lyrics-section')).not.toBeInTheDocument();
    });

    it('should render all necessary UI elements', () => {
        render(<ExternalLyricsSection />);
        
        expect(screen.getByTestId('external-lyrics-header')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-title')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-actions')).toBeInTheDocument();
        expect(screen.getByTestId('search-lyrics-button')).toBeInTheDocument();
        expect(screen.getByTestId('apply-lyrics-button')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-content')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-textarea')).toBeInTheDocument();
        expect(screen.getByTestId('external-lyrics-help-text')).toBeInTheDocument();
    });

    it('should display correct textarea placeholder', () => {
        render(<ExternalLyricsSection />);
        
        const textarea = screen.getByTestId('external-lyrics-textarea');
        expect(textarea).toHaveAttribute('placeholder', 'Paste lyrics here, one line per lyric...');
    });

    it('should display help text correctly', () => {
        render(<ExternalLyricsSection />);
        
        const helpText = screen.getByTestId('external-lyrics-help-text');
        expect(helpText).toHaveTextContent('Paste or type song lyrics. Each line will be converted to a separate lyric line.');
    });

    it('should call handleTextareaChange when textarea value changes', async () => {
        const user = userEvent.setup();
        
        render(<ExternalLyricsSection />);
        
        const textarea = screen.getByTestId('external-lyrics-textarea');
        await user.type(textarea, 'Test lyrics');
        
        expect(mockHandleTextareaChange).toHaveBeenCalled();
    });

    it('should call handleTextareaFocus when textarea is focused', async () => {
        const user = userEvent.setup();
        
        render(<ExternalLyricsSection />);
        
        const textarea = screen.getByTestId('external-lyrics-textarea');
        await user.click(textarea);
        
        expect(mockHandleTextareaFocus).toHaveBeenCalled();
    });

    it('should call handleConvertToLines when apply button is clicked', async () => {
        const user = userEvent.setup();
        
        render(<ExternalLyricsSection />);
        
        const applyButton = screen.getByTestId('apply-lyrics-button');
        await user.click(applyButton);
        
        expect(mockHandleConvertToLines).toHaveBeenCalledOnce();
    });

    it('should disable apply button when isConvertDisabled is true', () => {
        vi.mocked(useExternalLyricsSection).mockReturnValue({
            externalLyrics: '',
            handleConvertToLines: mockHandleConvertToLines,
            handleTextareaChange: mockHandleTextareaChange,
            handleTextareaFocus: mockHandleTextareaFocus,
            isConvertDisabled: true,
            shouldRender: true,
        });

        render(<ExternalLyricsSection />);
        
        const applyButton = screen.getByTestId('apply-lyrics-button');
        expect(applyButton).toBeDisabled();
    });

    it('should open Google search with correct query when search button is clicked', async () => {
        const user = userEvent.setup();
        
        render(<ExternalLyricsSection />);
        
        const searchButton = screen.getByTestId('search-lyrics-button');
        await user.click(searchButton);
        
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://www.google.com/search?q=Test+Artist+Test+Song+lyrics',
            '_blank'
        );
    });

    it('should not open Google search when no audio metadata is stored', async () => {
        const user = userEvent.setup();
        mockLocalStorage.getItem.mockReturnValue(null);
        
        render(<ExternalLyricsSection />);
        
        const searchButton = screen.getByTestId('search-lyrics-button');
        await user.click(searchButton);
        
        expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should display external lyrics value in textarea', () => {
        const testLyrics = 'Line 1\nLine 2\nLine 3';
        vi.mocked(useExternalLyricsSection).mockReturnValue({
            externalLyrics: testLyrics,
            handleConvertToLines: mockHandleConvertToLines,
            handleTextareaChange: mockHandleTextareaChange,
            handleTextareaFocus: mockHandleTextareaFocus,
            isConvertDisabled: false,
            shouldRender: true,
        });

        render(<ExternalLyricsSection />);
        
        const textarea = screen.getByTestId('external-lyrics-textarea');
        expect(textarea).toHaveValue(testLyrics);
    });

    it('should have correct button titles for accessibility', () => {
        render(<ExternalLyricsSection />);
        
        const searchButton = screen.getByTestId('search-lyrics-button');
        const applyButton = screen.getByTestId('apply-lyrics-button');
        
        expect(searchButton).toHaveAttribute('title', 'Search for lyrics online');
        expect(applyButton).toHaveAttribute('title', 'Override lyric lines from this text');
    });

    it('should have spellCheck disabled on textarea', () => {
        render(<ExternalLyricsSection />);
        
        const textarea = screen.getByTestId('external-lyrics-textarea');
        expect(textarea).toHaveAttribute('spellCheck', 'false');
    });

    it('should handle malformed JSON in localStorage gracefully', async () => {
        const user = userEvent.setup();
        mockLocalStorage.getItem.mockReturnValue('invalid json');
        
        render(<ExternalLyricsSection />);
        
        const searchButton = screen.getByTestId('search-lyrics-button');
        
        // Should not throw an error when clicking search button
        expect(() => user.click(searchButton)).not.toThrow();
    });

    it('should handle missing artist or title in metadata', async () => {
        const user = userEvent.setup();
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
            metadata: {
                artist: undefined,
                title: 'Test Song'
            }
        }));
        
        render(<ExternalLyricsSection />);
        
        const searchButton = screen.getByTestId('search-lyrics-button');
        await user.click(searchButton);
        
        expect(mockWindowOpen).toHaveBeenCalledWith(
            'https://www.google.com/search?q=undefined+Test+Song+lyrics',
            '_blank'
        );
    });
});