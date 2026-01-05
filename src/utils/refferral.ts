export const generateReferralCode = (): string => {
  return (
    "REF-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
};
