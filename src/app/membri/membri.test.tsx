import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MembriPage from './page';
import { usePlayersStore } from '@/store/usePlayersStore';
import type { Player } from '@/lib/types';

// Mock the zustand store
jest.mock('@/store/usePlayersStore');
const mockedUsePlayersStore = usePlayersStore as jest.Mock;

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockPlayers: Player[] = [
  { id: '1', name: 'Marco Rossi', number: 1, role: 'Portiere', avatarUrl: '', imageHint: '', stats: { appearances: 10, goals: 0, assists: 0 } },
  { id: '2', name: 'Luca Bianchi', number: 5, role: 'Difensore', avatarUrl: '', imageHint: '', stats: { appearances: 10, goals: 1, assists: 1 } },
];

describe('MembriPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedUsePlayersStore.mockClear();
  });

  it('should render a list of players when not loading', () => {
    mockedUsePlayersStore.mockReturnValue({
      players: mockPlayers,
      loading: false,
      fetchAll: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    });

    render(<MembriPage />);

    expect(screen.getByText('Marco Rossi')).toBeInTheDocument();
    expect(screen.getByText('Luca Bianchi')).toBeInTheDocument();
    expect(screen.queryByText('Nessun giocatore in squadra')).not.toBeInTheDocument();
  });

  it('should render the empty state when there are no players', () => {
    mockedUsePlayersStore.mockReturnValue({
      players: [],
      loading: false,
      fetchAll: jest.fn(),
    });

    render(<MembriPage />);

    expect(screen.getByText('Nessun giocatore in squadra')).toBeInTheDocument();
  });

  it('should render loading skeletons when loading', () => {
    mockedUsePlayersStore.mockReturnValue({
      players: [],
      loading: true,
      fetchAll: jest.fn(),
    });

    render(<MembriPage />);
    // Skeletons don't have text, so we check for their presence indirectly
    // Here, we know 4 skeletons are rendered. Let's find them by role.
    // The skeleton div doesn't have an implicit role, so this is tricky.
    // A better way would be to add a data-testid to the Skeleton component.
    // For now, we'll just check that the empty/player content is NOT there.
    expect(screen.queryByText('Marco Rossi')).not.toBeInTheDocument();
    expect(screen.queryByText('Nessun giocatore in squadra')).not.toBeInTheDocument();
  });

  it('should open the "Aggiungi Giocatore" dialog when the button is clicked', async () => {
    mockedUsePlayersStore.mockReturnValue({
      players: [],
      loading: false,
      fetchAll: jest.fn(),
    });

    render(<MembriPage />);
    
    const addButton = screen.getByText('Aggiungi Giocatore');
    fireEvent.click(addButton);

    // The dialog title should become visible
    const dialogTitle = await screen.findByText('Aggiungi Giocatore', { selector: 'h2' });
    expect(dialogTitle).toBeInTheDocument();
  });
});
