"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

for (const source of [
  "www/app.js",
  "www/score-versions.js",
  "www/version-editor.js",
  "www/appearance.js",
  "tools/song-admin/app.js",
  "tools/song-admin/server.js",
  "worker/src/index.js",
]) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, source)], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${source}: ${result.stderr || result.stdout}`);
}

for (const [catalogPath, assetRoot] of [
  ["www/data/songs-local.json", "www"],
  ["content/songs.json", "content"],
]) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, catalogPath), "utf8"));
  assert.ok(Array.isArray(catalog), `${catalogPath} must be an array`);
  require('../www/score-versions.js').validate(catalog);
  const ids = new Set();

  for (const song of catalog) {
    assert.match(song.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${catalogPath}: invalid id`);
    assert.ok(!ids.has(song.id), `${catalogPath}: duplicate id ${song.id}`);
    ids.add(song.id);
    assert.ok(song.difficulty === undefined || ["beginner","intermediate","advanced"].includes(song.difficulty), `${song.id}: invalid difficulty`);
    assert.ok(song.tuning === undefined || ["normal","big"].includes(song.tuning), `${song.id}: invalid tuning`);
    assert.ok(song.title?.latin?.trim(), `${catalogPath}: missing title for ${song.id}`);

    for (const key of ["simplePages", "notationPages"]) {
      assert.ok(Array.isArray(song[key]), `${catalogPath}: ${song.id} has no ${key} array`);
      for (const page of song[key]) {
        assert.match(page, /^songs\/[a-zA-Z0-9._-]+$/, `${catalogPath}: invalid page path ${page}`);
        assert.ok(fs.existsSync(path.join(root, assetRoot, page)), `${catalogPath}: missing ${page}`);
      }
    }
  }

  process.stdout.write(`${catalogPath}: ${catalog.length} items, all referenced images present\n`);
}

process.stdout.write("JavaScript syntax and catalogs: OK\n");
