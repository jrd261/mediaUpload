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

    //convert image to base 64
    $scope.encodeImageFileAsURL = function (element) {
        var file = element.files[0];
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log('RESULT', reader.result)
        }
        reader.readAsDataURL(file);
        $scope.completeImage = reader.result;
    };

    //convert video to base 64
    $scope.encodeVideoFileAsURL = function (element) {
        var file = element.files[0];
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log('Video RESULT', reader.result)
        }
        reader.readAsDataURL(file);
        $scope.completeVideo = reader.result;
    };

    var imageId = document.getElementById('imageElement');
    var videoId = document.getElementById('myFileField');

    $scope.saveData = function () {
        $scope.encodeImageFileAsURL(imageId);
        $scope.encodeVideoFileAsURL(videoId);

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
    }

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

    $scope.getTitleValues = function (){
        $http.get('/api/getTitle').then(function (res) {
            console.log("Available objects in DB : " + res.data);
            $scope.availableObjs = res.data;
        });
    }
    $scope.getTitleValues();

    $scope.download = function(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }
      
      // Start file download.
      $scope.download("hello.html","This is the content of my file :)");
    // };

}); 