
const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

const UsersToken = sequelize.define("user-token", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.INTEGER(11),
  },
  active: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
  },
  token: {
    type: DataTypes.STRING(40),
    defaultValue: "",
  },
  os_name: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  os_version: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  bs_name: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  bs_version: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  bs_major: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  client_ip: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  user_agent: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

(async () => {
  await UsersToken.sync({ force: false });
})();

module.exports = UsersToken;
