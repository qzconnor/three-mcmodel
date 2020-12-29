import {
  Scene, PerspectiveCamera, WebGLRenderer,
  CubeGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, Object3D, BoxGeometry, Mesh, BufferGeometry, MeshBasicMaterial,FrontSide, DoubleSide, FaceColors
} from 'three'

import OrbitControls from 'three-orbitcontrols'
import { MinecraftModelLoader, MinecraftTextureLoader } from 'three-mcmodel'


// Create the scene and the camera
const scene = new Scene()
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
camera.position.set(16, 16, 64)

// Create a mesh from the json model and add it to the scene
new MinecraftModelLoader().load(require('./assets/pixelglassesv2.json'), mesh => {
  const textureLoader = new MinecraftTextureLoader()
  mesh.resolveTextures(path => textureLoader.load(require(`./assets/${path}.png`)))
  scene.add(mesh)
})

// Create cube indicator
const wireframe = new LineSegments(
  new EdgesGeometry(new CubeGeometry(16, 16, 16)),
  new LineBasicMaterial({ color: 0x1111cb, linewidth: 3 })
)
//scene.add(wireframe)

// Create the renderer and append it to the document body
const renderer = new WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Create the controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableKeys = false
controls.screenSpacePanning = true

// Update the dimensions of the viewport when the window gets resized
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
addPlayer("ca2e1d88-c87e-4309-bb67-ef0997e544e0")

function addPlayer(uuid, callback) {
  var skinImage = new Image();
  skinImage.crossOrigin = '';
  skinImage.src = 'https://crafatar.com/skins/' + uuid;
  skinImage.onload = function() {
      var modelAPI = getPlayerModel(skinImage, true, uuid);
      scene.add(modelAPI.group);
      //callback(modelAPI, element);
      //elementToModelAPI[element] = modelAPI;
  };
};



// Start animation
function animate () {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()


function getPlayerModel(skinImage, slim, uuid) {
  var player = new Object3D();
  player.scale.set(0.0625, -0.0625, 0.0625);
  player.position.y = 0.5;
  var version = skinImage.height >= 64 ? 1 : 0;
  var skinTexture = makeOpaque(skinImage);
  var skinTextureTransparent = toCanvas(skinImage);
  var hasAlpha = hasAlphaLayer(skinImage);
  var data = {
      hasAlpha: hasAlpha,
      skinTexture: skinTexture,
      skinTextureTransparent: skinTextureTransparent,
      version: version
  };
  var bipedHead = createModelRenderer(-4.0, -8.0, -4.0, 8, 8, 8, "head", data, 0, 1.1);
  player.add(bipedHead);
  var bipedBody = createModelRenderer(-4.0, 0.0, -2.0, 8, 12, 4, "body", data, 0, 1.06);
  player.add(bipedBody);
  var bipedRightArm = createModelRenderer(slim ? -2.0 : -3.0, -2.0, -2.0, slim ? 3 : 4, 12, 4, slim ? "armRightSlim" : "armRight", data, 0, 1.05);
  setRotationPoint(bipedRightArm, -5.0, slim ? 2.5 : 2.0, 0.0);
  player.add(bipedRightArm);
  var bipedLeftArm = createModelRenderer(-1.0, -2.0, -2.0, slim ? 3 : 4, 12, 4, slim ? "armLeftSlim" : "armLeft", data, 0, 1.05);
  setRotationPoint(bipedLeftArm, 5.0, slim ? 2.5 : 2.0, 0.0);
  player.add(bipedLeftArm);
  var bipedRightLeg = createModelRenderer(-2.0, 0.0, -2.0, 4, 12, 4, "legRight", data, 0, 1.05);
  setRotationPoint(bipedRightLeg, -1.9, 12.0, 0.0);
  player.add(bipedRightLeg);
  var bipedLeftLeg = createModelRenderer(-2.0, 0.0, -2.0, 4, 12, 4, "legLeft", data, 0, 1.05);
  setRotationPoint(bipedLeftLeg, 1.9, 12.0, 0.0);
  player.add(bipedLeftLeg);
  var playerGroup = new Object3D();
  playerGroup.add(player);
  var modelAPI = [];
  modelAPI.group = playerGroup;
  modelAPI.part = [];
  modelAPI.part.head = bipedHead;
  modelAPI.part.body = bipedBody;
  modelAPI.part.rightArm = bipedRightArm;
  modelAPI.part.leftArm = bipedLeftArm;
  modelAPI.part.rightLeg = bipedRightLeg;
  modelAPI.part.leftLeg = bipedLeftLeg;
  return modelAPI;
}

function createModelRenderer(x, y, z, width, height, depth, name, data, layer, renderFix) {
  var size = layer == 0 ? 1 : renderFix;
  var boxGeometry = new BoxGeometry(width, height, depth, width, height, depth).scale(size, size, size).translate(x + width / 2, y + height / 2, z + depth / 2);
  var coloredBoxGeometry = putColors(boxGeometry, layer == 0 ? data.skinTexture : data.skinTextureTransparent, textureMappings[data.version][name][layer]);
  if (layer == 0) {
      var secondLayer = createModelRenderer(x, y, z, width, height, depth, name, data, 1, renderFix);
      if (secondLayer)
          coloredBoxGeometry.add(secondLayer);
  }
  return coloredBoxGeometry;
}

function setRotationPoint(mesh, x, y, z) {
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = z;
}


function makeOpaque(image) {
  var canvas = toCanvas(image);
  var ctx = canvas.getContext('2d');
  var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixels = data.data;
  for (var p = 3; p < pixels.length; p += 4) {
      pixels[p] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function toCanvas(image, x, y, w, h) {
  x = (typeof x === 'undefined' ? 0 : x);
  y = (typeof y === 'undefined' ? 0 : y);
  w = (typeof w === 'undefined' ? image.width : w);
  h = (typeof h === 'undefined' ? image.height : h);
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
  return canvas;
}

function hasAlphaLayer(image) {
  var canvas = toCanvas(image);
  var ctx = canvas.getContext('2d');
  var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixels = data.data;
  for (var p = 3; p < pixels.length; p += 4) {
      if (pixels[p] !== 255) {
          return true;
      }
  }
  return false;
}
function putColors(geometry, canvas, rectangles) {
  if (!rectangles) return null;
  var context = canvas.getContext('2d');
  var f = 0;
  var faces = [];
  var materials = [];
  var materialIndexMap = {};
  var side = FrontSide;
  for (var k in rectangles) {
      var rect = rectangles[k];
      var pi = 4 * (rect.flipX ? rect.w - 1 : 0);
      var dp = 4 * (rect.flipX ? -1 : 1);
      var pyi = 4 * (!rect.flipY ? rect.w * (rect.h - 1) : 0);
      var dpy = 4 * (!rect.flipY ? -rect.w : rect.w);
      var pixels = context.getImageData(rect.x, rect.y, rect.w, rect.h).data;
      for (var y = 0, py = pyi + pi; y < rect.h; y++, py += dpy) {
          for (var x = 0, p = py; x < rect.w; x++, p += dp, f += 2) {
              var a = pixels[p + 3];
              if (a === 0) {
                  side = DoubleSide;
                  continue;
              }
              var materialIndex = materialIndexMap[a];
              if (typeof materialIndex === 'undefined') {
                  materials.push(new MeshBasicMaterial({
                      vertexColors: FaceColors,
                      opacity: (a === 255 ? 1 : a / 255),
                      transparent: (a !== 255)
                  }));
                  materialIndex = materials.length - 1;
                  materialIndexMap[a] = materialIndex;
                  if (a !== 255) {
                      side = DoubleSide;
                  }
              }
              var face1 = geometry.faces[f];
              var face2 = geometry.faces[f + 1];
              face1.color.r = pixels[p] / 255;
              face1.color.g = pixels[p + 1] / 255;
              face1.color.b = pixels[p + 2] / 255;
              face2.color = face1.color;
              face1.materialIndex = materialIndex;
              face2.materialIndex = materialIndex;
              faces.push(face1);
              faces.push(face2);
          }
      }
  }
  if (faces.length === 0) {
      return null;
  }
  geometry.faces = faces;
  materials.forEach(function(m) {
      m.side = side;
  });
  return new Mesh(new BufferGeometry().fromGeometry(geometry), materials);
}
var textureMappings = [{
  head: [{
      left: {
          x: 16,
          y: 8,
          w: 8,
          h: 8
      },
      right: {
          x: 0,
          y: 8,
          w: 8,
          h: 8
      },
      bottom: {
          x: 16,
          y: 0,
          w: 8,
          h: 8,
          flipY: !0
      },
      top: {
          x: 8,
          y: 0,
          w: 8,
          h: 8
      },
      front: {
          x: 8,
          y: 8,
          w: 8,
          h: 8
      },
      back: {
          x: 24,
          y: 8,
          w: 8,
          h: 8
      }
  }, {
      left: {
          x: 48,
          y: 8,
          w: 8,
          h: 8
      },
      right: {
          x: 32,
          y: 8,
          w: 8,
          h: 8
      },
      bottom: {
          x: 48,
          y: 0,
          w: 8,
          h: 8,
          flipY: !0
      },
      top: {
          x: 40,
          y: 0,
          w: 8,
          h: 8
      },
      front: {
          x: 40,
          y: 8,
          w: 8,
          h: 8
      },
      back: {
          x: 56,
          y: 8,
          w: 8,
          h: 8
      }
  }],
  body: [{
      left: {
          x: 28,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 16,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 28,
          y: 16,
          w: 8,
          h: 4,
          flipY: !0
      },
      top: {
          x: 20,
          y: 16,
          w: 8,
          h: 4
      },
      front: {
          x: 20,
          y: 20,
          w: 8,
          h: 12
      },
      back: {
          x: 32,
          y: 20,
          w: 8,
          h: 12
      }
  }],
  armRight: [{
      left: {
          x: 48,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 48,
          y: 16,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 4,
          h: 4
      },
      front: {
          x: 44,
          y: 20,
          w: 4,
          h: 12
      },
      back: {
          x: 52,
          y: 20,
          w: 4,
          h: 12
      }
  }],
  armRightSlim: [{
      left: {
          x: 47,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 47,
          y: 16,
          w: 3,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 3,
          h: 4
      },
      front: {
          x: 44,
          y: 20,
          w: 3,
          h: 12
      },
      back: {
          x: 51,
          y: 20,
          w: 3,
          h: 12
      }
  }],
  armLeft: [{
      left: {
          x: 40,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      right: {
          x: 48,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      bottom: {
          x: 48,
          y: 16,
          w: 4,
          h: 4,
          flipX: !0,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 4,
          h: 4,
          flipX: !0
      },
      front: {
          x: 44,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      back: {
          x: 52,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      }
  }],
  armLeftSlim: [{
      left: {
          x: 40,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      right: {
          x: 47,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      bottom: {
          x: 47,
          y: 16,
          w: 3,
          h: 4,
          flipX: !0,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 3,
          h: 4,
          flipX: !0
      },
      front: {
          x: 44,
          y: 20,
          w: 3,
          h: 12,
          flipX: !0
      },
      back: {
          x: 51,
          y: 20,
          w: 3,
          h: 12,
          flipX: !0
      }
  }],
  legRight: [{
      left: {
          x: 8,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 0,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 8,
          y: 16,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 4,
          y: 16,
          w: 4,
          h: 4
      },
      front: {
          x: 4,
          y: 20,
          w: 4,
          h: 12
      },
      back: {
          x: 12,
          y: 20,
          w: 4,
          h: 12
      }
  }],
  legLeft: [{
      left: {
          x: 0,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      right: {
          x: 8,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      bottom: {
          x: 8,
          y: 16,
          w: 4,
          h: 4,
          flipX: !0,
          flipY: !0
      },
      top: {
          x: 4,
          y: 16,
          w: 4,
          h: 4,
          flipX: !0
      },
      front: {
          x: 4,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      },
      back: {
          x: 12,
          y: 20,
          w: 4,
          h: 12,
          flipX: !0
      }
  }]
}, {
  head: [{
      left: {
          x: 16,
          y: 8,
          w: 8,
          h: 8
      },
      right: {
          x: 0,
          y: 8,
          w: 8,
          h: 8
      },
      bottom: {
          x: 16,
          y: 0,
          w: 8,
          h: 8,
          flipY: !0
      },
      top: {
          x: 8,
          y: 0,
          w: 8,
          h: 8
      },
      front: {
          x: 8,
          y: 8,
          w: 8,
          h: 8
      },
      back: {
          x: 24,
          y: 8,
          w: 8,
          h: 8
      }
  }, {
      left: {
          x: 48,
          y: 8,
          w: 8,
          h: 8
      },
      right: {
          x: 32,
          y: 8,
          w: 8,
          h: 8
      },
      bottom: {
          x: 48,
          y: 0,
          w: 8,
          h: 8,
          flipY: !0
      },
      top: {
          x: 40,
          y: 0,
          w: 8,
          h: 8
      },
      front: {
          x: 40,
          y: 8,
          w: 8,
          h: 8
      },
      back: {
          x: 56,
          y: 8,
          w: 8,
          h: 8
      }
  }],
  body: [{
      left: {
          x: 28,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 16,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 28,
          y: 16,
          w: 8,
          h: 4,
          flipY: !0
      },
      top: {
          x: 20,
          y: 16,
          w: 8,
          h: 4
      },
      front: {
          x: 20,
          y: 20,
          w: 8,
          h: 12
      },
      back: {
          x: 32,
          y: 20,
          w: 8,
          h: 12
      }
  }, {
      left: {
          x: 28,
          y: 36,
          w: 4,
          h: 12
      },
      right: {
          x: 16,
          y: 36,
          w: 4,
          h: 12
      },
      bottom: {
          x: 28,
          y: 32,
          w: 8,
          h: 4,
          flipY: !0
      },
      top: {
          x: 20,
          y: 32,
          w: 8,
          h: 4
      },
      front: {
          x: 20,
          y: 36,
          w: 8,
          h: 12
      },
      back: {
          x: 32,
          y: 36,
          w: 8,
          h: 12
      }
  }],
  armRight: [{
      left: {
          x: 48,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 48,
          y: 16,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 4,
          h: 4
      },
      front: {
          x: 44,
          y: 20,
          w: 4,
          h: 12
      },
      back: {
          x: 52,
          y: 20,
          w: 4,
          h: 12
      }
  }, {
      left: {
          x: 48,
          y: 36,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 36,
          w: 4,
          h: 12
      },
      bottom: {
          x: 48,
          y: 32,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 32,
          w: 4,
          h: 4
      },
      front: {
          x: 44,
          y: 36,
          w: 4,
          h: 12
      },
      back: {
          x: 52,
          y: 36,
          w: 4,
          h: 12
      }
  }],
  armRightSlim: [{
      left: {
          x: 47,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 47,
          y: 16,
          w: 3,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 16,
          w: 3,
          h: 4
      },
      front: {
          x: 44,
          y: 20,
          w: 3,
          h: 12
      },
      back: {
          x: 51,
          y: 20,
          w: 3,
          h: 12
      }
  }, {
      left: {
          x: 47,
          y: 36,
          w: 4,
          h: 12
      },
      right: {
          x: 40,
          y: 36,
          w: 4,
          h: 12
      },
      bottom: {
          x: 47,
          y: 32,
          w: 3,
          h: 4,
          flipY: !0
      },
      top: {
          x: 44,
          y: 32,
          w: 3,
          h: 4
      },
      front: {
          x: 44,
          y: 36,
          w: 3,
          h: 12
      },
      back: {
          x: 51,
          y: 36,
          w: 3,
          h: 12
      }
  }],
  armLeft: [{
      left: {
          x: 40,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 32,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 40,
          y: 48,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 36,
          y: 48,
          w: 4,
          h: 4
      },
      front: {
          x: 36,
          y: 52,
          w: 4,
          h: 12
      },
      back: {
          x: 44,
          y: 52,
          w: 4,
          h: 12
      }
  }, {
      left: {
          x: 56,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 48,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 56,
          y: 48,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 52,
          y: 48,
          w: 4,
          h: 4
      },
      front: {
          x: 52,
          y: 52,
          w: 4,
          h: 12
      },
      back: {
          x: 60,
          y: 52,
          w: 4,
          h: 12
      }
  }],
  armLeftSlim: [{
      left: {
          x: 39,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 32,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 39,
          y: 48,
          w: 3,
          h: 4,
          flipY: !0
      },
      top: {
          x: 36,
          y: 48,
          w: 3,
          h: 4
      },
      front: {
          x: 36,
          y: 52,
          w: 3,
          h: 12
      },
      back: {
          x: 43,
          y: 52,
          w: 3,
          h: 12
      }
  }, {
      left: {
          x: 55,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 48,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 55,
          y: 48,
          w: 3,
          h: 4,
          flipY: !0
      },
      top: {
          x: 52,
          y: 48,
          w: 3,
          h: 4
      },
      front: {
          x: 52,
          y: 52,
          w: 3,
          h: 12
      },
      back: {
          x: 59,
          y: 52,
          w: 3,
          h: 12
      }
  }],
  legRight: [{
      left: {
          x: 8,
          y: 20,
          w: 4,
          h: 12
      },
      right: {
          x: 0,
          y: 20,
          w: 4,
          h: 12
      },
      bottom: {
          x: 8,
          y: 16,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 4,
          y: 16,
          w: 4,
          h: 4
      },
      front: {
          x: 4,
          y: 20,
          w: 4,
          h: 12
      },
      back: {
          x: 12,
          y: 20,
          w: 4,
          h: 12
      }
  }, {
      left: {
          x: 8,
          y: 36,
          w: 4,
          h: 12
      },
      right: {
          x: 0,
          y: 36,
          w: 4,
          h: 12
      },
      bottom: {
          x: 8,
          y: 32,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 4,
          y: 32,
          w: 4,
          h: 4
      },
      front: {
          x: 4,
          y: 36,
          w: 4,
          h: 12
      },
      back: {
          x: 12,
          y: 36,
          w: 4,
          h: 12
      }
  }],
  legLeft: [{
      left: {
          x: 24,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 16,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 24,
          y: 48,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 20,
          y: 48,
          w: 4,
          h: 4
      },
      front: {
          x: 20,
          y: 52,
          w: 4,
          h: 12
      },
      back: {
          x: 28,
          y: 52,
          w: 4,
          h: 12
      }
  }, {
      left: {
          x: 8,
          y: 52,
          w: 4,
          h: 12
      },
      right: {
          x: 0,
          y: 52,
          w: 4,
          h: 12
      },
      bottom: {
          x: 8,
          y: 48,
          w: 4,
          h: 4,
          flipY: !0
      },
      top: {
          x: 4,
          y: 48,
          w: 4,
          h: 4
      },
      front: {
          x: 4,
          y: 52,
          w: 4,
          h: 12
      },
      back: {
          x: 12,
          y: 52,
          w: 4,
          h: 12
      }
  }]
}];
