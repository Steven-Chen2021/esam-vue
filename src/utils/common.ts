export function verifyMainFormat(mailAddress) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(mailAddress);
}
