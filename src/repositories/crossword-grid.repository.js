// The only file that queries the crossword_grids table.
const { CrosswordGrid } = require('../models');

function create(data = {}) {
  return CrosswordGrid.create(data);
}
function removeById(gridId) {
  return CrosswordGrid.destroy({ where: { grid_id: gridId } });
}

module.exports = { create, removeById };
