export interface Poll {
  _id: string;
  title: string;
  description: string;
  options: string[];
  createdBy: {
    _id: string;
    username: string;
  };
  endDate: Date;
  isActive: boolean;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollResult {
  option: string;
  count: number;
  percentage: number;
  hasVoted: boolean;
}

export interface PollWithResults extends Poll {
  results: PollResult[];
} 