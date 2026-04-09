import { calculateIceShowEligibility } from './attendanceUtils';

describe('Security & Logic Verification: Ice Show Attendance eligibility', () => {
  it('should approve student if attendance is 75% or greater', () => {
    expect(calculateIceShowEligibility(8, 10)).toBe(true); // 80%
    expect(calculateIceShowEligibility(3, 4)).toBe(true);  // 75%
  });

  it('should deny student if attendance is below 75%', () => {
    expect(calculateIceShowEligibility(7, 10)).toBe(false); // 70%
    expect(calculateIceShowEligibility(1, 4)).toBe(false);  // 25%
  });

  it('should handle zero sessions properly without throwing infinity errors', () => {
    expect(calculateIceShowEligibility(0, 0)).toBe(false);
  });
});
