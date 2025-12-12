import { describe, it, expect } from 'vitest';

describe('Formatting Utilities', () => {
  describe('Currency Formatting', () => {
    it('should format numbers with currency symbol', () => {
      const formatCurrency = (value: number, symbol: string = '$') => {
        return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56, 'LKR ')).toBe('LKR 1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate percentage correctly', () => {
      const calculatePercentage = (current: number, target: number) => {
        if (target === 0) return 0;
        return Math.round((current / target) * 100);
      };

      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(100, 100)).toBe(100);
      expect(calculatePercentage(150, 100)).toBe(150);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };

      const result = formatDate('2025-01-15T10:30:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });
  });

  describe('Target Progress', () => {
    it('should determine progress status correctly', () => {
      const getProgressStatus = (percentage: number) => {
        if (percentage >= 100) return 'completed';
        if (percentage >= 75) return 'on-track';
        if (percentage >= 50) return 'moderate';
        if (percentage >= 25) return 'behind';
        return 'critical';
      };

      expect(getProgressStatus(100)).toBe('completed');
      expect(getProgressStatus(150)).toBe('completed');
      expect(getProgressStatus(80)).toBe('on-track');
      expect(getProgressStatus(60)).toBe('moderate');
      expect(getProgressStatus(30)).toBe('behind');
      expect(getProgressStatus(10)).toBe('critical');
    });
  });

  describe('Color Validation', () => {
    it('should validate hex color codes', () => {
      const isValidHexColor = (color: string) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
      };

      expect(isValidHexColor('#3B82F6')).toBe(true);
      expect(isValidHexColor('#fff')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('invalid')).toBe(false);
      expect(isValidHexColor('3B82F6')).toBe(false);
    });
  });
});
