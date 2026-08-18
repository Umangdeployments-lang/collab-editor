import { useEffect, useState } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface AwarenessUser {
  name: string;
  color: string;
  id: string;
}

interface AwarenessState {
  clientId: number;
  user: AwarenessUser;
}

export function useAwareness(provider: HocuspocusProvider) {
  const [awarenessStates, setAwarenessStates] = useState<AwarenessState[]>([]);

  useEffect(() => {
    // provider.awareness can be null before the connection is established
    const awareness = provider.awareness;
    if (!awareness) return;

    const updateAwareness = () => {
      const states = awareness.getStates();
      const newStates: AwarenessState[] = [];
      states.forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          newStates.push({ clientId, user: state.user as AwarenessUser });
        }
      });
      setAwarenessStates(newStates);
    };

    awareness.on('update', updateAwareness);
    updateAwareness();

    return () => {
      awareness.off('update', updateAwareness);
    };
  }, [provider]);

  return awarenessStates;
}
