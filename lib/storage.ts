import { mkdir, writeFile } from "fs/promises";
import path from "path";

const uploadRoot = path.join(process.cwd(), "uploads");

export async function saveUploadedFile(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const targetDir = path.join(uploadRoot, folder);
  await mkdir(targetDir, { recursive: true });

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${sanitizedName}`;
  const filePath = path.join(targetDir, fileName);

  await writeFile(filePath, buffer);

  return {
    fileName,
    filePath,
    relativePath: path.relative(process.cwd(), filePath)
  };
}
