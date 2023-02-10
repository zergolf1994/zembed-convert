const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

const UsersPlan = sequelize.define("user-plan", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
  },
  active: {
    type: DataTypes.INTEGER(1),
    defaultValue: 1,
  },
  used_space: {
    type: DataTypes.BIGINT(255),
    defaultValue: 0,
  },
  disc_space: {
    type: DataTypes.BIGINT(255),
    defaultValue: 0,
  },
  percent_value: {
    type: DataTypes.INTEGER(3),
    defaultValue: 0,
  },
  price: {
    type: DataTypes.INTEGER(11),
    defaultValue: 0,
  },
  expiredAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

(async () => {
  await UsersPlan.sync({ force: false });
})();


module.exports = UsersPlan;