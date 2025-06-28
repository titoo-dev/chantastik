import { PlayerToolbar } from '@/components/lyric-studio/player-toolbar';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock environment variable
vi.stubEnv('NODE_ENV', 'development');

const mockOnAspectRatioChange = vi.fn();

describe('PlayerToolbar component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_NODE_ENV = 'development';
    });

    it('should render the toolbar container', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByTestId('player-toolbar-container')).toBeInTheDocument();
        expect(screen.getByTestId('toolbar-controls')).toBeInTheDocument();
    });

    it('should render aspect ratio controls in development environment', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByTestId('aspect-ratio-controls')).toBeInTheDocument();
        expect(screen.getByTestId('horizontal-aspect-ratio-button')).toBeInTheDocument();
        expect(screen.getByTestId('vertical-aspect-ratio-button')).toBeInTheDocument();
    });


    it('should not render aspect ratio controls in production environment', () => {
        import.meta.env.VITE_NODE_ENV = 'production';

        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.queryByTestId('aspect-ratio-controls')).not.toBeInTheDocument();
        expect(screen.queryByTestId('horizontal-aspect-ratio-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('vertical-aspect-ratio-button')).not.toBeInTheDocument();
    });

    it('should highlight horizontal button when aspectRatio is horizontal', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const horizontalButton = screen.getByTestId('horizontal-aspect-ratio-button');
        const verticalButton = screen.getByTestId('vertical-aspect-ratio-button');
        
        expect(horizontalButton).toHaveClass('bg-primary');
        expect(verticalButton).not.toHaveClass('bg-primary');
    });

    it('should highlight vertical button when aspectRatio is vertical', () => {
        render(
            <PlayerToolbar
                aspectRatio="vertical"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const horizontalButton = screen.getByTestId('horizontal-aspect-ratio-button');
        const verticalButton = screen.getByTestId('vertical-aspect-ratio-button');
        
        expect(verticalButton).toHaveClass('bg-primary');
        expect(horizontalButton).not.toHaveClass('bg-primary');
    });

    it('should call onAspectRatioChange with horizontal when horizontal button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <PlayerToolbar
                aspectRatio="vertical"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const horizontalButton = screen.getByTestId('horizontal-aspect-ratio-button');
        await user.click(horizontalButton);
        
        expect(mockOnAspectRatioChange).toHaveBeenCalledWith('horizontal');
        expect(mockOnAspectRatioChange).toHaveBeenCalledTimes(1);
    });

    it('should call onAspectRatioChange with vertical when vertical button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const verticalButton = screen.getByTestId('vertical-aspect-ratio-button');
        await user.click(verticalButton);
        
        expect(mockOnAspectRatioChange).toHaveBeenCalledWith('vertical');
        expect(mockOnAspectRatioChange).toHaveBeenCalledTimes(1);
    });

    it('should render info popover trigger button', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByTestId('info-popover-trigger')).toBeInTheDocument();
    });

    it('should show popover content when info button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const infoButton = screen.getByTestId('info-popover-trigger');
        await user.click(infoButton);
        
        expect(screen.getByTestId('info-popover-content')).toBeInTheDocument();
        expect(screen.getByTestId('info-message')).toBeInTheDocument();
    });

    it('should display correct info message in popover', async () => {
        const user = userEvent.setup();
        
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const infoButton = screen.getByTestId('info-popover-trigger');
        await user.click(infoButton);
        
        const infoMessage = screen.getByTestId('info-message');
        expect(infoMessage).toHaveTextContent(
            'If you close and reopen the video player, it may lose sync with the audio or stop playing. Simply restart playbook.'
        );
    });

    it('should render button labels correctly', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByText('YouTube')).toBeInTheDocument();
        expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    it('should render icons in buttons', () => {
        render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        const horizontalButton = screen.getByTestId('horizontal-aspect-ratio-button');
        const verticalButton = screen.getByTestId('vertical-aspect-ratio-button');
        const infoButton = screen.getByTestId('info-popover-trigger');
        
        expect(horizontalButton.querySelector('svg')).toBeInTheDocument();
        expect(verticalButton.querySelector('svg')).toBeInTheDocument();
        expect(infoButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should handle different aspect ratio types correctly', () => {
        const { rerender } = render(
            <PlayerToolbar
                aspectRatio="horizontal"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByTestId('horizontal-aspect-ratio-button')).toHaveClass('bg-primary');
        
        rerender(
            <PlayerToolbar
                aspectRatio="vertical"
                onAspectRatioChange={mockOnAspectRatioChange}
            />
        );
        
        expect(screen.getByTestId('vertical-aspect-ratio-button')).toHaveClass('bg-primary');
    });
});