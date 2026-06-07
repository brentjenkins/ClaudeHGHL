import { Level } from 'level';
import { writeFileSync } from 'fs';

const db = new Level('/tmp/hghl_ls_copy', { createIfMissing: false });
const TARGET_KEY = '_http://localhost:8099\x00\x01nhl_players_v3';

try {
  const raw = await db.get(TARGET_KEY);
  const buf = Buffer.from(raw);
  // Bytes: 00 5b 00 7b ... = UTF-16BE (big endian), no BOM
  // Swap bytes to get UTF-16LE, then decode
  const swapped = Buffer.allocUnsafe(buf.length);
  for (let i = 0; i < buf.length - 1; i += 2) {
    swapped[i]   = buf[i + 1];
    swapped[i+1] = buf[i];
  }
  if (buf.length % 2 !== 0) swapped[buf.length - 1] = buf[buf.length - 1];
  const jsonStr = swapped.toString('utf16le');
  writeFileSync('/tmp/hghl_players.json', jsonStr);
  const players = JSON.parse(jsonStr);
  console.log(`Extracted ${players.length} players`);
  const withTeam = players.filter(p => p.fantasyTeam2425);
  console.log(`Players with fantasyTeam2425: ${withTeam.length}`);
  const sample = withTeam.slice(0, 2);
  console.log('Sample:', JSON.stringify(sample.map(p => ({
    name: p.name, team: p.fantasyTeam2425, sim2526: p.sim2526,
    cap: p.cap, cap2526: p.cap2526,
    pts2526blend: [p.proj2526_athletic, p.proj2526_dfo, p.proj2526_espn].filter(v=>v!=null)
  })), null, 2));
} catch(e) {
  console.error('Error:', e.message.slice(0, 200));
} finally {
  await db.close();
}
