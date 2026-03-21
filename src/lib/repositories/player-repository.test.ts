import { playerRepository } from './player-repository';
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
  writeBatch: jest.fn(() => ({ set: jest.fn(), commit: jest.fn() }))
}));

describe('playerRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(playerRepository).toBeDefined();
    });

    it('getAll should call getDocs', async () => {
        (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
        const result = await playerRepository.getAll('test-user', 'test-season');
        expect(getDocs).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('getById should call getDoc', async () => {
        (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => ({ name: 'Test' }), id: '1' });
        const result = await playerRepository.getById('1', 'test-season');
        expect(getDoc).toHaveBeenCalled();
        expect(result).toHaveProperty('name', 'Test');
    });

    it('add should call setDoc', async () => {
        const createData: any = { name: 'Player', role: 'Attaccante', seasonId: 'season-1', userId: 'user-1' };
        await playerRepository.add(createData);
        expect(setDoc).toHaveBeenCalled();
    });
});
