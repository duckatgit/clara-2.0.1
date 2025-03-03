export interface ReminderPreferences {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  quiet_hours: {
    start: number;
    end: number;
  };
  channels: {
    chat: boolean;
    email: boolean;
    push: boolean;
  };
  types: {
    deadline: boolean;
    progress: boolean;
    milestone: boolean;
    suggestion: boolean;
  };
}

export const defaultPreferences: ReminderPreferences = {
  enabled: true,
  frequency: 'medium',
  quiet_hours: {
    start: 22,
    end: 8,
  },
  channels: {
    chat: true,
    email: false,
    push: false,
  },
  types: {
    deadline: true,
    progress: true,
    milestone: true,
    suggestion: false,
  },
};