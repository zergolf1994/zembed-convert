const { DataTypes } = require("sequelize");
const sequelize = require("./conn");

//quality 99 = original file , 18 = 360 , 22 = 720 , 37 = 1080

const Lists = sequelize.define(
  "files",
  {
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
    type: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
    e_code: {
      type: DataTypes.INTEGER(3),
      defaultValue: 0,
    },
    title: {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    views: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    size: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    s_backup: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    },
    s_video: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    },
    s_convert: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
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
        fields: ["type"],
      },
      {
        unique: false,
        fields: ["slug"],
      },
    ],
  }
);
const Videos = sequelize.define(
  "files_video",
  {
    active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
    },
    quality: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    storageId: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["quality"],
      },
      {
        unique: false,
        fields: ["storageId"],
      },
      {
        unique: false,
        fields: ["fileId"],
      },
    ],
  }
);
const Backups = sequelize.define(
  "files_backup",
  {
    type: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
    quality: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    source: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    mimeSize: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    fileSize: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["quality"],
      },
      {
        unique: false,
        fields: ["fileId"],
      },
    ],
  }
);
const Subtitles = sequelize.define(
  "files_subtitle",
  {
    active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
    },
    lang: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      allowNull: false,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ["lang"],
      },
      {
        unique: false,
        fields: ["fileId"],
      },
    ],
  }
);
const Sets = sequelize.define(
  "files_set",
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
        fields: ["fileId"],
      },
    ],
  }
);
(async () => {
  await Lists.sync({ force: false });
  await Videos.sync({ force: false });
  await Backups.sync({ force: false });
  await Subtitles.sync({ force: false });
  await Sets.sync({ force: false });
})();

module.exports = { Lists, Videos, Backups, Subtitles, Sets };
