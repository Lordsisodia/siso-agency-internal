import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReflectionSection } from '@/domains/lifelock/1-daily/7-checkout/ui/components/reflection/ReflectionSection';

describe('ReflectionSection', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    wentWell: ['', '', ''],
    evenBetterIf: ['', '', ''],
    onChange: mockOnChange
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the reflection section', () => {
      render(<ReflectionSection {...defaultProps} />);
      expect(screen.getByText(/What went well/i)).toBeInTheDocument();
      expect(screen.getByText(/Even better if/i)).toBeInTheDocument();
    });

    it('should render 3 empty inputs for wentWell', () => {
      render(<ReflectionSection {...defaultProps} />);
      const inputs = screen.getAllByPlaceholderText(/Something that went well/i);
      expect(inputs).toHaveLength(3);
    });

    it('should render 3 empty inputs for evenBetterIf', () => {
      render(<ReflectionSection {...defaultProps} />);
      const inputs = screen.getAllByPlaceholderText(/Something to improve/i);
      expect(inputs).toHaveLength(3);
    });
  });

  describe('Went Well Section', () => {
    it('should update wentWell item when input changes', () => {
      render(<ReflectionSection {...defaultProps} />);
      const input = screen.getAllByPlaceholderText(/Something that went well/i)[0];

      fireEvent.change(input, { target: { value: 'Completed deep work session' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        wentWell: ['Completed deep work session', '', '']
      });
    });

    it('should add new wentWell item when Add button is clicked', () => {
      render(<ReflectionSection {...defaultProps} />);
      const addButton = screen.getAllByText('Add')[0];

      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        wentWell: ['', '', '', '']
      });
    });

    it('should remove wentWell item when Remove button is clicked', () => {
      render(
        <ReflectionSection
          {...defaultProps}
          wentWell={['Item 1', 'Item 2', 'Item 3']}
        />
      );

      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg')?.classList.contains('h-3.5')
      );
      fireEvent.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith({
        wentWell: ['Item 2', 'Item 3']
      });
    });
  });

  describe('Even Better If Section', () => {
    it('should update evenBetterIf item when input changes', () => {
      render(<ReflectionSection {...defaultProps} />);
      const input = screen.getAllByPlaceholderText(/Something to improve/i)[0];

      fireEvent.change(input, { target: { value: 'Started work earlier' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        evenBetterIf: ['Started work earlier', '', '']
      });
    });

    it('should add new evenBetterIf item when Add button is clicked', () => {
      render(<ReflectionSection {...defaultProps} />);
      const addButton = screen.getAllByText('Add')[1];

      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        evenBetterIf: ['', '', '', '']
      });
    });

    it('should remove evenBetterIf item when Remove button is clicked', () => {
      render(
        <ReflectionSection
          {...defaultProps}
          evenBetterIf={['Improve 1', 'Improve 2', 'Improve 3']}
        />
      );

      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg')?.classList.contains('h-3.5')
      );
      fireEvent.click(removeButtons[2]); // Third item

      expect(mockOnChange).toHaveBeenCalledWith({
        evenBetterIf: ['Improve 1', 'Improve 2']
      });
    });
  });

  describe('Keyboard Interactions', () => {
    it('should handle Enter key in wentWell input', () => {
      render(<ReflectionSection {...defaultProps} />);
      const input = screen.getAllByPlaceholderText(/Something that went well/i)[0];

      fireEvent.keyDown(input, { key: 'Enter' });

      // Enter key should trigger add item
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle Backspace on empty input to remove item', () => {
      render(
        <ReflectionSection
          {...defaultProps}
          wentWell={['Item 1', '', '']}
        />
      );
      const input = screen.getAllByPlaceholderText(/Something that went well/i)[1];

      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(mockOnChange).toHaveBeenCalledWith({
        wentWell: ['Item 1', '']
      });
    });
  });

  describe('State Management', () => {
    it('should sync props to local state when wentWell changes', () => {
      const { rerender } = render(<ReflectionSection {...defaultProps} />);

      rerender(
        <ReflectionSection
          {...defaultProps}
          wentWell={['New item 1', 'New item 2', 'New item 3']}
        />
      );

      const inputs = screen.getAllByPlaceholderText(/Something that went well/i);
      expect(inputs[0]).toHaveValue('New item 1');
      expect(inputs[1]).toHaveValue('New item 2');
      expect(inputs[2]).toHaveValue('New item 3');
    });

    it('should sync props to local state when evenBetterIf changes', () => {
      const { rerender } = render(<ReflectionSection {...defaultProps} />);

      rerender(
        <ReflectionSection
          {...defaultProps}
          evenBetterIf={['Improve 1', 'Improve 2', 'Improve 3']}
        />
      );

      const inputs = screen.getAllByPlaceholderText(/Something to improve/i);
      expect(inputs[0]).toHaveValue('Improve 1');
      expect(inputs[1]).toHaveValue('Improve 2');
      expect(inputs[2]).toHaveValue('Improve 3');
    });
  });

  describe('Visual Elements', () => {
    it('should show checkmark icon for wentWell items', () => {
      render(<ReflectionSection {...defaultProps} />);
      // CheckCircle2 icons should be present for went well section
      const checkIcons = screen.getAllByTestId('lucide-check-circle-2');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should show trending up icon for evenBetterIf section', () => {
      render(<ReflectionSection {...defaultProps} />);
      expect(screen.getByTestId('lucide-trending-up')).toBeInTheDocument();
    });

    it('should show expandable sections', () => {
      render(<ReflectionSection {...defaultProps} />);
      // Should have buttons to toggle sections
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
