// A critical piece of logic to verify if a kid attended enough to skate in the big show!
export function calculateIceShowEligibility(attendedSessions: number, totalSessions: number): boolean {
  if (totalSessions <= 0) return false;
  
  const attendancePercentage = (attendedSessions / totalSessions) * 100;
  
  // They must attend at least 75% of the classes to be allowed in the Ice Show
  return attendancePercentage >= 75;
}
