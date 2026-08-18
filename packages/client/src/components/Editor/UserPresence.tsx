import React from 'react';

interface AwarenessUser {
  name: string;
  color: string;
  id: string;
}

interface AwarenessState {
  clientId: number;
  user: AwarenessUser;
}

interface UserPresenceProps {
  awarenessStates: AwarenessState[];
}

export default function UserPresence({ awarenessStates }: UserPresenceProps) {
  if (awarenessStates.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {awarenessStates.map((state, index) => {
        const initials = state.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        return (
          <div
            key={state.clientId}
            title={state.user.name}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: state.user.color,
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
              border: '2px solid var(--color-surface)',
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: awarenessStates.length - index,
            }}
          >
            {initials}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                border: '1px solid var(--color-surface)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
