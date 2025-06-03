import type { ReactNode } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog';
import { cn } from '@/lib/utils';

export interface ConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: (e: { preventDefault: () => void }) => void;
	onCancel?: () => void;
	isLoading?: boolean;
	loadingText?: string;
	variant?: 'default' | 'destructive';
	children?: ReactNode;
}

export function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	isLoading = false,
	loadingText,
	variant = 'default',
	children,
}: ConfirmationDialogProps) {
	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-[425px]">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg font-semibold leading-none tracking-tight">
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-sm text-muted-foreground">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				{children && <div className="py-4 space-y-4">{children}</div>}
				<AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
					<AlertDialogCancel
						onClick={handleCancel}
						disabled={isLoading}
						className="mt-2 sm:mt-0"
					>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className={cn(
							variant === 'destructive' &&
								'bg-destructive text-destructive-foreground hover:bg-destructive/90',
							isLoading && 'opacity-50 cursor-not-allowed'
						)}
					>
						{isLoading ? loadingText || 'Loading...' : confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// Factory functions
export const createDeleteConfirmationDialog = (props: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (e: { preventDefault: () => void }) => void;
	onCancel?: () => void;
	isLoading?: boolean;
	itemName?: string;
}) => (
	<ConfirmationDialog
		{...props}
		title={`Delete ${props.itemName || 'item'}?`}
		description="This action cannot be undone. This will permanently delete the item and all associated data."
		confirmText="Delete"
		cancelText="Cancel"
		loadingText="Deleting..."
		variant="destructive"
	/>
);

export const createSaveConfirmationDialog = (props: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (e: { preventDefault: () => void }) => void;
	onCancel?: () => void;
	isLoading?: boolean;
}) => (
	<ConfirmationDialog
		{...props}
		title="Save changes?"
		description="Are you sure you want to save these changes?"
		confirmText="Save"
		cancelText="Cancel"
		loadingText="Saving..."
		variant="default"
	/>
);
