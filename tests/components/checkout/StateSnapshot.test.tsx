import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StateSnapshot } from '@/domains/lifelock/1-daily/7-checkout/ui/components/state/StateSnapshot';

describe('StateSnapshot', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    moodStart: 5,
    moodEnd: 5,
    energyLevel: 5,
    stressLevel: 5,
    onChange: mockOnChange
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<StateSnapshot {...defaultProps} />);
      expect(screen.getByText('State Snapshot')).toBeInTheDocument();
    });

    it('should display mood delta', () => {
      render(<StateSnapshot {...defaultProps} moodStart={4} moodEnd={7} />);
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('should display energy level', () => {
      render(<StateSnapshot {...defaultProps} energyLevel={8} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should display stress level', () => {
      render(<StateSnapshot {...defaultProps} stressLevel={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display day rating', () => {
      render(<StateSnapshot {...defaultProps} />);
      expect(screen.getByText('Day Rating')).toBeInTheDocument();
    });
  });

  describe('Mood Section', () => {
    it('should show mood improvement message when moodDelta > 0', () => {
      render(<StateSnapshot {...defaultProps} moodStart={4} moodEnd={7} />);
      expect(screen.getByText(/Your mood improved by 3 points/i)).toBeInTheDocument();
    });

    it('should expand mood section when clicked', () => {
      render(<StateSnapshot {...defaultProps} />);
      const moodButton = screen.getByText('State Snapshot').parentElement?.querySelector('button');

      fireEvent.click(moodButton!);

      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('should update moodStart when slider changes', () => {
      render(<StateSnapshot {...defaultProps} />);
      const moodButton = screen.getByText('State Snapshot').parentElement?.querySelector('button');
      fireEvent.click(moodButton!);

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '7' } });

      expect(mockOnChange).toHaveBeenCalledWith({ moodStart: 7 });
    });

    it('should update moodEnd when slider changes', () => {
      render(<StateSnapshot {...defaultProps} />);
      const moodButton = screen.getByText('State Snapshot').parentElement?.querySelector('button');
      fireEvent.click(moodButton!);

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[1], { target: { value: '8' } });

      expect(mockOnChange).toHaveBeenCalledWith({ moodEnd: 8 });
    });

    it('should display correct emoji for low mood', () => {
      render(<StateSnapshot {...defaultProps} moodStart={2} />);
      expect(screen.getByText('😔')).toBeInTheDocument();
    });

    it('should display correct emoji for medium mood', () => {
      render(<StateSnapshot {...defaultProps} moodStart={5} />);
      expect(screen.getByText('😐')).toBeInTheDocument();
    });

    it('should display correct emoji for high mood', () => {
      render(<StateSnapshot {...defaultProps} moodStart={8} />);
      expect(screen.getByText('😊')).toBeInTheDocument();
    });
  });

  describe('Energy Section', () => {
    it('should expand energy section when clicked', () => {
      render(<StateSnapshot {...defaultProps} />);
      const buttons = screen.getAllByText('Energy');
      const energyButton = buttons.find(btn => btn.tagName === 'BUTTON');

      fireEvent.click(energyButton!);

      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Drained')).toBeInTheDocument();
      expect(screen.getByText('Energized')).toBeInTheDocument();
    });

    it('should update energyLevel when slider changes', () => {
      render(<StateSnapshot {...defaultProps} />);
      const buttons = screen.getAllByText('Energy');
      const energyButton = buttons.find(btn => btn.tagName === 'BUTTON');
      fireEvent.click(energyButton!);

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '8' } });

      expect(mockOnChange).toHaveBeenCalledWith({ energyLevel: 8 });
    });
  });

  describe('Stress Section', () => {
    it('should expand stress section when clicked', () => {
      render(<StateSnapshot {...defaultProps} />);
      const buttons = screen.getAllByText('Stress');
      const stressButton = buttons.find(btn => btn.tagName === 'BUTTON');

      fireEvent.click(stressButton!);

      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Calm')).toBeInTheDocument();
      expect(screen.getByText('Overwhelmed')).toBeInTheDocument();
    });

    it('should update stressLevel when slider changes', () => {
      render(<StateSnapshot {...defaultProps} />);
      const buttons = screen.getAllByText('Stress');
      const stressButton = buttons.find(btn => btn.tagName === 'BUTTON');
      fireEvent.click(stressButton!);

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith({ stressLevel: 3 });
    });
  });

  describe('Day Rating Calculation', () => {
    it('should calculate day rating correctly', () => {
      render(<StateSnapshot {...defaultProps} moodEnd={7} energyLevel={8} stressLevel={3} />);
      // Day Rating = (moodEnd + energyLevel + (11 - stressLevel)) / 3
      // = (7 + 8 + (11 - 3)) / 3 = (7 + 8 + 8) / 3 = 23 / 3 = 7.67 -> 8
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should show average description', () => {
      render(<StateSnapshot {...defaultProps} />);
      expect(screen.getByText('Avg of mood, energy, & calm')).toBeInTheDocument();
    });
  });
});
