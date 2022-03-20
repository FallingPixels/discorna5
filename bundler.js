const fs = require('fs');
const UglifyJS = require("uglify-js");
const postcss = require('postcss');
require('dotenv').config();
const assets = [];
const betterDiscordPluginDirectory = process.env.BETTER_DISCORD_DIR;
const productionBuild = process.env.BUILD_MODE === 'release';

if (!betterDiscordPluginDirectory) throw new Error("BetterDiscord directory not set");

const header = createHeader(metaData);
const modules = fs.readdirSync("./src");

modules.forEach(fileName => {
  const fullPath = `./src/${fileName}`;
  let content = fs.readFileSync(fullPath, {encoding: 'utf8'});
  const moduleName = fileName.substring(0, fileName.indexOf('.'));

  if (fileName === 'meta.json') {
    return;
  }

  if(fileName.endsWith('.js')) {
    content = transpileJS(content, './dist');
  }
  if (fileName.endsWith('.css')) {
    content = transpileCSS(content);
  }

  if (fileName.endsWith('.plugin.js')) {
    const meta = fs.readFileSync(`${moduleName}.meta.json`, { encoding: "utf8" });
    let metaData;
    try {
      metaData = JSON.parse(meta);
    } catch (error) {
      throw new Error(`Error while parsing meta.json for ${moduleName}`);
      console.error(error);
    }
    content = createHeader(metaData) + content;
    fs.writeFileSync(`${betterDiscordPluginDirectory}/${fileName}`, content);
    fs.writeFileSync(`./dist/${fileName}`, content);
    return;
  }

  writeContents(content, moduleName, fileName);

});

function writeContents(content, moduleName, fileName) {
  if(!fs.existsSync(`${betterDiscordPluginDirectory}/${moduleName}`)) {
    fs.mkdirSync(`${betterDiscordPluginDirectory}/${moduleName}`);
  }
  if (!fs.existsSync(`./dist/${moduleName}`)) {
    fs.mkdirSync(`./dist/${moduleName}`);
  }
  fileName = fileName.replace(`${moduleName}.`, '');
  console.log(fileName);
  fs.writeFileSync(`${betterDiscordPluginDirectory}/${moduleName}/${fileName}`, content);
  fs.writeFileSync(`./dist/${moduleName}/${fileName}`, content);
}

function transpileCSS(content) {
  if (!productionBuild) {
    return content;
  }
  return postcss([require('autoprefixer')]).process(content).css;
}

function transpileJS(content, outDir) {
  content = content.replace(/\/\/ @ts-check/g, '').trim();
  if(productionBuild) {
    content = minifyJS(content);
  }
  return content;
}

function createHeader(metaData) {
  const head = `/**`;
  const tail = `*/`;
  let output = `${head}\n`;
  const keys = Object.keys(metaData);
  keys.forEach(key => {
    if(typeof metaData[key] !== "string") {
      throw new Error(`Error while parsing meta.json: ${key} is not a string`);
    }
    output += ` * @${key} ${metaData[key]}\n`;
  });
  output += `${tail}\n`;
  return output;
}

function minifyJS(content) {
  let result;
  try {
    result = UglifyJS.minify(content)
  } catch(error) {
    console.error(error);
    return content;
  }
  return result.code;
}
