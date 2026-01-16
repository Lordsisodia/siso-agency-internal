import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/WorkoutCard';

describe('WorkoutCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { completed: false, type: undefined, duration: undefined, intensity: undefined },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title and icon', () => {
      render(<WorkoutCard {...defaultProps} />);
      expect(screen.getByText('Workout')).toBeInTheDocument();
    });

    it('should show "Did you work out?" button when not completed', () => {
      render(<WorkoutCard {...defaultProps} />);
      expect(screen.getByText('Did you work out?')).toBeInTheDocument();
    });

    it('should show "Workout Complete" button when completed', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      expect(screen.getByText('✓ Workout Complete')).toBeInTheDocument();
    });

    it('should show CheckCircle icon when completed', () => {
      const { container } = render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const checkIcon = container.querySelector('svg.text-green-400');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<WorkoutCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Toggle Completed', () => {
    it('should set completed with defaults when clicking the button', () => {
      render(<WorkoutCard {...defaultProps} />);
      const button = screen.getByText('Did you work out?');

      fireEvent.click(button);

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: true,
        type: 'strength',
        duration: 30,
        intensity: 'moderate'
      });
    });

    it('should uncheck and clear values when clicking complete button', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const button = screen.getByText('✓ Workout Complete');

      fireEvent.click(button);

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: false,
        type: undefined,
        duration: undefined,
        intensity: undefined
      });
    });
  });

  describe('Workout Type Selection', () => {
    it('should show workout type buttons when completed', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );

      expect(screen.getByText('Strength')).toBeInTheDocument();
      expect(screen.getByText('Cardio')).toBeInTheDocument();
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('HIIT')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should update workout type when type button is clicked', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const cardioButton = screen.getByText('Cardio');

      fireEvent.click(cardioButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: true,
        type: 'cardio',
        duration: 30,
        intensity: 'moderate'
      });
    });

    it('should not show workout type buttons when not completed', () => {
      render(<WorkoutCard {...defaultProps} />);
      expect(screen.queryByText('Strength')).not.toBeInTheDocument();
    });
  });

  describe('Duration Input', () => {
    it('should show duration input when completed', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      expect(screen.getByPlaceholderText('30')).toBeInTheDocument();
    });

    it('should update duration when input changes', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const input = screen.getByPlaceholderText('30');

      fireEvent.change(input, { target: { value: '45' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: true,
        type: 'strength',
        duration: 45,
        intensity: 'moderate'
      });
    });

    it('should handle empty input as undefined', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const input = screen.getByPlaceholderText('30');

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: true,
        type: 'strength',
        duration: undefined,
        intensity: 'moderate'
      });
    });
  });

  describe('Intensity Selection', () => {
    it('should show intensity buttons when completed', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
      expect(screen.getByText('Intense')).toBeInTheDocument();
    });

    it('should update intensity when intensity button is clicked', () => {
      render(
        <WorkoutCard
          {...defaultProps}
          value={{ completed: true, type: 'strength', duration: 30, intensity: 'moderate' }}
        />
      );
      const intenseButton = screen.getByText('Intense');

      fireEvent.click(intenseButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        completed: true,
        type: 'strength',
        duration: 30,
        intensity: 'intense'
      });
    });

    it('should not show intensity buttons when not completed', () => {
      render(<WorkoutCard {...defaultProps} />);
      expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });
  });
});
