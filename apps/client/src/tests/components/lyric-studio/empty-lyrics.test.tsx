import { EmptyLyrics } from '@/components/lyric-studio/empty-lyrics';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockOnAddLine = vi.fn();

describe('EmptyLyrics component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the empty lyrics container', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const container = screen.getByTestId('empty-lyrics-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should render the music icon with proper styling', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const iconWrapper = screen.getByTestId('empty-lyrics-icon-wrapper');
        const musicIcon = screen.getByTestId('empty-lyrics-music-icon');
        
        expect(iconWrapper).toBeInTheDocument();
        expect(iconWrapper).toHaveClass('rounded-full', 'bg-primary/10', 'p-4', 'mb-4');
        expect(musicIcon).toBeInTheDocument();
        expect(musicIcon).toHaveClass('h-10', 'w-10', 'text-primary');
    });

    it('should render the title with correct text and styling', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const title = screen.getByTestId('empty-lyrics-title');
        
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('No lyrics yet');
        expect(title).toHaveClass('text-lg', 'font-medium', 'mb-2');
        expect(title.tagName).toBe('H3');
    });

    it('should render the description with correct text and styling', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const description = screen.getByTestId('empty-lyrics-description');
        
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent('Add your first lyric line to start creating your masterpiece');
        expect(description).toHaveClass('text-muted-foreground', 'mb-6', 'max-w-md');
        expect(description.tagName).toBe('P');
    });

    it('should render the add first line button with correct styling', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const button = screen.getByTestId('add-first-line-button');
        const buttonIcon = screen.getByTestId('add-first-line-icon');
        
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Add First Line');
        expect(button).toHaveClass('gap-2');
        expect(buttonIcon).toBeInTheDocument();
        expect(buttonIcon).toHaveClass('h-4', 'w-4');
    });

    it('should call onAddLine when the add first line button is clicked', async () => {
        const user = userEvent.setup();
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        
        const button = screen.getByTestId('add-first-line-button');
        await user.click(button);
        
        expect(mockOnAddLine).toHaveBeenCalledOnce();
    });

    it('should call onAddLine multiple times when button is clicked multiple times', async () => {
        const user = userEvent.setup();
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        
        const button = screen.getByTestId('add-first-line-button');
        await user.click(button);
        await user.click(button);
        await user.click(button);
        
        expect(mockOnAddLine).toHaveBeenCalledTimes(3);
    });

    it('should be accessible with proper ARIA attributes', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const button = screen.getByTestId('add-first-line-button');
        
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('type', 'button');
    });

    it('should have proper semantic structure', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        
        const container = screen.getByTestId('empty-lyrics-container');
        const title = screen.getByTestId('empty-lyrics-title');
        const description = screen.getByTestId('empty-lyrics-description');
        
        expect(container).toContainElement(title);
        expect(container).toContainElement(description);
        expect(title.tagName).toBe('H3');
        expect(description.tagName).toBe('P');
    });

    it('should maintain proper visual hierarchy with spacing classes', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        
        const container = screen.getByTestId('empty-lyrics-container');
        const iconWrapper = screen.getByTestId('empty-lyrics-icon-wrapper');
        const title = screen.getByTestId('empty-lyrics-title');
        const description = screen.getByTestId('empty-lyrics-description');
        
        expect(container).toHaveClass('p-12', 'text-center', 'm-6');
        expect(iconWrapper).toHaveClass('mb-4');
        expect(title).toHaveClass('mb-2');
        expect(description).toHaveClass('mb-6');
    });

    it('should have correct border and background styling', () => {
        render(<EmptyLyrics onAddLine={mockOnAddLine} />);
        const container = screen.getByTestId('empty-lyrics-container');
        
        expect(container).toHaveClass(
            'rounded-lg',
            'border',
            'border-dashed',
            'bg-muted/30',
            'backdrop-blur-sm'
        );
    });
});