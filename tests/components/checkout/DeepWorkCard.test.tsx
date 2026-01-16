import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeepWorkCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/DeepWorkCard';

describe('DeepWorkCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { hours: 0, quality: 50 },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<DeepWorkCard {...defaultProps} />);
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
    });

    it('should display current hours', () => {
      render(<DeepWorkCard {...defaultProps} value={{ hours: 2.5, quality: 50 }} />);
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    it('should display quality percentage', () => {
      render(<DeepWorkCard {...defaultProps} value={{ hours: 0, quality: 75 }} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<DeepWorkCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Hours Input', () => {
    it('should update hours when input changes', () => {
      render(<DeepWorkCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('0');

      fireEvent.change(input, { target: { value: '3.5' } });

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 3.5, quality: 50 });
    });

    it('should handle empty input as 0', () => {
      render(<DeepWorkCard {...defaultProps} value={{ hours: 2, quality: 50 }} />);
      const input = screen.getByPlaceholderText('0') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 0, quality: 50 });
    });
  });

  describe('Quick Action Buttons', () => {
    it('should increase hours by 0.5 when +0.5 button is clicked', () => {
      render(<DeepWorkCard {...defaultProps} />);
      const button = screen.getByText('+0.5').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 0.5, quality: 50 });
    });

    it('should increase hours by 1 when +1 button is clicked', () => {
      render(<DeepWorkCard {...defaultProps} />);
      const button = screen.getByText('+1').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 1, quality: 50 });
    });

    it('should increase hours by 2 when +2 button is clicked', () => {
      render(<DeepWorkCard {...defaultProps} />);
      const button = screen.getByText('+2').closest('button');

      fireEvent.click(button!);

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 2, quality: 50 });
    });
  });

  describe('Quality Slider', () => {
    it('should update quality when slider changes', () => {
      render(<DeepWorkCard {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '80' } });

      expect(mockOnChange).toHaveBeenCalledWith({ hours: 0, quality: 80 });
    });

    it('should display quality range labels', () => {
      render(<DeepWorkCard {...defaultProps} />);
      expect(screen.getByText('Low Focus')).toBeInTheDocument();
      expect(screen.getByText('Peak Flow')).toBeInTheDocument();
    });
  });
});
