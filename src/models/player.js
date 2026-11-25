module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Player',
    {
      player_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      nickname: { type: DataTypes.STRING(30), allowNull: false },
      player_color: { type: DataTypes.STRING(10), allowNull: false },
      token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      device_platform: { type: DataTypes.STRING(20), allowNull: true },
      joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'players', timestamps: false }
  );
