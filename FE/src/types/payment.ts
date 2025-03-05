interface Payment {
    _id: string;
    orderCode: string;
    orderName: string;
    amount: number;
    description?: string;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    returnUrl?: string;
    cancelUrl?: string;
  }