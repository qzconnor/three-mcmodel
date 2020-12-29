var supportWebGL = !!this.WebGLRenderingContext && (!!this.document.createElement('canvas').getContext('experimental-webgl') || !!this.document.createElement('canvas').getContext('webgl'));
var scenes = [];
var rotation = -Math.PI / 3;
var elementToModelAPI = [];
loadCanvas = function(element, canvasCallback) {
    var scene = new THREE.Scene();
    scene.userData.element = element[0];
    var camera = new THREE.PerspectiveCamera(50, element.width() / element.height(), 1, 1000);
    scene.userData.camera = camera;
    camera.position.x = -Math.cos(rotation);
    camera.position.z = -Math.sin(rotation);
    camera.position.setLength(3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    var controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element);
    controls.enablePan = false;
    controls.enableZoom = false;
    scene.userData.controls = controls;
    var addPlayer = function(uuid, callback) {
        var skinImage = new Image();
        skinImage.crossOrigin = '';
        skinImage.src = 'https://crafatar.com/skins/' + uuid;
        skinImage.onload = function() {
            var modelAPI = getPlayerModel(skinImage, true, uuid);
            scene.add(modelAPI.group);
            callback(modelAPI, element);
            elementToModelAPI[element] = modelAPI;
        };
    };
    element.data('addPlayer', addPlayer);
    var uuid = element.data('uuid');
    if (typeof uuid !== 'undefined') {
        addPlayer(uuid, function(modelAPI, element) {
            if (typeof canvasCallback === 'function') {
                canvasCallback(modelAPI);
            }
            var emote = element.attr('emote');
            if (emote != undefined) {
                element.mouseover(function() {
                    playLocalEmote(emote, modelAPI);
                });
                element.mouseleave(function() {
                    stopEmote();
                });
                element.on('touchstart', function() {
                    playLocalEmote(emote, modelAPI);
                });
                element.on('touchend', function() {
                    stopEmote();
                });
            }
            var dataEmote = element.attr('emote-data');
            if (window.dataEmote !== undefined) {
                dataEmote = window.dataEmote;
            }
            if (dataEmote !== undefined && dataEmote !== '') {
                if (element.attr('autoplay')) {
                    playUploadedEmote(dataEmote, modelAPI);
                } else {
                    element.mouseover(function() {
                        playRawEmote(dataEmote, modelAPI);
                    });
                    element.mouseleave(function() {
                        stopEmote();
                    });
                    element.on('touchstart', function() {
                        playRawEmote(dataEmote, modelAPI);
                    });
                    element.on('touchend', function() {
                        stopEmote();
                    });
                }
            }
        });
    }
    scenes.push(scene);
};
$('.emotecanvas').each(function() {
    var element = $(this);
    loadCanvas(element);
});
var canvasOverlay = document.getElementById('renderoverlay');
var renderer = null;
if (supportWebGL)
    renderer = new THREE.WebGLRenderer({
        canvas: canvasOverlay,
        antialias: true,
        alpha: true
    });
else
    renderer = new THREE.CanvasRenderer({
        canvas: canvasOverlay,
        antialias: true,
        alpha: true
    });
renderer.setScissorTest(true);
renderer.setClearColor(0xffffff, 0);
renderer.setPixelRatio(window.devicePixelRatio);
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
        window.setTimeout(callback, 1000 / fps);
    };
})();
var renderActive = false;

function render() {
    if (renderActive = document.hasFocus()) {
        requestAnimFrame(render);
    }
    updateSize();
    onTick();
    canvasOverlay.style.transform = 'translateY(' + window.scrollY + 'px)';
    scenes.forEach(function(scene) {
        var element = scene.userData.element;
        if (element !== undefined) {
            var rect = element.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight || rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
                return;
            }
            var width = rect.right - rect.left;
            var height = rect.bottom - rect.top;
            var left = rect.left;
            var top = rect.top;
            renderer.setViewport(left, top, width, height);
            renderer.setScissor(left, top, width, height);
            var camera = scene.userData.camera;
            renderer.render(scene, camera);
        }
    });
}

function updateSize() {
    var width = canvasOverlay.clientWidth;
    var height = canvasOverlay.clientHeight;
    if (canvasOverlay.width !== width || canvasOverlay.height !== height) {
        renderer.setSize(width, height, false);
    }
}
render();
window.addEventListener('focus', function(event) {
    if (!renderActive) {
        render();
    }
});