var app = angular.module('app', ['ngMaterial', 'ngMessages', 'ngRoute', 'ngFileUpload']);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: 'templates/upload.html',
            controller: 'uploadController'
        })
        .when('/upload', {
            templateUrl: 'templates/upload.html',
            controller: 'uploadController'
        })
});
app.controller('uploadController', function ($scope, $http, Upload) {
    $scope.formData = {};

    var imageId = document.getElementById('imageElement');
    var videoId = document.getElementById('myFileField');

    $scope.saveData = function () {
        $scope.completeImage = encodeImageFileAsURL(imageId);
        $scope.completeVideo = encodeVideoFileAsURL(videoId);

        setTimeout(function () {
            var imgPath = $scope.completeImage;
            var videoPath = $scope.completeVideo;
            var uploadFile = {
                "imgPath": imgPath,
                "videoPath": videoPath,
                "title": $scope.text
            }
            $http.post('/api/imageUpload', uploadFile).then(function (res) {
                alert(JSON.stringify(res.data.title));
                $scope.getTitleValues();
            }, function (error) {
                console.log("errorr in  uploading  image");
            })
        }, 2000);

    }

    //convert image to base 64
    var encodeImageFileAsURL = function (element) {
        var file = element.files[0];
        var reader = new FileReader();
        // reader.onloadend = function () {
        //     console.log('RESULT', reader.result)
        // }
        reader.readAsDataURL(file);
        return reader.result;
    };

    //convert video to base 64
    var encodeVideoFileAsURL = function (element) {
        var file = element.files[0];
        var reader = new FileReader();
        // reader.onloadend = function () {
        //     console.log('Video RESULT', reader.result)
        // }
        reader.readAsDataURL(file);
        return reader.result;
    };

    $scope.videoUpload = function () {
        var reqObj = {
            "videoPath": $scope.completeVideo
        };
        $http.post('/api/uploadVideo', reqObj).then(function (res) {
            console.log("response :" + res.data);
        });
    }
    // delete a todo after checking it
    $scope.deleteTodo = function (id) {
        $http.delete('/api/todos/' + id)
            .success(function (data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // get the list  of available titles in the DB
    // $scope.export = function (){

    $scope.getTitleValues = function () {
        $http.get('/api/getTitle').then(function (res) {
            console.log("Available objects in DB : " + res.data);
            $scope.availableObjs = res.data;
        });
    }
    $scope.getTitleValues();

    $scope.download = function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    // Start file download.
    //   $scope.download("hello.html","This is the content of my file :)");
    // };

    $scope.getHtmlString = function () {
        $http.get("/api/getHtml?id=" + $scope.seelctedProject._id).then(function (resposne) {

            var htmlStr = resposne.data.html;
            var currentobj = resposne.data.obj;

            var img1 = btoa(String.fromCharCode.apply(null, currentobj.img.data.data));
            var img = atob(img1);

            var video = atob(btoa(new Uint8Array(currentobj.video.data.data).reduce(function (data, byte) {
                return data + String.fromCharCode(byte);
            }, '')));

            console.log(htmlStr);

            var renderStr = htmlStr.replace(/\$title/g, currentobj.title).replace(/\$img/g, img).replace(/\$video/g, video);
            $scope.download($scope.seelctedProject.title + ".html", renderStr);
        });
    }
}); 