module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'QuestionSet',
    {
      set_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'question_sets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
