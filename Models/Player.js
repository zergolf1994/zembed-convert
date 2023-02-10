const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

const Lists = sequelize.define(
  "player",
  {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
    },
    advert: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    },
    domain: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    api_key: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    slug: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["domain"],
      },
      {
        unique: false,
        fields: ["userId"],
      },
      {
        unique: false,
        fields: ["api_key"],
      },
      {
        unique: false,
        fields: ["slug"],
      },
    ],
  }
);

const Sets = sequelize.define(
  "player_set",
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
        fields: ["playerId"],
      },
    ],
  }
);

(async () => {
  await Lists.sync({ force: false });
  await Sets.sync({ force: false });
})();

module.exports = { Lists, Sets };
