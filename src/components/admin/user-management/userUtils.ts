
import { User } from "./types";

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const downloadMarketingEmails = (users: User[]): void => {
  try {
    const consentedUsers = users.filter(user => user.user_metadata?.marketing_consent === true);
    
    if (consentedUsers.length === 0) {
      throw new Error("No users have consented to marketing emails");
    }
    
    let csvContent = "Name,Email\n";
    consentedUsers.forEach(user => {
      const name = user.user_metadata?.full_name || '';
      const email = user.email || '';
      csvContent += `"${name}","${email}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketing_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading marketing emails:', error);
    throw error;
  }
};
