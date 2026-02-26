import { FileNode, PackMetadata } from '../types';

export async function createDefaultPack() {
  const metadata: PackMetadata = {
    pack: {
      pack_format: 15,
      description: {
        text: 'Default Resource Pack',
        color: 'gold',
        bold: true
      }
    }
  };

  const contents = new Map<string, string | Uint8Array>();

  contents.set('pack.mcmeta', JSON.stringify(metadata, null, 2));

  contents.set('pack.png', await createDefaultPackIcon());

  contents.set(
    'assets/minecraft/textures/block/dirt.png',
    await createDefaultTexture(16, '#8B4513')
  );

  contents.set(
    'assets/minecraft/textures/block/stone.png',
    await createDefaultTexture(16, '#7F7F7F')
  );

  contents.set(
    'assets/minecraft/textures/block/grass_block_top.png',
    await createDefaultTexture(16, '#7CBD6B')
  );

  contents.set(
    'README.md',
    '# My Resource Pack\n\nThis is a custom Minecraft resource pack created with the Resource Pack Editor.\n\n## Features\n- Custom textures\n- Easy to modify\n- Particle effects\n- Custom animations\n'
  );

  contents.set(
    'assets/minecraft/particles/example_particle.json',
    JSON.stringify({
      textures: [
        "minecraft:particle/example_0",
        "minecraft:particle/example_1",
        "minecraft:particle/example_2"
      ]
    }, null, 2)
  );

  contents.set(
    'assets/minecraft/models/item/example_armor.json',
    JSON.stringify({
      parent: "minecraft:item/generated",
      textures: {
        layer0: "minecraft:item/diamond_chestplate"
      },
      overrides: [
        {
          predicate: { custom_model_data: 1 },
          model: "minecraft:item/custom_armor"
        }
      ]
    }, null, 2)
  );

  contents.set(
    'assets/minecraft/blockstates/example_block.json',
    JSON.stringify({
      variants: {
        "": { model: "minecraft:block/stone" }
      }
    }, null, 2)
  );

  contents.set(
    'assets/minecraft/sounds.json',
    JSON.stringify({
      "block.note_block.harp": {
        sounds: [
          "minecraft:block/note_block/harp1",
          "minecraft:block/note_block/harp2"
        ],
        subtitle: "subtitles.block.note_block.harp"
      }
    }, null, 2)
  );

  const tree: FileNode = {
    name: 'root',
    type: 'folder',
    children: [
      {
        name: 'pack.mcmeta',
        type: 'file',
        path: 'pack.mcmeta'
      },
      {
        name: 'pack.png',
        type: 'file',
        path: 'pack.png'
      },
      {
        name: 'README.md',
        type: 'file',
        path: 'README.md'
      },
      {
        name: 'assets',
        type: 'folder',
        children: [
          {
            name: 'minecraft',
            type: 'folder',
            children: [
              {
                name: 'textures',
                type: 'folder',
                children: [
                  {
                    name: 'block',
                    type: 'folder',
                    children: [
                      {
                        name: 'dirt.png',
                        type: 'file',
                        path: 'assets/minecraft/textures/block/dirt.png'
                      },
                      {
                        name: 'stone.png',
                        type: 'file',
                        path: 'assets/minecraft/textures/block/stone.png'
                      },
                      {
                        name: 'grass_block_top.png',
                        type: 'file',
                        path: 'assets/minecraft/textures/block/grass_block_top.png'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'particles',
                type: 'folder',
                children: [
                  {
                    name: 'example_particle.json',
                    type: 'file',
                    path: 'assets/minecraft/particles/example_particle.json'
                  }
                ]
              },
              {
                name: 'models',
                type: 'folder',
                children: [
                  {
                    name: 'item',
                    type: 'folder',
                    children: [
                      {
                        name: 'example_armor.json',
                        type: 'file',
                        path: 'assets/minecraft/models/item/example_armor.json'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'blockstates',
                type: 'folder',
                children: [
                  {
                    name: 'example_block.json',
                    type: 'file',
                    path: 'assets/minecraft/blockstates/example_block.json'
                  }
                ]
              },
              {
                name: 'sounds.json',
                type: 'file',
                path: 'assets/minecraft/sounds.json'
              }
            ]
          }
        ]
      }
    ]
  };

  return { tree, contents, metadata };
}

async function createDefaultTexture(size: number, color: string): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < size * size * 0.1; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const brightness = Math.random() * 40 - 20;

    const rgb = hexToRgb(color);
    const r = Math.max(0, Math.min(255, rgb.r + brightness));
    const g = Math.max(0, Math.min(255, rgb.g + brightness));
    const b = Math.max(0, Math.min(255, rgb.b + brightness));

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, y, 1, 1);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(new Uint8Array());
        return;
      }
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer));
      });
    }, 'image/png');
  });
}

async function createDefaultPackIcon(): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  const gradient = ctx.createLinearGradient(0, 0, 128, 128);
  gradient.addColorStop(0, '#4CAF50');
  gradient.addColorStop(1, '#2196F3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RP', 64, 64);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(new Uint8Array());
        return;
      }
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer));
      });
    }, 'image/png');
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
}
