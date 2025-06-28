import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RenderWhen from '../components/render-when';

describe('RenderWhen Component', () => {
    it('renders children when condition is true', () => {
        render(
            <RenderWhen condition={true}>
                <div data-testid="test-content">Test Content</div>
            </RenderWhen>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders fallback when condition is false and fallback is provided', () => {
        render(
            <RenderWhen 
                condition={false}
                fallback={<div data-testid="fallback-content">Fallback Content</div>}
            >
                <div data-testid="test-content">Test Content</div>
            </RenderWhen>
        );

        expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
        expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    });

    it('renders null when condition is false and no fallback is provided', () => {
        const { container } = render(
            <RenderWhen condition={false}>
                <div data-testid="test-content">Test Content</div>
            </RenderWhen>
        );

        expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
        expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('renders multiple children when condition is true', () => {
        render(
            <RenderWhen condition={true}>
                <div data-testid="first-child">First Child</div>
                <div data-testid="second-child">Second Child</div>
            </RenderWhen>
        );

        expect(screen.getByTestId('first-child')).toBeInTheDocument();
        expect(screen.getByTestId('second-child')).toBeInTheDocument();
    });

    it('renders complex JSX children correctly', () => {
        render(
            <RenderWhen condition={true}>
                <div>
                    <h1>Title</h1>
                    <p>Description</p>
                    <button>Click me</button>
                </div>
            </RenderWhen>
        );

        expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles string children correctly', () => {
        render(
            <RenderWhen condition={true}>
                Plain text content
            </RenderWhen>
        );

        expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('handles number children correctly', () => {
        render(
            <RenderWhen condition={true}>
                {42}
            </RenderWhen>
        );

        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('switches between children and fallback when condition changes', () => {
        const { rerender } = render(
            <RenderWhen 
                condition={true}
                fallback={<div data-testid="fallback">Fallback</div>}
            >
                <div data-testid="children">Children</div>
            </RenderWhen>
        );

        expect(screen.getByTestId('children')).toBeInTheDocument();
        expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();

        rerender(
            <RenderWhen 
                condition={false}
                fallback={<div data-testid="fallback">Fallback</div>}
            >
                <div data-testid="children">Children</div>
            </RenderWhen>
        );

        expect(screen.queryByTestId('children')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('handles empty fallback correctly', () => {
        render(
            <RenderWhen 
                condition={false}
                fallback=""
            >
                <div data-testid="children">Children</div>
            </RenderWhen>
        );

        expect(screen.queryByTestId('children')).not.toBeInTheDocument();
        expect(screen.queryByText('Children')).not.toBeInTheDocument();
    });

    it('renders nested RenderWhen components correctly', () => {
        render(
            <RenderWhen condition={true}>
                <RenderWhen condition={true}>
                    <div data-testid="nested-content">Nested Content</div>
                </RenderWhen>
            </RenderWhen>
        );

        expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    });
});