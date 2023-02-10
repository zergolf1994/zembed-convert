"use strict";

const { Client } = require("node-scp");
const fs = require("fs-extra");
const { Files } = require(`../Models`);

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

exports.Storage = ({ file, save, row, dir, sv_storage }) => {
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
              quality: "default",
              fileId: row?.id,
            };
            await Files.Videos.create(storage_data);

            await Files.Lists.update(
              { s_video: 1 },
              { where: { id: row?.id } }
            );
            console.log("Transfer Storage", uploadTo);
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
