"use strict";

module.exports = {
  Generate: require("./_Generate"),
  AuthJwt: require("./_AuthJwt"),
  Alert: require("./_Alert"),
  AllowSource: require("./_Allow_Source"),
  Pagination: require("./_Pagination"),
  Get_Settings: require("./_Get_Settings"),
  Google: {
    Auth: require("./_GoogleAuth"),
  },
  Proxy: {
    Google: require("./_Proxy_Google"),
    Cache: require("./_Proxy_Cache"),
  },
  Get_Video_Data: require("./_Get_Video_data"),
  SCP: require("./_Scp"),
  GetOne: {
    Backup: require("./_Get_Backup"),
    Storage: require("./_Get_Storage"),
  },
  CheckDisk: require("./_Check_Disk"),
  TimeSleep: require("./_TimeSleep"),
  GetIP: require("./_Get_IP"),
  Task: require("./_Task"),
};
