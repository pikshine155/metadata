
import { differenceInDays, isPast } from 'date-fns';

export const getTimeRemaining = (expirationDate: string | null | undefined): string => {
  if (!expirationDate) return '';
  
  const expDate = new Date(expirationDate);
  if (isPast(expDate)) return 'Expired';
  
  const daysRemaining = differenceInDays(expDate, new Date());
  if (daysRemaining <= 0) return 'Less than a day';
  return `${daysRemaining} days`;
};

export const isPremiumExpired = (expirationDate: string | null | undefined): boolean => {
  if (!expirationDate) return true;
  return isPast(new Date(expirationDate));
};
