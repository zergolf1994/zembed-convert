"use strict";
const { Files } = require(`../Models`);

exports.Token = (
  length = 10,
  characters = "abcdefghijklmnopqrstuvwxyz0123456789"
) => {
  let result = "";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.FileSlug = async () => {
  let slug = this.Token();
  let count = await Files.Lists.count({
    raw: true,
    where: { slug },
  });

  if (count) {
    slug = this.Token(12);
  }

  return slug;
};
