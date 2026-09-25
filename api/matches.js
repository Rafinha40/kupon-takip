// Günün maçlarını listeler: /api/matches?date=2026-09-25
const { callApi, send } = require('./_football');

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const date = url.searchParams.get('date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return send(res, 400, { error: 'Tarih YYYY-AA-GG biçiminde olmalı.' });

    const { data, remaining } = await callApi(`/fixtures?date=${date}&timezone=Europe/Istanbul`);
    const matches = (data.response || []).map(f => ({
      id: f.fixture.id,
      time: f.fixture.date,
      status: f.fixture.status.short,
      minute: f.fixture.status.elapsed,
      league: f.league.name,
      country: f.league.country,
      home: f.teams.home.name,
      away: f.teams.away.name,
      goals: f.goals,
    }));
    send(res, 200, { matches, remaining }, 300);
  } catch (e) {
    send(res, e.status || 500, { error: e.message });
  }
};
