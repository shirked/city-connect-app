export interface Report {
  id: string;
  userId: string;
  photoUrl: string;
  photoHint: string;
  iconName: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  status: 'Submitted' | 'In Progress' | 'Resolved';
  createdAt: string;
  history: { status: string; date: string; notes: string }[];
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}
