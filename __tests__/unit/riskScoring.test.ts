/**
 * Unit tests for Risk Scoring logic
 * Tests the core business logic for calculating fraud risk scores
 */

describe('Risk Scoring Service', () => {
  describe('calculateInherentScore', () => {
    const calculateInherentScore = (impact: number, likelihood: number): number => {
      if (impact < 1 || impact > 5 || likelihood < 1 || likelihood > 5) {
        throw new Error('Impact and likelihood must be between 1 and 5');
      }
      if (!Number.isInteger(impact) || !Number.isInteger(likelihood)) {
        throw new Error('Values must be integers');
      }
      return impact * likelihood;
    };

    it('should calculate inherent score correctly for valid inputs', () => {
      expect(calculateInherentScore(5, 4)).toBe(20);
      expect(calculateInherentScore(3, 3)).toBe(9);
      expect(calculateInherentScore(2, 5)).toBe(10);
    });

    it('should handle minimum values (1x1)', () => {
      expect(calculateInherentScore(1, 1)).toBe(1);
    });

    it('should handle maximum values (5x5)', () => {
      expect(calculateInherentScore(5, 5)).toBe(25);
    });

    it('should throw error for impact out of range', () => {
      expect(() => calculateInherentScore(6, 3)).toThrow('Impact and likelihood must be between 1 and 5');
      expect(() => calculateInherentScore(0, 3)).toThrow('Impact and likelihood must be between 1 and 5');
    });

    it('should throw error for likelihood out of range', () => {
      expect(() => calculateInherentScore(3, 6)).toThrow('Impact and likelihood must be between 1 and 5');
      expect(() => calculateInherentScore(3, 0)).toThrow('Impact and likelihood must be between 1 and 5');
    });

    it('should throw error for non-integer values', () => {
      expect(() => calculateInherentScore(3.5, 4)).toThrow('Values must be integers');
      expect(() => calculateInherentScore(3, 4.5)).toThrow('Values must be integers');
    });
  });

  describe('calculateResidualScore', () => {
    type ControlStrength = 'very-strong' | 'reasonably-strong' | 'weak';

    const calculateResidualScore = (
      inherentScore: number,
      controlStrength: ControlStrength
    ): number => {
      const reductionMap: Record<ControlStrength, number> = {
        'very-strong': 0.4,
        'reasonably-strong': 0.2,
        'weak': 0,
      };

      const reduction = reductionMap[controlStrength];
      if (reduction === undefined) {
        throw new Error('Invalid control strength');
      }

      return Math.round(inherentScore * (1 - reduction));
    };

    it('should apply 40% reduction for very-strong controls', () => {
      expect(calculateResidualScore(20, 'very-strong')).toBe(12);
      expect(calculateResidualScore(10, 'very-strong')).toBe(6);
    });

    it('should apply 20% reduction for reasonably-strong controls', () => {
      expect(calculateResidualScore(20, 'reasonably-strong')).toBe(16);
      expect(calculateResidualScore(10, 'reasonably-strong')).toBe(8);
    });

    it('should apply 0% reduction for weak controls', () => {
      expect(calculateResidualScore(20, 'weak')).toBe(20);
      expect(calculateResidualScore(15, 'weak')).toBe(15);
    });

    it('should round residual score to nearest integer', () => {
      expect(calculateResidualScore(15, 'very-strong')).toBe(9); // 15 * 0.6 = 9
      expect(calculateResidualScore(13, 'very-strong')).toBe(8); // 13 * 0.6 = 7.8 -> 8
    });
  });

  describe('determinePriority', () => {
    type Priority = 'high' | 'medium' | 'low';

    const determinePriority = (score: number): Priority => {
      if (score >= 15) return 'high';
      if (score >= 8) return 'medium';
      return 'low';
    };

    it('should classify high priority correctly', () => {
      expect(determinePriority(25)).toBe('high');
      expect(determinePriority(20)).toBe('high');
      expect(determinePriority(15)).toBe('high');
    });

    it('should classify medium priority correctly', () => {
      expect(determinePriority(14)).toBe('medium');
      expect(determinePriority(10)).toBe('medium');
      expect(determinePriority(8)).toBe('medium');
    });

    it('should classify low priority correctly', () => {
      expect(determinePriority(7)).toBe('low');
      expect(determinePriority(5)).toBe('low');
      expect(determinePriority(1)).toBe('low');
    });

    it('should handle boundary values correctly', () => {
      expect(determinePriority(15)).toBe('high');  // Lower bound of high
      expect(determinePriority(14)).toBe('medium'); // Upper bound of medium
      expect(determinePriority(8)).toBe('medium');  // Lower bound of medium
      expect(determinePriority(7)).toBe('low');     // Upper bound of low
    });
  });
});
