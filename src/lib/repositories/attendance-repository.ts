import { db } from '@/lib/db';
import type { MatchAttendance, AttendanceStatus } from '@/lib/types';

export const attendanceRepository = {
    async getForMatch(matchId: string) {
        return await db.matchAttendances.where({ matchId }).toArray();
    },

    async upsert(matchId: string, playerId: string, status: AttendanceStatus) {
        const attendance: MatchAttendance = { matchId, playerId, status };
        // Dexie's put method works as an "upsert"
        await db.matchAttendances.put(attendance);
        return attendance;
    }
};
