const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

const Lists = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  active: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
  },
  role: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
  },
  email: {
    type: DataTypes.STRING(255),
    defaultValue: "",
  },
  username: {
    type: DataTypes.STRING(255),
    defaultValue: "",
  },
  password: {
    type: DataTypes.STRING(60),
    defaultValue: "",
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});
const Sets = sequelize.define(
  "user_set",
  {
    name: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    value: {
      type: DataTypes.TEXT("long"),
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["name"],
      },
      {
        unique: false,
        fields: ["userId"],
      },
    ],
  }
);

(async () => {
  await Lists.sync({ force: false });
  await Sets.sync({ force: false });
})();

module.exports = { Lists, Sets };
