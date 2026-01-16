import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NutritionCard } from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics/NutritionCard';

describe('NutritionCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: { calories: 0, protein: 0, carbs: 0, fats: 0, hitCalorieGoal: false },
    onChange: mockOnChange,
    saving: false
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title and icon', () => {
      render(<NutritionCard {...defaultProps} />);
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
    });

    it('should display calorie progress', () => {
      render(<NutritionCard {...defaultProps} value={{ ...defaultProps.value, calories: 1500 }} />);
      expect(screen.getByText('1500 / 3000')).toBeInTheDocument();
    });

    it('should show CheckCircle icon when target is met', () => {
      const { container } = render(
        <NutritionCard {...defaultProps} value={{ ...defaultProps.value, calories: 3000 }} />
      );
      const checkIcon = container.querySelector('svg.text-green-400');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<NutritionCard {...defaultProps} saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show macro input labels', () => {
      render(<NutritionCard {...defaultProps} />);
      expect(screen.getByText('Protein (g)')).toBeInTheDocument();
      expect(screen.getByText('Carbs (g)')).toBeInTheDocument();
      expect(screen.getByText('Fats (g)')).toBeInTheDocument();
    });
  });

  describe('Calorie Progress', () => {
    it('should calculate progress correctly for partial calories', () => {
      render(<NutritionCard {...defaultProps} value={{ ...defaultProps.value, calories: 1500 }} />);
      expect(screen.getByText('1500 / 3000')).toBeInTheDocument();
    });

    it('should show 100% progress when target is met', () => {
      render(<NutritionCard {...defaultProps} value={{ ...defaultProps.value, calories: 3000 }} />);
      expect(screen.getByText('3000 / 3000')).toBeInTheDocument();
    });
  });

  describe('Macro Inputs', () => {
    it('should update protein when input changes', () => {
      render(<NutritionCard {...defaultProps} />);
      const input = screen.getAllByPlaceholderText('0')[0];

      fireEvent.change(input, { target: { value: '150' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 150,
        carbs: 0,
        fats: 0,
        hitCalorieGoal: false
      });
    });

    it('should update carbs when input changes', () => {
      render(<NutritionCard {...defaultProps} />);
      const input = screen.getAllByPlaceholderText('0')[1];

      fireEvent.change(input, { target: { value: '200' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 0,
        carbs: 200,
        fats: 0,
        hitCalorieGoal: false
      });
    });

    it('should update fats when input changes', () => {
      render(<NutritionCard {...defaultProps} />);
      const input = screen.getAllByPlaceholderText('0')[2];

      fireEvent.change(input, { target: { value: '75' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 75,
        hitCalorieGoal: false
      });
    });

    it('should handle empty input as 0', () => {
      render(<NutritionCard {...defaultProps} value={{ ...defaultProps.value, protein: 100 }} />);
      const input = screen.getAllByPlaceholderText('0')[0];

      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        hitCalorieGoal: false
      });
    });
  });

  describe('Hit Calorie Goal Button', () => {
    it('should show "Hit my calorie goal?" when not checked', () => {
      render(<NutritionCard {...defaultProps} />);
      expect(screen.getByText('Hit my calorie goal?')).toBeInTheDocument();
    });

    it('should show "Hit my calorie goal!" when checked', () => {
      render(
        <NutritionCard {...defaultProps} value={{ ...defaultProps.value, hitCalorieGoal: true }} />
      );
      expect(screen.getByText('Hit my calorie goal!')).toBeInTheDocument();
    });

    it('should toggle hitCalorieGoal when button is clicked', () => {
      render(<NutritionCard {...defaultProps} />);
      const button = screen.getByText('Hit my calorie goal?');

      fireEvent.click(button);

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        hitCalorieGoal: true
      });
    });

    it('should uncheck when button is clicked while checked', () => {
      render(
        <NutritionCard {...defaultProps} value={{ ...defaultProps.value, hitCalorieGoal: true }} />
      );
      const button = screen.getByText('Hit my calorie goal!');

      fireEvent.click(button);

      expect(mockOnChange).toHaveBeenCalledWith({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        hitCalorieGoal: false
      });
    });
  });

  describe('Macro Summary', () => {
    it('should display total macros', () => {
      render(
        <NutritionCard
          {...defaultProps}
          value={{ calories: 0, protein: 150, carbs: 200, fats: 75, hitCalorieGoal: false }}
        />
      );
      expect(screen.getByText('425g')).toBeInTheDocument();
    });

    it('should show macro legend labels', () => {
      render(<NutritionCard {...defaultProps} />);
      expect(screen.getByText('Total Macros')).toBeInTheDocument();
      expect(screen.getByText('Protein')).toBeInTheDocument();
      expect(screen.getByText('Carbs')).toBeInTheDocument();
      expect(screen.getByText('Fats')).toBeInTheDocument();
    });
  });
});
