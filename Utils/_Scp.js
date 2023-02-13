"use strict";

const { Client } = require("node-scp");
const fs = require("fs-extra");
const { Files } = require(`../Models`);
const Task = require("./_Task");
exports.Backup = ({ file, save, row, dir, sv_backup, videoInfo }) => {
  return new Promise(function (resolve, reject) {
    let server = {
      host: sv_backup?.sv_ip,
      port: sv_backup?.port,
      username: sv_backup?.username,
      password: sv_backup?.password,
    };

    Client(server)
      .then(async (client) => {
        let uploadTo = save;
        if (dir) {
          const dir_exists = await client
            .exists(dir)
            .then((result) => {
              return result;
              //client.close(); // remember to close connection after you finish
            })
            .catch((error) => {});

          if (!dir_exists) {
            await client
              .mkdir(dir)
              .then((response) => {
                console.log("dir created", dir);
                //client.close(); // remember to close connection after you finish
              })
              .catch((error) => {
                console.log("error", "has dir");
              });
          }

          uploadTo = `${dir}/${save}`;
        }

        await client
          .uploadFile(
            file,
            uploadTo
            // options?: TransferOptions
          )
          .then(async (response) => {
            let backup_data = {
              type: sv_backup?.id,
              quality: "default",
              source: uploadTo,
              fileId: row?.id,
              ...videoInfo,
            };
            await Files.Backups.create(backup_data);
            await Files.Lists.update(
              { s_backup: 1 },
              { where: { id: row?.id } }
            );
            console.log("Transfer Backup", row?.slug);
            client.close(); // remember to close connection after you finish
          })
          .catch((error) => {
            client.close();
            console.log("error", error);
          });
      })
      .catch((e) => console.log(e));
  });
};

exports.Storage = ({ file, save, row, dir, sv_storage, quality }) => {
  return new Promise(function (resolve, reject) {
    let server = {
      host: sv_storage?.sv_ip,
      port: sv_storage?.port,
      username: sv_storage?.username,
      password: sv_storage?.password,
    };

    Client(server)
      .then(async (client) => {
        let uploadTo = save;
        if (dir) {
          const dir_exists = await client
            .exists(dir)
            .then((result) => {
              return result;
              //client.close(); // remember to close connection after you finish
            })
            .catch((error) => {});

          if (!dir_exists) {
            await client
              .mkdir(dir)
              .then((response) => {
                console.log("dir created", dir);
                //client.close(); // remember to close connection after you finish
              })
              .catch((error) => {
                console.log("error", dir);
              });
          }

          uploadTo = `${dir}/${save}`;
        }

        await client
          .uploadFile(
            file,
            uploadTo
            // options?: TransferOptions
          )
          .then(async (response) => {
            let storage_data = {
              storageId: sv_storage?.id,
              quality: quality,
              fileId: row?.id,
            };
            await Files.Videos.create(storage_data);

            await Files.Lists.update(
              { s_video: 1 },
              { where: { id: row?.id } }
            );
            console.log("Transfer Storage", uploadTo);
            resolve({ status: true });
            client.close(); // remember to close connection after you finish
          })
          .catch((error) => {
            resolve({ status: false });
            client.close();
            console.log("error", error);
          });
      })
      .catch((e) => console.log(e));
  });
};
exports.RemoveFileStorage = ({ file, row, sv_storage, quality }) => {
  return new Promise(function (resolve, reject) {
    let server = {
      host: sv_storage?.sv_ip,
      port: sv_storage?.port,
      username: sv_storage?.username,
      password: sv_storage?.password,
    };

    Client(server)
      .then(async (client) => {
        await client
          .unlink(file)
          .then(async () => {
            await Files.Videos.update(
              { active: 0 },
              {
                where: { fileID: row?.id, quality: quality },
              }
            );
            await Files.Lists.update(
              { e_code: 0, s_convert: 1 },
              {
                where: { id: row?.id },
              }
            );
            resolve({ status: true });
            client.close(); // remember to close connection after you finish
          })
          .catch((error) => {});
      })
      .catch((e) => console.log(e));
  });
};
exports.CheckFileStorage = ({ sv_storage, slug }) => {
  return new Promise(function (resolve, reject) {
    let server = {
      host: sv_storage?.sv_ip,
      port: sv_storage?.port,
      username: sv_storage?.username,
      password: sv_storage?.password,
    };
    let path = `/home/files/${slug}`;
    Client(server)
      .then(async (client) => {
        client
          .list(path)
          .then((result) => {
            resolve(result);
            client.close(); // remember to close connection after you finish
          })
          .catch((error) => {});
      })
      .catch((e) => reject(e));
  });
};
exports.DownloadFileStorage = ({ sv_storage, slug, file_name }) => {
  return new Promise(function (resolve, reject) {
    let server = {
      host: sv_storage?.sv_ip,
      port: sv_storage?.port,
      username: sv_storage?.username,
      password: sv_storage?.password,
    };
    let path = `/home/files/${slug}/${file_name}`;
    let save = `${global.dirPublic}/${slug}/download_default`;
    if (!fs.existsSync(`${global.dirPublic}/${slug}`)) {
      fs.mkdirSync(`${global.dirPublic}/${slug}`, { recursive: true });
    }
    Client(server)
      .then(async (client) => {
        client
          .downloadFile(
            path,
            save
            // options?: TransferOptions
          )
          .then(async (response) => {
            await Task({ download: true });
            resolve({ status: true });
            client.close(); // remember to close connection after you finish
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((e) => reject(e));
  });
};
