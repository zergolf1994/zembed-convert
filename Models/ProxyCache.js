const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

const ProxyCache = sequelize.define(
  "proxy-cache",
  {
    name: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    value: {
      type: DataTypes.TEXT("long"),
    },
    fileId: {
      type: DataTypes.INTEGER(11),
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
        fields: ["fileId"],
      },
    ],
  }
);

(async () => {
  await ProxyCache.sync({ force: false });
})();

module.exports = ProxyCache;
