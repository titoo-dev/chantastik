import { ConfirmationDialog, createDeleteConfirmationDialog, createSaveConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('ConfirmationDialog', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        title: 'Test Title',
        description: 'Test Description',
        onConfirm: mockOnConfirm,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with default props', () => {
        render(<ConfirmationDialog {...defaultProps} />);
        
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-dialog-confirm')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-dialog-cancel')).toBeInTheDocument();
    });

    it('should render with custom button text', () => {
        render(
            <ConfirmationDialog
                {...defaultProps}
                confirmText="Custom Confirm"
                cancelText="Custom Cancel"
            />
        );
        
        expect(screen.getByText('Custom Confirm')).toBeInTheDocument();
        expect(screen.getByText('Custom Cancel')).toBeInTheDocument();
    });

    it('should call onConfirm when confirm button is clicked', async () => {
        const user = userEvent.setup();
        render(<ConfirmationDialog {...defaultProps} />);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        await user.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledOnce();
    });

    it('should call onCancel and onOpenChange when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(<ConfirmationDialog {...defaultProps} onCancel={mockOnCancel} />);
        
        const cancelButton = screen.getByTestId('confirmation-dialog-cancel');
        await user.click(cancelButton);
        
        expect(mockOnCancel).toHaveBeenCalledOnce();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call only onOpenChange when cancel button is clicked and no onCancel provided', async () => {
        const user = userEvent.setup();
        render(<ConfirmationDialog {...defaultProps} />);
        
        const cancelButton = screen.getByTestId('confirmation-dialog-cancel');
        await user.click(cancelButton);
        
        expect(mockOnCancel).not.toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should show loading state when isLoading is true', () => {
        render(
            <ConfirmationDialog
                {...defaultProps}
                isLoading={true}
                loadingText="Custom Loading..."
            />
        );
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        const cancelButton = screen.getByTestId('confirmation-dialog-cancel');
        
        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
        expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
        expect(confirmButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should use default loading text when isLoading is true and no loadingText provided', () => {
        render(<ConfirmationDialog {...defaultProps} isLoading={true} />);
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should apply destructive variant styles', () => {
        render(<ConfirmationDialog {...defaultProps} variant="destructive" />);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        expect(confirmButton).toHaveClass('bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/90');
    });

    it('should render children when provided', () => {
        render(
            <ConfirmationDialog {...defaultProps}>
                <div data-testid="custom-content">Custom Content</div>
            </ConfirmationDialog>
        );
        
        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
        expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<ConfirmationDialog {...defaultProps} open={false} />);
        
        expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
});

describe('createDeleteConfirmationDialog', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        onConfirm: mockOnConfirm,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render delete dialog with default props', () => {
        const DeleteDialog = createDeleteConfirmationDialog(defaultProps);
        render(DeleteDialog);
        
        expect(screen.getByText('Delete item?')).toBeInTheDocument();
        expect(screen.getByText('This action cannot be undone. This will permanently delete the item and all associated data.')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render delete dialog with custom item name', () => {
        const DeleteDialog = createDeleteConfirmationDialog({
            ...defaultProps,
            itemName: 'project',
        });
        render(DeleteDialog);
        
        expect(screen.getByText('Delete project?')).toBeInTheDocument();
    });

    it('should render delete dialog with custom title and description', () => {
        const DeleteDialog = createDeleteConfirmationDialog({
            ...defaultProps,
            title: 'Custom Delete Title',
            description: 'Custom delete description',
        });
        render(DeleteDialog);
        
        expect(screen.getByText('Custom Delete Title')).toBeInTheDocument();
        expect(screen.getByText('Custom delete description')).toBeInTheDocument();
    });

    it('should render delete dialog with custom confirm text', () => {
        const DeleteDialog = createDeleteConfirmationDialog({
            ...defaultProps,
            confirmText: 'Remove Forever',
        });
        render(DeleteDialog);
        
        expect(screen.getByText('Remove Forever')).toBeInTheDocument();
    });

    it('should show loading state in delete dialog', () => {
        const DeleteDialog = createDeleteConfirmationDialog({
            ...defaultProps,
            isLoading: true,
        });
        render(DeleteDialog);
        
        expect(screen.getByText('Deleting...')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-dialog-confirm')).toBeDisabled();
    });

    it('should apply destructive variant to delete dialog', () => {
        const DeleteDialog = createDeleteConfirmationDialog(defaultProps);
        render(DeleteDialog);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        expect(confirmButton).toHaveClass('bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/90');
    });

    it('should call onConfirm when delete button is clicked', async () => {
        const user = userEvent.setup();
        const DeleteDialog = createDeleteConfirmationDialog(defaultProps);
        render(DeleteDialog);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        await user.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledOnce();
    });

    it('should call onCancel when provided in delete dialog', async () => {
        const user = userEvent.setup();
        const DeleteDialog = createDeleteConfirmationDialog({
            ...defaultProps,
            onCancel: mockOnCancel,
        });
        render(DeleteDialog);
        
        const cancelButton = screen.getByTestId('confirmation-dialog-cancel');
        await user.click(cancelButton);
        
        expect(mockOnCancel).toHaveBeenCalledOnce();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
});

describe('createSaveConfirmationDialog', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        onConfirm: mockOnConfirm,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render save dialog with default props', () => {
        const SaveDialog = createSaveConfirmationDialog(defaultProps);
        render(SaveDialog);
        
        expect(screen.getByText('Save changes?')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to save these changes?')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show loading state in save dialog', () => {
        const SaveDialog = createSaveConfirmationDialog({
            ...defaultProps,
            isLoading: true,
        });
        render(SaveDialog);
        
        expect(screen.getByText('Saving...')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-dialog-confirm')).toBeDisabled();
    });

    it('should apply default variant to save dialog', () => {
        const SaveDialog = createSaveConfirmationDialog(defaultProps);
        render(SaveDialog);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        expect(confirmButton).not.toHaveClass('bg-destructive');
    });

    it('should call onConfirm when save button is clicked', async () => {
        const user = userEvent.setup();
        const SaveDialog = createSaveConfirmationDialog(defaultProps);
        render(SaveDialog);
        
        const confirmButton = screen.getByTestId('confirmation-dialog-confirm');
        await user.click(confirmButton);
        
        expect(mockOnConfirm).toHaveBeenCalledOnce();
    });

    it('should call onCancel when provided in save dialog', async () => {
        const user = userEvent.setup();
        const SaveDialog = createSaveConfirmationDialog({
            ...defaultProps,
            onCancel: mockOnCancel,
        });
        render(SaveDialog);
        
        const cancelButton = screen.getByTestId('confirmation-dialog-cancel');
        await user.click(cancelButton);
        
        expect(mockOnCancel).toHaveBeenCalledOnce();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
});