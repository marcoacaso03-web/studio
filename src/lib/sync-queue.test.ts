import * as SyncQueue from './sync-queue';
import { db } from './db';
import { lineupRepository } from './repositories/lineup-repository';
import { eventRepository } from './repositories/event-repository';

// In-memory fake for the Dexie syncQueue table
const fakeQueue: any[] = [];
jest.mock('./db', () => ({
  db: {
    syncQueue: {
      add: jest.fn(async (m: any) => { const row = { ...m, id: fakeQueue.length + 1 }; fakeQueue.push(row); return row.id; }),
      orderBy: jest.fn(() => ({ toArray: async () => [...fakeQueue] })),
      delete: jest.fn(async (id: number) => { const i = fakeQueue.findIndex(r => r.id === id); if (i >= 0) fakeQueue.splice(i, 1); }),
    },
  },
}));

jest.mock('./repositories/lineup-repository', () => ({
  lineupRepository: { save: jest.fn(async () => ({})) },
}));
jest.mock('./repositories/event-repository', () => ({
  eventRepository: {
    add: jest.fn(async () => ({})),
    update: jest.fn(async () => ({})),
    delete: jest.fn(async () => ({})),
  },
}));

beforeEach(() => {
  fakeQueue.length = 0;
  (lineupRepository.save as jest.Mock).mockClear();
  (eventRepository.add as jest.Mock).mockClear();
  (eventRepository.update as jest.Mock).mockClear();
  (eventRepository.delete as jest.Mock).mockClear();
});

describe('sync-queue flushQueue', () => {
  it('applies a queued matchLineups mutation with (payload, seasonId, userId)', async () => {
    await SyncQueue.enqueueMutation({
      collection: 'matchLineups', docId: 'M1', action: 'update',
      payload: { matchId: 'M1', starters: ['P1'], substitutes: [], formation: '4-4-2' },
      userId: 'U1', seasonId: 'S1',
    });

    const applied = await SyncQueue.flushQueue('U1');

    expect(applied).toBe(1);
    expect(lineupRepository.save).toHaveBeenCalledTimes(1);
    expect(lineupRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ matchId: 'M1' }), 'S1', 'U1',
    );
    expect(fakeQueue).toHaveLength(0);
  });

  it('applies matchEvents add with (payload, seasonId, userId) and event.matchId present', async () => {
    await SyncQueue.enqueueMutation({
      collection: 'matchEvents', docId: 'temp-1', action: 'add',
      payload: { matchId: 'M1', type: 'goal', playerId: 'P1', minute: 12, period: '1T', team: 'home' },
      userId: 'U1', seasonId: 'S1', matchId: 'M1',
    });

    const applied = await SyncQueue.flushQueue('U1');

    expect(applied).toBe(1);
    expect(eventRepository.add).toHaveBeenCalledTimes(1);
    // signature: add(event, seasonId, userId) -> event.matchId must be 'M1'
    expect(eventRepository.add).toHaveBeenCalledWith(
      expect.objectContaining({ matchId: 'M1' }), 'S1', 'U1',
    );
  });

  it('applies matchEvents update with (id, matchId, seasonId, data)', async () => {
    await SyncQueue.enqueueMutation({
      collection: 'matchEvents', docId: 'E1', action: 'update',
      payload: { minute: 30 }, userId: 'U1', seasonId: 'S1', matchId: 'M1',
    });

    const applied = await SyncQueue.flushQueue('U1');

    expect(applied).toBe(1);
    expect(eventRepository.update).toHaveBeenCalledTimes(1);
    // signature: update(id, matchId, seasonId, data)
    expect(eventRepository.update).toHaveBeenCalledWith('E1', 'M1', 'S1', { minute: 30 });
  });

  it('applies matchEvents delete with (id, matchId, seasonId)', async () => {
    await SyncQueue.enqueueMutation({
      collection: 'matchEvents', docId: 'E2', action: 'delete',
      payload: {}, userId: 'U1', seasonId: 'S1', matchId: 'M1',
    });

    const applied = await SyncQueue.flushQueue('U1');

    expect(applied).toBe(1);
    expect(eventRepository.delete).toHaveBeenCalledTimes(1);
    // signature: delete(id, matchId, seasonId)
    expect(eventRepository.delete).toHaveBeenCalledWith('E2', 'M1', 'S1');
  });

  it('drops unhandled collections instead of applying with wrong signature', async () => {
    await SyncQueue.enqueueMutation({
      collection: 'players', docId: 'P1', action: 'update',
      payload: { name: 'X' }, userId: 'U1', seasonId: 'S1',
    });

    const applied = await SyncQueue.flushQueue('U1');

    expect(applied).toBe(1); // dropped but removed from queue
    expect(fakeQueue).toHaveLength(0);
    expect(lineupRepository.save).not.toHaveBeenCalled();
    expect(eventRepository.add).not.toHaveBeenCalled();
  });

  it('returns 0 when queue is empty', async () => {
    expect(await SyncQueue.flushQueue('U1')).toBe(0);
  });
});
