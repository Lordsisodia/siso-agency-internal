import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SleepCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/SleepCard';

describe('SleepCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { hours: 0, bedTime: '', wakeTime: '', quality: 50 },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<SleepCard {...defaultProps} />);
      expect(screen.getByText('Sleep')).toBeInTheDocument();
    });

    it('should display current hours', () => {
      render(<SleepCard {...defaultProps} value={{ ...defaultProps.value, hours: 7.5 }} />);
      expect(screen.getByText('7.5h')).toBeInTheDocument();
    });

    it('should display quality percentage', () => {
      render(<SleepCard {...defaultProps} value={{ hours: 0, bedTime: '', wakeTime: '', quality: 75 }} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<SleepCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show bedtime and wake time labels', () => {
      render(<SleepCard {...defaultProps} />);
      expect(screen.getByText('Bedtime')).toBeInTheDocument();
      expect(screen.getByText('Wake Time')).toBeInTheDocument();
    });
  });

  describe('Hours Input', () => {
    it('should update hours when input changes', () => {
      render(<SleepCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('0');

      fireEvent.change(input, { target: { value: '7.5' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 7.5,
        bedTime: '',
        wakeTime: '',
        quality: 50
      });
    });

    it('should handle empty input as 0', () => {
      render(<SleepCard {...defaultProps} value={{ ...defaultProps.value, hours: 8 }} />);
      const input = screen.getByPlaceholderText('0') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        bedTime: '',
        wakeTime: '',
        quality: 50
      });
    });
  });

  describe('BedTime and WakeTime Inputs', () => {
    it('should update bedTime when input changes', () => {
      render(<SleepCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('22:00');

      fireEvent.change(input, { target: { value: '23:30' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        bedTime: '23:30',
        wakeTime: '',
        quality: 50
      });
    });

    it('should update wakeTime when input changes', () => {
      render(<SleepCard {...defaultProps} />);
      const input = screen.getByPlaceholderText('06:00');

      fireEvent.change(input, { target: { value: '07:00' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        bedTime: '',
        wakeTime: '07:00',
        quality: 50
      });
    });
  });

  describe('Quality Slider', () => {
    it('should update quality when slider changes', () => {
      render(<SleepCard {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '80' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        hours: 0,
        bedTime: '',
        wakeTime: '',
        quality: 80
      });
    });

    it('should display quality range labels', () => {
      render(<SleepCard {...defaultProps} />);
      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  describe('Sleep Progress', () => {
    it('should calculate sleep hours correctly when both times are set', () => {
      render(
        <SleepCard
          {...defaultProps}
          value={{ hours: 0, bedTime: '23:00', wakeTime: '07:00', quality: 50 }}
        />
      );
      // With bedtime 23:00 and wake time 07:00, that's 8 hours
      expect(screen.getByText('8h')).toBeInTheDocument();
    });
  });
});
