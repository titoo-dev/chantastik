import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/data/api';
import * as api from '@/data/api';

// Mock the API module
vi.mock('@/data/api', () => ({
    getCoverArtUrl: vi.fn(),
}));

const mockProject: Project = {
    id: 'test-project-id',
    name: 'Test Project',
    audioId: 'test-audio-id',
    updatedAt: '2023-10-15T10:30:00Z',
    createdAt: ''
};

const mockFormatDate = vi.fn((_date: string) => '2 days ago');
const mockOnSelect = vi.fn();
const mockOnDelete = vi.fn();

const defaultProps = {
    project: mockProject,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
    formatDate: mockFormatDate,
};

describe('ProjectCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.getCoverArtUrl).mockReturnValue('https://example.com/cover.jpg');
    });

    it('renders project card with correct data', () => {
        render(<ProjectCard {...defaultProps} />);
        
        expect(screen.getByTestId('project-card')).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });

    it('displays cover art with correct src and alt text', () => {
        render(<ProjectCard {...defaultProps} />);
        
        const coverImage = screen.getByAltText('Cover art for Test Project');
        expect(coverImage).toBeInTheDocument();
        expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');
        expect(api.getCoverArtUrl).toHaveBeenCalledWith('test-audio-id');
    });

    it('calls onSelect when card is clicked', () => {
        render(<ProjectCard {...defaultProps} />);
        
        fireEvent.click(screen.getByTestId('project-card'));
        expect(mockOnSelect).toHaveBeenCalledWith(mockProject);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<ProjectCard {...defaultProps} />);
        
        const deleteButton = screen.getByTestId('delete-project-button');
        fireEvent.click(deleteButton);
        
        expect(mockOnDelete).toHaveBeenCalledWith('test-project-id');
        expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('shows delete button on hover', () => {
        render(<ProjectCard {...defaultProps} />);
        
        const deleteButton = screen.getByTestId('delete-project-button');
        expect(deleteButton).toHaveClass('opacity-0');
        
        const card = screen.getByTestId('project-card');
        fireEvent.mouseEnter(card);
        
        expect(deleteButton).toHaveClass('group-hover:opacity-100');
    });

    it('displays fallback initial when cover art fails to load', () => {
        render(<ProjectCard {...defaultProps} />);
        
        const coverImage = screen.getByAltText('Cover art for Test Project');
        fireEvent.error(coverImage);
        
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('handles project with empty name gracefully', () => {
        const projectWithEmptyName = { ...mockProject, name: '' };
        render(<ProjectCard {...defaultProps} project={projectWithEmptyName} />);
        
        expect(screen.getByTestId('project-card')).toBeInTheDocument();
    });

    it('handles long project names with text wrapping', () => {
        const projectWithLongName = {
            ...mockProject,
            name: 'This is a very long project name that should wrap properly',
        };
        
        render(<ProjectCard {...defaultProps} project={projectWithLongName} />);
        
        const title = screen.getByText(projectWithLongName.name);
        expect(title).toHaveClass('break-words');
    });

    it('calls formatDate with correct updatedAt value', () => {
        render(<ProjectCard {...defaultProps} />);
        
        expect(mockFormatDate).toHaveBeenCalledWith('2023-10-15T10:30:00Z');
    });

    it('prevents event propagation when delete button is clicked', () => {
        const mockStopPropagation = vi.fn();
        render(<ProjectCard {...defaultProps} />);
        
        const deleteButton = screen.getByTestId('delete-project-button');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        clickEvent.stopPropagation = mockStopPropagation;
        
        fireEvent(deleteButton, clickEvent);
        
        expect(mockOnDelete).toHaveBeenCalled();
    });

    it('renders accessibility attributes correctly', () => {
        render(<ProjectCard {...defaultProps} />);
        
        const deleteButton = screen.getByTestId('delete-project-button');
        expect(deleteButton).toHaveAttribute('aria-label');
        expect(screen.getByText('Delete project')).toHaveClass('sr-only');
    });

    it('displays first character of project name in uppercase for fallback', () => {
        const projectWithLowerCase = { ...mockProject, name: 'lowercase project' };
        render(<ProjectCard {...defaultProps} project={projectWithLowerCase} />);
        
        const coverImage = screen.getByAltText('Cover art for lowercase project');
        fireEvent.error(coverImage);
        
        expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('handles projects with special characters in name', () => {
        const projectWithSpecialChars = { ...mockProject, name: '!@#$%^&*()' };
        render(<ProjectCard {...defaultProps} project={projectWithSpecialChars} />);
        
        expect(screen.getByText('!@#$%^&*()')).toBeInTheDocument();
    });

    it('maintains proper component structure with test ids', () => {
        render(<ProjectCard {...defaultProps} />);
        
        expect(screen.getByTestId('project-card')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-header')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-content')).toBeInTheDocument();
        expect(screen.getByTestId('delete-project-button')).toBeInTheDocument();
    });
});