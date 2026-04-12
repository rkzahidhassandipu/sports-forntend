
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
  isActive: boolean;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface NewsletterActionDto {
  email: string;
  name?: string; // Optional for subscription
}

export interface SubscribeResponse {
  message: string;
  // Usually returns a message like "Please check your email to confirm"
}