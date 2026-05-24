import sharp from "sharp";
import { writeFileSync } from "fs";

// マップピン＋フォーク アイコン SVG
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background: rounded square, dark -->
  <rect width="512" height="512" rx="96" fill="#37352F"/>

  <!-- Map pin body -->
  <path d="M256 88
    C188 88 134 142 134 210
    C134 264 164 310 208 342
    L256 424
    L304 342
    C348 310 378 264 378 210
    C378 142 324 88 256 88Z"
    fill="#C8952A"/>

  <!-- Fork (white, inside pin head) -->
  <!-- Left tine -->
  <line x1="228" y1="152" x2="228" y2="206" stroke="white" stroke-width="18" stroke-linecap="round"/>
  <!-- Center tine -->
  <line x1="256" y1="152" x2="256" y2="206" stroke="white" stroke-width="18" stroke-linecap="round"/>
  <!-- Right tine -->
  <line x1="284" y1="152" x2="284" y2="206" stroke="white" stroke-width="18" stroke-linecap="round"/>
  <!-- Tine base arc -->
  <path d="M228 206 Q228 228 256 228 Q284 228 284 206"
    fill="none" stroke="white" stroke-width="18" stroke-linecap="round"/>
  <!-- Handle -->
  <line x1="256" y1="228" x2="256" y2="286" stroke="white" stroke-width="18" stroke-linecap="round"/>
</svg>
`;

const svgBuffer = Buffer.from(svg);

// 512x512
await sharp(svgBuffer).resize(512, 512).png().toFile("public/icon-512.png");
console.log("✓ icon-512.png");

// 192x192
await sharp(svgBuffer).resize(192, 192).png().toFile("public/icon-192.png");
console.log("✓ icon-192.png");

// 180x180 (Apple Touch Icon)
await sharp(svgBuffer).resize(180, 180).png().toFile("public/apple-touch-icon.png");
console.log("✓ apple-touch-icon.png");

console.log("Done!");
