import fs from "fs";
import path from "path";
import axios from "axios";

export async function downloadFile(downloadUrl: string, outputPath: string) {
  if (!downloadUrl) throw new Error("No URL provided");
  if (!outputPath) throw new Error("No output path provided");

  const targetPath = path.resolve(outputPath.split("/").slice(0, -1).join("/"));
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  const writer = fs.createWriteStream(outputPath);

  try {
    const response = await axios({
      method: "get",
      url: downloadUrl,
      responseType: "stream",
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(true));
      writer.on("error", (err) => reject(err));
    });

    return true;
  } catch (error) {
    return false;
  }
}
