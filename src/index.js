import { eq } from 'drizzle-orm';
// The 'pool' export will only exist for WebSocket and node-postgres drivers
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        status: 'scheduled',
        startTime: new Date('2026-03-05T15:00:00Z'),
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }

    console.log('✅ CREATE: New match created:', newMatch);

    // CREATE: Insert a commentary for the match
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 0,
        sequence: 1,
        period: '1st Half',
        eventType: 'start',
        message: 'Match has started',
        metadata: { important: true },
        tags: 'start,match',
      })
      .returning();

    console.log('✅ CREATE: New commentary created:', newCommentary);

    // READ: Select the match
    const foundMatch = await db.select().from(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // UPDATE: Change the match status to live and update score
    const [updatedMatch] = await db
      .update(matches)
      .set({ status: 'live', homeScore: 1, awayScore: 0 })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }

    console.log('✅ UPDATE: Match updated:', updatedMatch);

    // DELETE: Remove the commentary
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ DELETE: Commentary deleted.');

    // DELETE: Remove the match
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // If the pool exists, end it to close the connection
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
