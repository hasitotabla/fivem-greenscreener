import { $ } from "bun";
import fs from "fs";
import path, { parse } from "path";
import axios from "axios";
import { load as htmlparse } from "cheerio";
import ora, { type Ora } from "ora";

import { CACHE_FOLDER, SERVER_FOLDER } from "./Consts";
import { downloadFile } from "./helpers/Files";
import { useArguments } from "./helpers/Arguments";

type ServerBranches = "master" | "recommended" | "latest";

const VALID_BRANCHES: ServerBranches[] = ["master", "recommended", "latest"];
const usedPlatform = process.platform == "win32" ? "build_server_windows" : "build_proot_linux";
const cmdParser = useArguments();

const usedBranch = cmdParser.get<ServerBranches>("--branch", "latest", ["-b"]);
if (!usedBranch || !VALID_BRANCHES.includes(usedBranch)) {
  console.error("Invalid branch specified");
  process.exit(1);
}

async function getRelease(platform: string, branch: ServerBranches): Promise<{ downloadUrl: string; version: number } | null> {
  let htmlData = "";

  try {
    const { data } = await axios.get(`https://runtime.fivem.net/artifacts/fivem/${platform}/master/`);
    if (!data) {
      throw new Error("No data returned from the server");
    }

    htmlData = data;
  } catch (error) {
    console.error(error);
    return null;
  }

  const $ = htmlparse(htmlData);
  let partialUrl = "";
  let version = -1;

  switch (branch) {
    case "master": {
      const button = $(".panel-block.is-active");
      if (!button) {
        console.error("No active button found");
        return null;
      }

      const foundVersion = button.text().match(/([0-9]{5,6})/g)?.[0];
      if (foundVersion) version = parseInt(foundVersion);

      const url = button.attr("href");
      if (!url) {
        console.error("No href attribute found");
        return null;
      }

      partialUrl = url.replace("./", "");

      break;
    }

    case "latest": {
      const anchor = $("a.panel-block.is-active");
      if (!anchor) {
        console.error("No active anchor found");
        return null;
      }

      const foundVersion = anchor.text().match(/([0-9]{5,6})/g)?.[0];
      if (foundVersion) version = parseInt(foundVersion);

      const url = anchor.attr("href");
      if (!url) {
        console.error("No href attribute found");
        return null;
      }

      partialUrl = url.replace("./", "");
      break;
    }

    case "recommended":
    default: {
      const button = $(".panel-block a");
      if (!button) {
        console.error("No active button found");
        return null;
      }

      const foundVersion = button.text().match(/([0-9]{5,6})/g)?.[0];
      if (foundVersion) version = parseInt(foundVersion);

      const url = button.attr("href");
      if (!url) {
        console.error("No href attribute found");
        return null;
      }

      partialUrl = url.replace("./", "");
      break;
    }
  }

  return {
    downloadUrl: `https://runtime.fivem.net/artifacts/fivem/${platform}/master/${partialUrl}`,
    version,
  };
}

async function extractServer(filePath: string, outputFolder: string): Promise<boolean> {
  switch (process.platform) {
    case "win32": {
      const result = await $`./scripts/vendor/7z/7za.exe x ${filePath} -o${outputFolder} -y > nul`;
      fs.rmSync(filePath);

      return true;
    }

    case "linux":
      await $`tar -xf ${filePath} -C ${outputFolder}`;
      fs.rmSync(`${outputFolder}/fx.tar`);

      return true;

    default:
      return false;
  }
}

export async function updateServer(branch: ServerBranches, spinnerHandle: Ora | null = null): Promise<boolean> {
  if (spinnerHandle) {
    spinnerHandle.text = "Checking for updates...";
    spinnerHandle.color = "green";
  }

  const release = await getRelease(usedPlatform, branch);
  if (!release) {
    if (spinnerHandle) spinnerHandle.fail(`Failed to get ${usedBranch}'s release URL`);

    return false;
  }

  if (!fs.existsSync(CACHE_FOLDER)) {
    fs.mkdirSync(CACHE_FOLDER, { recursive: true });
  }

  const fileName = process.platform === "win32" ? "server.7z" : "fx.tar";
  const filePath = path.join(CACHE_FOLDER, fileName);

  await downloadFile(release.downloadUrl, filePath);

  if (!fs.existsSync(filePath)) {
    if (spinnerHandle) spinnerHandle.fail(`Failed to download the ${usedBranch} release`);
    return false;
  }

  if (!fs.existsSync(SERVER_FOLDER)) {
    fs.mkdirSync(SERVER_FOLDER, { recursive: true });
  }

  if (spinnerHandle) spinnerHandle.text = `Extracting ${usedBranch} release...`;

  const success = await extractServer(filePath, SERVER_FOLDER);
  if (!success) {
    if (spinnerHandle) spinnerHandle.fail(`Failed to extract ${usedBranch} release`);
    return false;
  }

  fs.rmSync(filePath, { force: true });
  if (spinnerHandle) spinnerHandle.succeed(`Server updated to version ${release.version} successfully!`);

  return true;
}

if (import.meta && import.meta.main) {
  const spinner = ora("Updating server...").start();

  await updateServer(usedBranch, spinner);
}
