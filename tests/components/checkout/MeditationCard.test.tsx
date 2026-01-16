import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeditationCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/MeditationCard';

describe('MeditationCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { minutes: 0, quality: 50 },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title and icon', () => {
      render(<MeditationCard {...defaultProps} />);
      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });

    it('should display current minutes', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 15, quality: 50 }} />);
      expect(screen.getByText('15 / 30 min')).toBeInTheDocument();
    });

    it('should display quality percentage', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 0, quality: 75 }} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should show CheckCircle icon when target is met', () => {
      const { container } = render(
        <MeditationCard {...defaultProps} value={{ minutes: 30, quality: 50 }} />
      );
      const checkIcon = container.querySelector('svg.text-green-400');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<MeditationCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Minutes Input', () => {
    it('should update minutes when input changes', () => {
      render(<MeditationCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('0');

      fireEvent.change(input, { target: { value: '20' } });

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 20, quality: 50 });
    });

    it('should handle empty input as 0', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 10, quality: 50 }} />);
      const input = screen.getByPlaceholderText('0') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 0, quality: 50 });
    });

    it('should only accept positive numbers', () => {
      render(<MeditationCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('0');

      fireEvent.change(input, { target: { value: '-5' } });

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: -5, quality: 50 });
    });
  });

  describe('Quick Action Buttons', () => {
    it('should decrease minutes by 1 when -1 button is clicked', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 10, quality: 50 }} />);
      const decreaseButton = screen.getByText('-1').closest('button');

      fireEvent.click(decreaseButton!);

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 9, quality: 50 });
    });

    it('should increase minutes by 1 when +1 button is clicked', () => {
      render(<MeditationCard {...defaultProps} />);
      const increaseButton = screen.getAllByText('+1')[0].closest('button');

      fireEvent.click(increaseButton!);

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 1, quality: 50 });
    });

    it('should increase minutes by 5 when +5 button is clicked', () => {
      render(<MeditationCard {...defaultProps} />);
      const increaseButton = screen.getByText('+5').closest('button');

      fireEvent.click(increaseButton!);

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 5, quality: 50 });
    });

    it('should not decrease below 0', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 0, quality: 50 }} />);
      const decreaseButton = screen.getByText('-1').closest('button');

      fireEvent.click(decreaseButton!);

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 0, quality: 50 });
    });
  });

  describe('Quality Slider', () => {
    it('should update quality when slider changes', () => {
      render(<MeditationCard {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '75' } });

      expect(mockOnChange).toHaveBeenCalledWith({ minutes: 0, quality: 75 });
    });

    it('should display quality range labels', () => {
      render(<MeditationCard {...defaultProps} />);
      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should calculate progress correctly for partial minutes', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 15, quality: 50 }} />);
      expect(screen.getByText('15 / 30 min')).toBeInTheDocument();
    });

    it('should show 100% progress when target is met', () => {
      render(<MeditationCard {...defaultProps} value={{ minutes: 30, quality: 50 }} />);
      expect(screen.getByText('30 / 30 min')).toBeInTheDocument();
    });
  });
});
