"use strict";

const Users = require("./Users");
const Files = require("./Files");
const Storage = require("./Storage");
const Servers = require("./Servers");
const Player = require("./Player");
//Users
Users.Lists.hasMany(Users.Sets, { as: "sets" });
Users.Sets.belongsTo(Users.Lists);

//Files
Files.Lists.hasMany(Files.Videos, { as: "videos" });
Files.Videos.belongsTo(Files.Lists);
Files.Lists.hasMany(Files.Backups, { as: "backups" });
Files.Backups.belongsTo(Files.Lists);
Files.Lists.hasMany(Files.Subtitles, { as: "subtitles" });
Files.Subtitles.belongsTo(Files.Lists);
Files.Lists.hasMany(Files.Sets, { as: "sets" });
Files.Sets.belongsTo(Files.Lists);
//Files.Lists.hasMany(Files.Tool, { as: 'Subtitle' });

//Storage
Storage.Lists.hasMany(Storage.Sets, { as: "sets" });
Storage.Sets.belongsTo(Storage.Lists);

//Servers
Servers.Lists.hasMany(Servers.Sets, { as: "sets" });
Servers.Sets.belongsTo(Servers.Lists);

//Player
Player.Lists.hasMany(Player.Sets, { as: "sets" });
Player.Sets.belongsTo(Player.Lists);

module.exports = {
  Users,
  UserToken: require("./Users.token"),
  Files,
  Storage,
  Servers,
  Player,
  ProxyCache: require("./ProxyCache"),
  Settings: require("./Settings"),
  GAuth: require("./GAuth"),
  GroupDomain: require("./Group.domain"),
  Procress: require("./Procress"),
};
