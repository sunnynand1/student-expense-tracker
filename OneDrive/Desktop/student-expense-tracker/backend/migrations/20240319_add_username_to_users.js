import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Users', 'username', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    after: 'id',
    defaultValue: null
  });

  // Add index for username
  await queryInterface.addIndex('Users', ['username'], {
    unique: true,
    name: 'users_username_unique'
  });
}

export async function down(queryInterface) {
  await queryInterface.removeIndex('Users', 'users_username_unique');
  await queryInterface.removeColumn('Users', 'username');
} 