import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Получаем путь к текущему файлу на основе import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к package.json относительно расположения update-version.js
const packagePath = path.join(__dirname, "../../../package.json");

// Путь к package.json относительно расположения update-version.js
const tauriConfigPath = path.join(
  __dirname,
  "../../../src-tauri/tauri.conf.json"
);

// Функция для обновления версии в package.json
function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), "utf8");
}

// Функция для обновления версии в tauri.conf.json
function updateTauriConfigVersion(newVersion) {
  const tauriConfigJson = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
  tauriConfigJson.package.version = newVersion;
  fs.writeFileSync(
    tauriConfigPath,
    JSON.stringify(tauriConfigJson, null, 2),
    "utf8"
  );
}

// Получаем новую версию из аргументов командной строки
const newVersion = process.argv[2];

// Проверка формата версии
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!newVersion || !versionRegex.test(newVersion)) {
  console.error("Пожалуйста, введите версию в формате x.x.x");
  process.exit(1);
}

if (!newVersion) {
  console.error("Пожалуйста ввидите корректную версию!");
  process.exit(1);
}

// Обновляем версию в обоих файлах
updatePackageVersion(newVersion);
updateTauriConfigVersion(newVersion);

console.log(`Версия обновлена до v${newVersion}`);
