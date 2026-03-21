import { matchRepository } from './match-repository';
import { getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('matchRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(matchRepository).toBeDefined();
    });

    it('getAll should call getDocs', async () => {
        (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
        const result = await matchRepository.getAll('test-user', 'test-season');
        expect(getDocs).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('getById should call getDoc', async () => {
        (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => ({ opponent: 'Team B' }), id: '1' });
        const result = await matchRepository.getById('1', 'test-season');
        expect(getDoc).toHaveBeenCalled();
        expect(result).toHaveProperty('opponent', 'Team B');
    });

    it('add should call setDoc', async () => {
        const matchData: any = { opponent: 'Team B', type: 'Campionato', date: new Date().toISOString(), userId: 'user-1', seasonId: 'season-1' };
        await matchRepository.add(matchData);
        expect(setDoc).toHaveBeenCalled();
    });
});
