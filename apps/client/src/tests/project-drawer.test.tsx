import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsDrawer } from '@/components/project-drawer';
import { useProjectDrawer } from '@/hooks/use-project-drawer';
import { type Project } from '@/data/api';

// Mock the hook
vi.mock('@/hooks/use-project-drawer');

// Mock UI components
vi.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DrawerTrigger: ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>,
    DrawerContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DrawerHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DrawerTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    DrawerDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    DrawerFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DrawerClose: ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/project-list-skeleton', () => ({
    ProjectListSkeleton: () => <div data-testid="project-list-skeleton">Loading...</div>,
}));

vi.mock('@/components/project-card', () => ({
    ProjectCard: ({ project, onSelect, onDelete, formatDate, ...props }: any) => (
        <div {...props}>
            <h3>{project.name}</h3>
            <p>{formatDate(project.updatedAt)}</p>
            <button onClick={() => onSelect(project)}>Select</button>
            <button onClick={() => onDelete(project.id)}>Delete</button>
        </div>
    ),
}));

const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Project 1',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        audioId: 'audio-1',
        description: 'Description for Project 1',
    },
    {
        id: '2',
        name: 'Project 2',
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        audioId: 'audio-2',
        description: 'Description for Project 2',
    },
];

const mockUseProjectDrawer = vi.mocked(useProjectDrawer);

describe('ProjectsDrawer', () => {
    const mockOnProjectSelected = vi.fn();
    const mockOnDeleteProject = vi.fn();
    const mockReloadProjects = vi.fn();
    const mockHandleProjectSelect = vi.fn();
    const mockHandleProjectDelete = vi.fn();
    const mockFormatDate = vi.fn((date: string) => new Date(date).toLocaleDateString());

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: [],
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });
    });

    it('renders drawer trigger button', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-drawer-trigger')).toBeInTheDocument();
        expect(screen.getByText('Open projects')).toBeInTheDocument();
    });

    it('renders drawer content with header and footer', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-drawer-content')).toBeInTheDocument();
        expect(screen.getByTestId('projects-drawer-header')).toBeInTheDocument();
        expect(screen.getByTestId('projects-drawer-title')).toHaveTextContent('Projects');
        expect(screen.getByTestId('projects-drawer-description')).toHaveTextContent(
            'Select a project to continue working on.'
        );
        expect(screen.getByTestId('projects-drawer-footer')).toBeInTheDocument();
    });

    it('calls reload projects when reload button is clicked', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        const reloadButton = screen.getByTestId('projects-reload-button');
        fireEvent.click(reloadButton);

        expect(mockReloadProjects).toHaveBeenCalledOnce();
    });

    it('displays loading skeleton when isLoading is true', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: [],
            isLoading: true,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('project-list-skeleton')).toBeInTheDocument();
    });

    it('displays loading skeleton when isFetching is true', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: [],
            isLoading: false,
            isFetching: true,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('project-list-skeleton')).toBeInTheDocument();
    });

    it('displays error state when error exists', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: [],
            isLoading: false,
            isFetching: false,
            error: new Error('Failed to fetch'),
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-error-state')).toBeInTheDocument();
        expect(screen.getByTestId('projects-error-message')).toHaveTextContent(
            'Failed to load projects. Please try again.'
        );
    });

    it('displays empty state when no projects exist', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: [],
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-empty-state')).toBeInTheDocument();
        expect(screen.getByTestId('projects-empty-message')).toHaveTextContent(
            'No projects yet. Create your first project to get started.'
        );
    });

    it('displays projects grid when projects exist', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: mockProjects,
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-grid')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
    });

    it('handles project selection correctly', async () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: mockProjects,
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        const selectButton = screen.getAllByText('Select')[0];
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(mockHandleProjectSelect).toHaveBeenCalledWith(mockProjects[0]);
        });
    });

    it('handles project deletion correctly', async () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: mockProjects,
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        const deleteButton = screen.getAllByText('Delete')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockHandleProjectDelete).toHaveBeenCalledWith('1');
        });
    });

    it('formats dates correctly in project cards', () => {
        mockUseProjectDrawer.mockReturnValue({
            closeRef: { current: null },
            projects: mockProjects,
            isLoading: false,
            isFetching: false,
            error: null,
            formatDate: mockFormatDate,
            handleProjectDelete: mockHandleProjectDelete,
            handleProjectSelect: mockHandleProjectSelect,
            refetch: mockReloadProjects,
        });

        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(mockFormatDate).toHaveBeenCalledWith('2024-01-01T00:00:00Z');
        expect(mockFormatDate).toHaveBeenCalledWith('2024-01-02T00:00:00Z');
    });

    it('passes correct props to useProjectDrawer hook', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(mockUseProjectDrawer).toHaveBeenCalledWith({
            onProjectSelected: mockOnProjectSelected,
            onDeleteProject: mockOnDeleteProject,
        });
    });

    it('renders close button in footer', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByTestId('projects-drawer-close-button')).toBeInTheDocument();
        expect(screen.getByText('Close projects')).toBeInTheDocument();
    });

    it('maintains proper accessibility attributes', () => {
        render(
            <ProjectsDrawer
                onProjectSelected={mockOnProjectSelected}
                onDeleteProject={mockOnDeleteProject}
            />
        );

        expect(screen.getByText('Open projects')).toHaveClass('sr-only');
        expect(screen.getByText('Reload projects')).toHaveClass('sr-only');
        expect(screen.getByText('Close projects')).toHaveClass('sr-only');
    });
});