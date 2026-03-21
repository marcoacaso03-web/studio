import { seasonRepository } from './season-repository';
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
  orderBy: jest.fn(),
}));

describe('seasonRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(seasonRepository).toBeDefined();
    });

    it('getAll should call getDocs', async () => {
        (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
        const result = await seasonRepository.getAll('test-owner');
        expect(getDocs).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('getActive should call getDocs', async () => {
        (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [{ data: () => ({ isActive: true }), id: '1' }] });
        const result = await seasonRepository.getActive('test-owner');
        expect(getDocs).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('add should call setDoc', async () => {
        await seasonRepository.add('Season 1', 'test-owner');
        expect(setDoc).toHaveBeenCalled();
    });
});
