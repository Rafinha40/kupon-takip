// Bir veya birden fazla maçın canlı durumu: skor, dakika, sarı kart ve korner.
// /api/match?ids=123-456-789  (en fazla 20 maç, hepsi TEK istekle)
const { callApi, send } = require('./_football');

function stat(block, type) {
  if (!block) return 0;
  const s = (block.statistics || []).find(x => x.type === type);
  return s ? Number(s.value) || 0 : 0;
}

function toMatch(f) {
  const stats = f.statistics || [];
  const h = stats.find(s => s.team && s.team.id === f.teams.home.id);
  const a = stats.find(s => s.team && s.team.id === f.teams.away.id);
  return {
    id: f.fixture.id,
    status: f.fixture.status.short,
    minute: f.fixture.status.elapsed,
    time: f.fixture.date,
    league: f.league.name,
    home: f.teams.home.name,
    away: f.teams.away.name,
    hasStats: stats.length > 0,
    values: {
      goals: { home: f.goals.home || 0, away: f.goals.away || 0 },
      yellow: { home: stat(h, 'Yellow Cards'), away: stat(a, 'Yellow Cards') },
      corners: { home: stat(h, 'Corner Kicks'), away: stat(a, 'Corner Kicks') },
    },
  };
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const ids = url.searchParams.get('ids') || '';
    if (!/^\d+(-\d+){0,19}$/.test(ids)) return send(res, 400, { error: 'Geçersiz maç numarası.' });

    const { data, remaining } = await callApi(`/fixtures?ids=${ids}&timezone=Europe/Istanbul`);
    send(res, 200, { matches: (data.response || []).map(toMatch), remaining }, 60);
  } catch (e) {
    send(res, e.status || 500, { error: e.message });
  }
};
