var startTime = -1;
var keyframes = [];
var model = null;
var timeout = 0;
var playing = false;
var finished = false;
var lastProcessedResult = [];
var playLocalEmote = function(name, modelAPI) {
    loadEmote(name + ".json", function(data) {
        model = modelAPI;
        keyframes = data.keyframes;
        startTime = Date.now();
        timeout = data.timeout;
        finished = false;
    });
};
var playUploadedEmote = function(data, modelAPI) {
    model = modelAPI;
    keyframes = data.keyframes;
    startTime = Date.now();
    timeout = data.timeout;
    finished = false;
};
var playRawEmote = function(data, modelAPI) {
    data = JSON.parse(data);
    model = modelAPI;
    keyframes = data.keyframes;
    startTime = Date.now();
    timeout = data.timeout;
    finished = false;
};
var stopEmote = function() {
    keyframes = [];
};
var addTimeoutKeyFrame = function() {
    if (keyframes.length == 0)
        return;
    var lastOffset = keyframes[keyframes.length - 1].offset
    var currentPose = [];
    var idlePose = [];
    for (var i = 0; i < 7; i++) {
        currentPose.push({
            bodyPart: i,
            x: lastProcessedResult[i].x,
            y: lastProcessedResult[i].y,
            z: lastProcessedResult[i].z,
        });
        idlePose.push({
            bodyPart: i,
            x: 0,
            y: 0,
            z: 0
        });
    }
    keyframes.push({
        offset: lastOffset,
        emotePoses: currentPose
    });
    var offset = lastOffset + timeout;
    keyframes.push({
        offset: offset,
        emotePoses: idlePose
    });
}
var tau = Math.PI * 2;
var onTick = function() {
    if (model == null)
        return;
    var playing = false;
    var currentTime = Date.now() - startTime;
    for (var i = 0; i < 7; i++) {
        var processedPose = processKeyFrame(currentTime, i);
        var x = tau / 360 * -processedPose.x;
        var y = tau / 360 * -processedPose.y;
        var z = tau / 360 * processedPose.z;
        lastProcessedResult[i] = processedPose;
        if (processedPose.processed) {
            playing = true;
        }
        switch (i) {
            case 0:
                model.part.head.rotation.order = 'ZYX';
                model.part.head.rotation.y = x / 2;
                model.part.head.rotation.x = y / 2;
                break;
            case 1:
                model.part.rightArm.rotation.order = 'ZYX';
                model.part.rightArm.rotation.x = x;
                model.part.rightArm.rotation.y = y;
                model.part.rightArm.rotation.z = z;
                break;
            case 2:
                model.part.leftArm.rotation.order = 'ZYX';
                model.part.leftArm.rotation.x = x;
                model.part.leftArm.rotation.y = y;
                model.part.leftArm.rotation.z = z;
                break;
            case 3:
                model.part.leftLeg.rotation.order = 'ZYX';
                model.part.leftLeg.rotation.x = x;
                model.part.leftLeg.rotation.y = y;
                model.part.leftLeg.rotation.z = z;
                break;
            case 4:
                model.part.rightLeg.rotation.order = 'ZYX';
                model.part.rightLeg.rotation.x = x;
                model.part.rightLeg.rotation.y = y;
                model.part.rightLeg.rotation.z = z;
                break;
            case 5:
                model.group.rotation.order = 'ZYX';
                model.group.rotation.x = -x;
                model.group.rotation.y = y;
                model.group.rotation.z = -z;
                break;
        }
    }
    if (!playing && !finished) {
        finished = true;
        addTimeoutKeyFrame();
    }
};
var process = function(root, target, progress, animationDuration) {
    if (root == target || animationDuration == 0 || progress > animationDuration)
        return target;
    var difference = root - target;
    return root - (difference / animationDuration) * progress;
}
var processKeyFrame = function(currentTime, bodyPartId) {
    var emotePoseStart = {
        bodyPart: 0,
        x: 0,
        y: 0,
        z: 0
    };
    var emotePoseEnd = null;
    var keyFrameStart = 0;
    var keyFrameDuration = 0;
    for (var i in keyframes) {
        var emoteKeyFrame = keyframes[i];
        for (var t in emoteKeyFrame.emotePoses) {
            var emotePose = emoteKeyFrame.emotePoses[t];
            if (emotePose.bodyPart == bodyPartId) {
                if (emoteKeyFrame.offset <= currentTime) {
                    emotePoseStart = emotePose;
                    keyFrameStart = emoteKeyFrame.offset;
                } else {
                    emotePoseEnd = emotePose;
                    keyFrameDuration = emoteKeyFrame.offset - keyFrameStart;
                    break;
                }
            }
        }
        if (emotePoseEnd != null)
            break;
    }
    if (emotePoseEnd == null) {
        return emotePoseStart;
    } else {
        var progress = currentTime - keyFrameStart;
        var processedX = process(emotePoseStart.x, emotePoseEnd.x, progress, keyFrameDuration);
        var processedY = process(emotePoseStart.y, emotePoseEnd.y, progress, keyFrameDuration);
        var processedZ = process(emotePoseStart.z, emotePoseEnd.z, progress, keyFrameDuration);
        return {
            bodyPart: emotePoseStart.bodyPart,
            x: processedX,
            y: processedY,
            z: processedZ,
            processed: true
        };
    }
};