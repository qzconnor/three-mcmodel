function getPlayerModel(skinImage, slim, uuid) {
    var player = new THREE.Object3D();
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
    var playerGroup = new THREE.Object3D();
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
    var boxGeometry = new THREE.BoxGeometry(width, height, depth, width, height, depth).scale(size, size, size).translate(x + width / 2, y + height / 2, z + depth / 2);
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