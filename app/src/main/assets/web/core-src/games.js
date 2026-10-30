// Port of Games.swift (Game model only)
export function Game(id, name, playing, extra = {}) {
  return { id, name, playing, icon: null, wide: null, rating: null, ...extra };
}
