import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/ResearchCard';

describe('ResearchCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { hours: 0, topic: '', notes: '' },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<ResearchCard {...defaultProps} />);
      expect(screen.getByText('Research')).toBeInTheDocument();
    });

    it('should display current hours', () => {
      render(<ResearchCard {...defaultProps} value={{ hours: 1.5, topic: '', notes: '' }} />);
      expect(screen.getByDisplayValue('1.5')).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<ResearchCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show topic and notes labels', () => {
      render(<ResearchCard {...defaultProps} />);
      expect(screen.getByText('Topic (optional)')).toBeInTheDocument();
      expect(screen.getByText('Notes (optional)')).toBeInTheDocument();
    });
  });

  describe('Hours Input', () => {
    it('should update hours when input changes', () => {
      render(<ResearchCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('0');

      fireEvent.change(input, { target: { value: '2.5' } });

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 2.5, topic: '', notes: '' });
    });

    it('should handle empty input as 0', () => {
      render(<ResearchCard {...defaultProps} value={{ hours: 1, topic: '', notes: '' }} />);
      const input = screen.getByPlaceholderText('0') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 0, topic: '', notes: '' });
    });
  });

  describe('Quick Action Buttons', () => {
    it('should increase hours by 0.5 when +0.5 button is clicked', () => {
      render(<ResearchCard {...defaultProps} />);
      const button = screen.getByText('+0.5').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 0.5, topic: '', notes: '' });
    });

    it('should increase hours by 1 when +1 button is clicked', () => {
      render(<ResearchCard {...defaultProps} />);
      const button = screen.getByText('+1').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 1, topic: '', notes: '' });
    });

    it('should increase hours by 2 when +2 button is clicked', () => {
      render(<ResearchCard {...defaultProps} />);
      const button = screen.getByText('+2').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 2, topic: '', notes: '' });
    });
  });

  describe('Topic Input', () => {
    it('should update topic when input changes', () => {
      render(<ResearchCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('e.g., AI/ML trends');

      fireEvent.change(input, { target: { value: 'React performance optimization' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        topic: 'React performance optimization',
        notes: ''
      });
    });
  });

  describe('Notes Textarea', () => {
    it('should update notes when textarea changes', () => {
      render(<ResearchCard {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Key insights, takeaways...');

      fireEvent.change(textarea, { target: { value: 'Important findings about hooks' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        topic: '',
        notes: 'Important findings about hooks'
      });
    });
  });
});
