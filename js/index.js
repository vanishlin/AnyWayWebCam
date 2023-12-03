window.addEventListener("load", function () {
    var isFront = true;
    var wrapper1 = document.querySelector(".wrapper-1"),
        wrapper2 = document.querySelector(".wrapper-2"),
        wrapper3 = document.querySelector(".wrapper-3");
    var openMediaDOM = this.document.querySelector("#openMedia");
    var localVideoDOM = document.querySelector("#localVideo"),
        exitVideoDOM = document.querySelector("#exitVideo"),
        playVideoDOM = document.querySelector("#playVideo"),
        showPicDOM = document.querySelector("#showPic"),
        takePhotoDOM = document.querySelector("#takePhoto"),
        switchCameraDOM = document.querySelector("#switchCamera");
    var canvasDOM = this.document.querySelector("#canvas"),
        photoDOM = document.querySelector("#photo");

    initView();

    openMediaDOM.addEventListener("click", function () {
        // 进入拍照
        showMediaView();
        getMedia(true, function() {
            isFront = true;
        }, function(err) {
            console.log(err);
            alert('摄像头调用失败');
            initView();
        });
    }, false);

    localVideoDOM.addEventListener("canplay", function () {
        canvasDOM.setAttribute("width", localVideoDOM.videoWidth);
        canvasDOM.setAttribute("height", localVideoDOM.videoHeight);
        localVideoDOM.play().catch(function(err) {
            // 当前浏览器不支持自动播放
            console.log(err);
            playVideoDOM.style.display = 'block';
        });
    }, false);

    playVideoDOM.addEventListener("click", function () {
        localVideoDOM.play();
        playVideoDOM.style.display = 'none';
    }, false);

    exitVideoDOM.addEventListener("click", function () {
        // 初始化
        initView();
        dropMedia();
    }, false);

    takePhotoDOM.addEventListener("click", function () {
        // 点击拍照
        var context = canvasDOM.getContext("2d");

        context.save();
        if (isFront) {
            context.scale(-1, 1);
            context.drawImage(localVideoDOM, 0, 0, -canvasDOM.width, canvasDOM.height);
        } else {
            context.drawImage(localVideoDOM, 0, 0, canvasDOM.width, canvasDOM.height);
        }
        context.restore();

        var data = canvasDOM.toDataURL("image/png");

        showPicDOM.setAttribute("style", "background-image:url(" + data + ")");
        photoDOM.setAttribute("src", data);
    }, false);

    showPicDOM.addEventListener("click", function() {
        // 预览照片
        if (showPicDOM.style.backgroundImage) {
            showPicView();
        }
    }, false);

    switchCameraDOM.addEventListener("click", function() {
        // 切换前后摄像头
        getMedia(!isFront, function() {
            isFront = !isFront;
            showMediaView();
        }, function(err) {
            console.log(err);
            alert('切换摄像头失败');
        });
    }, false)

    photoDOM.addEventListener("click", function() {
        showMediaView();
    }, false);

    function initView() {
        wrapper1.className = "wrapper-1";
        wrapper2.className = "wrapper-2 hide";
        wrapper3.className = "wrapper-3 hide";
    }

    function showMediaView() {
        var wrapper2Class = "wrapper-2";
        wrapper1.className = "wrapper-1 hide";
        wrapper3.className = "wrapper-3 hide";

        if (isFront) {
            wrapper2Class = "wrapper-2 is-front"
        }

        wrapper2.className = wrapper2Class;
    }

    function showPicView() {
        var wrapper3Class = "wrapper-3";
        wrapper1.className = "wrapper-1 hide";
        wrapper2.className = "wrapper-2 hide";

        if (isFront) {
            wrapper3Class = "wrapper-3 is-front"
        }

        wrapper3.className = wrapper3Class;
    }

    function getMedia(front, cb, errCb) {
        var videoConstraints = front
            ? { facingMode: "user" }
            : { facingMode: { exact: "environment" } };

        navigator.mediaDevices
            .getUserMedia({
                video: Object.assign(
                    {},
                    // { width: window.innerWidth, height: window.innerHeight },
                    videoConstraints
                ),
                audio: false,
            })
            .then(function (stream) {
                localVideoDOM.srcObject = stream;
                localVideoDOM.play();
                cb && cb();
            })
            .catch(function (err) {
                errCb && errCb(err);
            });
    }

    function dropMedia() {
        try {
            localVideoDOM.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
        } catch (error) { }
        
        isFront = true;
        showPicDOM.setAttribute("style", "");
        photoDOM.setAttribute("src", "");
    }
});