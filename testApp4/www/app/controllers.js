var host = "http://paatshaalamobileapi-prod.us-west-2.elasticbeanstalk.com/";
//var host = "http://192.168.31.100/SampleAPI/";
//var host = "http://192.168.43.164/SampleAPI/";
//var host = "http://192.168.1.12/SampleAPI/";
//var host = "http://localhost/SampleAPI/";
(function () {
    "use strict";
    angular.module("myapp.controllers", ['ionic-datepicker', 'tabSlideBox'])
	.controller("appCtrl", ["$scope", function ($scope) {
	    $scope.menu = {
	        user: {
	            name: "User",
	            type: "Type"
	        },
	        student: {
	            name: "Student"
	        }
	    };
	    var students = JSON.parse(localStorage["currentStudents"]);
	    var stud = students.find(function (e) {
	        return e.Id == localStorage["selectedStudent"];
	    });
	    $scope.menu.student.name = stud ? stud.Name : "No Student selected!";

	    var user = JSON.parse(localStorage["LoginUser"]);

	    $scope.menu.user.name = user.Username;
	    $scope.menu.user.type = localStorage["LoginType"];

	}])
    .controller("appempCtrl", ["$scope", function ($scope) {
        $scope.menu = {
            user: {
                name: "User",
                type: "Type"
            },
            student: {
                name: "Student"
            }
        };

        var user = JSON.parse(localStorage["LoginUser"]);

        $scope.menu.user.name = user.Username;
        $scope.menu.user.type = localStorage["LoginType"];

    }])
	.controller('loginCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', '$ionicHistory', '$cordovaToast', function ($scope, $http, $CustomLS, $ionicLoading, $state, $ionicHistory, $cordovaToast) {
	    $scope.loginData = {};
	    $scope.message = "";
	    $scope.newUser = function () {
	        $state.go('view-SendVerificationCode');
	    };
	    $scope.forgetPassword = function () {
	        $state.go('view-forgetPassword');
	    }
	    $scope.EmployeeForgetPassword = function () {
	        $state.go('view-employeeForgetPassword');
	    }
	    var validate = function () {
	        if (!$scope.loginData.Username) {
	            $cordovaToast.showShortCenter('Email required!');
	            return false;
	        }
	        if (!$scope.loginData.Password) {
	            $cordovaToast.showShortCenter('Password required!');
	            return false;
	        }
	        if (!$scope.loginData.OrgName && $scope.loginData.Usertype == 'Employee') {
	            $cordovaToast.showShortCenter('Organisation Name required!');
	            return false;
	        }
	        return true;
	    };
	    $scope.login = function () {
	        if (!validate()) {
	            return;
	        }
	        if ($scope.loginData.Usertype == 'Employee') {
	            $ionicLoading.show({
	                template: 'Loging In...',
	                duration: 10000
	            });
	            $http.post(host + 'User/TMFEmployeeLogin', $scope.loginData).success(function (data) {
	                debugger;
	                if (data.Status) {
	                    localStorage['LoginType'] = 'Employee';
	                    $CustomLS.setObject('LoginUser', data.User);
	                    //$CustomLS.setObject('currentStudents', data.HasStudents);
	                    localStorage['LoginToken'] = data.Token;
	                    $state.go('appemp.view-Employee-home');
	                    $cordovaToast.showShortCenter('Login Success');
	                } else {
	                    $cordovaToast.showShortCenter(data.Message);
	                }
	                $ionicLoading.hide();
	            }).error(function (errData) {
	                console.log(errData);
	                $ionicLoading.hide();
	                alert(errData);
	            });
	        } else {
	            $ionicLoading.show({
	                template: 'Loging In...',
	                duration: 10000
	            });
	            $http.post(host + 'User/Login', $scope.loginData).success(function (data) {
	                if (data.Status) {
	                    if (data.HasStudents.length == 0) {
	                        alert('No children tagged to the mail Id ' + data.User.Username);
	                    } else {
	                        localStorage['LoginType'] = 'Parent';
	                        $CustomLS.setObject('LoginUser', data.User);
	                        $CustomLS.setObject('currentStudents', data.HasStudents);
	                        localStorage['LoginToken'] = data.Token;
	                        $scope.values = $CustomLS.getObject('currentStudents');

	                        $scope.selectStudent = data.HasStudents[0];
	                        localStorage['selectedStudent'] = $scope.selectStudent.Id;
	                        localStorage['selectedStudentBatch'] = $scope.selectStudent.Batch;
	                        localStorage['selectedStudentCourse'] = $scope.selectStudent.Course;
	                        localStorage['selectedStudentOrgId'] = $scope.selectStudent.OrgId;
	                        $state.go('app.view-parent-home');
	                    }
	                    $cordovaToast.showShortCenter('Login Success');
	                } else {
	                    $cordovaToast.showShortCenter(data.Message);
	                }
	                $ionicLoading.hide();
	            }).error(function (errData) {
	                console.log(errData);
	                $ionicLoading.hide();
	                alert(errData);
	            });
	        }
	    }
	}
	])
	.controller('settingCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', '$ionicPopup', function ($scope, $http, $CustomLS, $ionicLoading, $state, $ionicPopup) {
	    $scope.AppCurrentVersion = localStorage['AppCurrentVersion'];
	    $scope.AppToken = localStorage['token'];
	    $scope.logout = function () {
	        localStorage.clear();
	        location.reload();
	        $state.go('login');
	    };
	    $scope.NewVersionData = {};
	    $scope.checkForUpdate = function () {
	        debugger;
	        $http.get(host + 'AppManager/GetLatestVersion').success(function (data) {
	            debugger;
	            $scope.NewVersionData = data;
	            $scope.NewVersionData.Url = host + "AppManager/PatashalaApp";
	            console.log(data);
	            var version = localStorage['AppCurrentVersion'];
	            if (data.Version.trim() != version.trim()) {
	                $ionicPopup.alert({
	                    title: 'New Update Available!',
	                    template: "<strong>New Version : </strong> {{NewVersionData.Version}} <br />  <a href=\"#\" onclick=\"window.open('" + $scope.NewVersionData.Url + "', '_system', 'location=yes'); return false;\"> Get from here</a><br /> {{NewVersionData.UpdateMessage}}",
	                    scope: $scope
	                });
	            }
	            else {
	                $ionicPopup.alert({
	                    title: 'App is up to date.',
	                    template: "<strong>Great! You are using the latest Version.",
	                    scope: $scope
	                });
	            }
	        });
	    }
	}
	])
	.controller('changeStudentCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', function ($scope, $http, $CustomLS, $ionicLoading, $state) {
	    $scope.currentStudents = $CustomLS.getObject('currentStudents', []);
	    $scope.data = {
	        student: localStorage['selectedStudent']
	    };
	    $scope.changeStudent = function () {
	        localStorage['selectedStudent'] = $scope.data.student;
	        $scope.studentCurrent = $scope.currentStudents.find(function (f) {
	            return f.Id == $scope.data.student
	        });
	        localStorage['selectedStudentBatch'] = $scope.studentCurrent.Batch;
	        localStorage['selectedStudentCourse'] = $scope.studentCurrent.Course;
	        localStorage['selectedStudentOrgId'] = $scope.studentCurrent.OrgId;

	    };
	}
	])
	.controller('manageChildrenCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', function ($scope, $http, $CustomLS, $ionicLoading, $state) {
	    $scope.user = $CustomLS.getObject('loginUser');
	    $scope.courses = []
	    $scope.batches = [];
	    $scope.students = [];

	    $scope.data = {};
	    $scope.currentStudents = $CustomLS.getObject('currentStudents', []);
	    $scope.addSelectedStudents = function () {
	        $scope.students.find(function (s) {
	            return s.selected;
	        });
	        $scope.students.forEach(function (v, i) {
	            if (v.selected & $scope.currentStudents.find(function (s) {
                        return s.Id == v.Id;
	            }) == undefined) {
	                $scope.currentStudents.push(v);
	            }
	        });
	        $CustomLS.setObject('currentStudents', $scope.currentStudents);
	    };
	    $scope.deleteStudent = function (student) {
	        $scope.currentStudents = $scope.currentStudents.filter(function (s) {
	            return s.Id != student.Id
	        });
	        $CustomLS.setObject('currentStudents', $scope.currentStudents);
	    };
	}
	])
	.controller("homeCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {

	    $scope.goAfterLogin = function (data) { }
	    $scope.goRegister = function () {
	        $state.go('register');
	    }
	    $scope.forgotPass = function () {
	        $state.go('view-forgetPassword');
	    }
	    $scope.parentHome = function () {
	        $state.go('view-parent-home');
	    }

	}
	])
	.controller("registerCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {

	    $http.get(host + '/School/GetAll').then(function (res) {
	        debugger;
	        console.log(res);
	        $scope.SchoolList = res.data;
	    });

	}
	])
	.controller("SendVerificationCodeCtrl", ["$scope", "$state", "$ionicLoading", "$http", "$ionicPopup", "$CustomLS", function ($scope, $state, $ionicLoading, $http, $ionicPopup, $CustomLS) {
	    $scope.sendVerificationCode = function (data) {
	        $ionicLoading.show({
	            template: 'Sending Verification Code...',
	            duration: 10000
	        });
	        $CustomLS.setObject('UserRegistration', data);
	        $http.post(host + 'ParentRegistration/SendEmailVerificationCode', {
	            'Email': data.email
	        }).success(function (data) {
	            debugger;
	            $ionicLoading.hide();
	            if (data.status) {
	                $state.go('view-PassCode');
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Invalid',
	                    template: data.Message,
	                });
	            }
	        })
	    }
	}
	])
	.controller("PassCodeCtrl", ["$scope", "$state", "$ionicLoading", "$http", "$ionicPopup", "$CustomLS", function ($scope, $state, $ionicLoading, $http, $ionicPopup, $CustomLS) {
	    $scope.UserRegistration = $CustomLS.getObject('UserRegistration', []);
	    $scope.verify = function (data) {
	        debugger;
	        $ionicLoading.show({
	            template: 'Verifing...',
	            duration: 10000
	        });
	        $http.post(host + '/ParentRegistration/VerifyCode', {
	            'Email': $scope.UserRegistration.email,
	            'Passcode': data.passcode
	        }).success(function (data) {
	            $ionicLoading.hide();
	            if (data.status) {
	                $state.go('ChangePassword');
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Invalid',
	                    template: data.Message,
	                });
	            }
	        })
	    }
	}
	])
	.controller("ChangePasswordCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $ionicPopup) {
	    $scope.user = $CustomLS.getObject('UserRegistration');
	    $scope.changePassword = function (data) {
	        if (data.password == data.repeatPassword) {
	            $http.post(host + '/ParentRegistration/SavePassword', {
	                'Email': $scope.user.email,
	                'Password': data.password
	            }).success(function (data) {
	                debugger;
	                if (data.status) {
	                    $state.go('login');
	                }
	            })
	        }
	    }
	}
	])
	.controller("afterLoginCtrl", ["$scope", "$state", function ($scope, $state) { }
	])
	.controller("parentForgetPasswordCtrl", ["$scope", "$state", "$http", "$ionicPopup", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $ionicPopup, $CustomLS, $ionicLoading) {
	    $scope.message = "";
	    $scope.sendPassword = function (data) {
	        $ionicLoading.show({
	            template: 'Sending...',
	            duration: 10000
	        });
	        $http.post(host + 'ForgetPassword/getPassword', {
	            Email: data.email
	        }).success(function (data) {
	            $ionicLoading.hide();
	            if (data.status) {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Success',
	                    template: 'Password Sent Your Mail'
	                });
	                $state.go('login');
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Invalid',
	                    template: data.Message
	                });
	            }
	        });
	    }
	}
	])
	.controller("employeeForgetPasswordCtrl", ["$scope", "$state", "$http", "$ionicPopup", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $ionicPopup, $CustomLS, $ionicLoading) {
	    $scope.sendEmployeePassword = function (data) {
	        $ionicLoading.show({
	            template: 'Sending...',
	            duration: 10000
	        });
	        $http.post(host + 'ForgetPassword/getEmployeePassword', {
	            Email: data.email,
	            OrgName: data.OrgName
	        }).success(function (data) {
	            $ionicLoading.hide();
	            if (data.status) {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Success',
	                    template: 'Password Sent Your Mail'
	                });
	                $state.go('login');
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Invalid',
	                    template: data.Message
	                });
	            }
	        })
	    }
	}
	])
	.controller("getNewPasswordCtrl", ["$scope", "$state", function ($scope, $state) { }
	])
	.controller("TrackStudentCtrl", ["$scope", "$state", "$ionicLoading", "$http", function ($scope, $state, $ionicLoading, $http) {
	    $scope.map = {};
	    $scope.time = {
	        timeToRefresh: 1000,
	        refreshMessage: 'Please select the Route Code!',
	        refreshInterval: 10000
	    };
	    $scope.RouteCode = [];
	    $scope.selected = {};
	    $scope.locationData = {};
	    $http.post(host + '/GeoLocation/GetRouteCode', {
	        'OrgId': localStorage['selectedStudentOrgId']
	    }).success(function (data) {
	        $scope.RouteCode = data;
	    })
	    $scope.routeChanged = function () {
	        $scope.time.refreshMessage = "";
	        $scope.getRouteLocation();
	    };
	    var marker;
	    $scope.getRouteLocation = function () {
	        $ionicLoading.show({ template: 'Loading Route location...', duration: 10000 });
	        $http.get(host + 'GeoLocation/ShowLocation?OrgId=' + localStorage['selectedStudentOrgId'] + '&Routecode=' + $scope.selected.Route).success(function (data) { //localStorage['selectedStudentOrgId']+, { OrgId: localStorage['selectedStudentOrgId'], Routecode: $scope.selected.Route }
	            $ionicLoading.hide();
	            $scope.locationData = data;
	            $scope.map.setCenter(new google.maps.LatLng(data.Latitude, data.Longitude));
	            $scope.time.refreshMessage = "Last updated on " + new Date().toLocaleTimeString();

	            if (marker) {
	                marker.setMap(null);
	            }
	            marker = new google.maps.Marker({
	                position: new google.maps.LatLng(data.Latitude, data.Longitude),
	                map: $scope.map,
	                title: 'Route No: ' + $scope.selected.Route
	            });
	            var infowindow = new google.maps.InfoWindow({
	                content: 'Route No: ' + $scope.selected.Route,
	                position: new google.maps.LatLng(data.Latitude, data.Longitude)
	            });
	            google.maps.event.addListener(marker, 'click', function () {
	                infowindow.open($scope.map, marker);
	            });
	        }).error(function (err) {
	            $ionicLoading.hide();
	            $cordovaToast.showShortCenter('Error Getting Location.');
	        });
	    };

	    var mapOptions = {
	        center: new google.maps.LatLng(43.07493, -89.381388),
	        zoom: 15,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };

	    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
	    var timer;
	    if (!timer) {
	        timer = setInterval(function () {
	            if ($scope.time.timeToRefresh >= $scope.time.refreshInterval) {
	                $scope.time.timeToRefresh = 0;
	                if ($scope.selected.Route) {
	                    $scope.getRouteLocation();
	                }
	                console.log($scope.time.timeToRefresh);
	            }
	            $scope.time.timeToRefresh += $scope.time.refreshInterval;
	            $scope.$apply();
	        }, $scope.time.refreshInterval);
	    }
	}
	])
	.controller("parentHomeCtrl", ["$scope", "$state", "$ionicPopover", '$ionicHistory', '$ionicNavBarDelegate', '$cordovaAppVersion', '$http', '$ionicPopup', function ($scope, $state, $ionicPopover, $ionicHistory, $ionicNavBarDelegate, $cordovaAppVersion, $http, $ionicPopup) {
	    $scope.Pages = [
                {
                    "Name": "Photo Gallery",
                    "Href": "#/ParentGalleryGrid",
                    "Icon": "ion-images"
                },
                {
                    "Name": "Fee Details",
                    "Href": "#/view-feeDeatils",
                    "Icon": "ion-card"
                },
                //{
                //    "Name": "Subject Details",
                //    "Href": "#/view-subject-details",
                //    "Icon": "ion-ios-book"
                //},
                {
                    "Name": "Student Details",
                    "Href": "#/view-studentDetail",
                    "Icon": "ion-android-person"
                },
                //{
                //    "Name": "Homework Details",
                //    "Href": "#/view-HomeWork-Details",
                //    "Icon": "ion-printer"
                //},
                {
                    "Name": "Holidays",
                    "Href": "#/view-holidays",
                    "Icon": "ion-android-bicycle"
                }, {
                    "Name": "Message Box",
                    "Href": "#/view-MessageBox",
                    "Icon": "ion-android-chat"
                },
                //{
                //    "Name": "Time Table",
                //    "Href": "#/view-TimeTable",
                //    "Icon": "ion-android-clipboard"
                //},
                //{
                //    "Name": "Exam Details",
                //    "Href": "#/view-ExaminationDetails",
                //    "Icon": "ion-ios-book-outline"
                //},
                {
                    "Name": "Teacher Details",
                    "Href": "#/view-teacherDetail",
                    "Icon": "ion-person"
                }, 
                //{
                //    "Name": "Assesment Report",
                //    "Href": "#/view-assesmentReport",
                //    "Icon": "ion-ribbon-a"
                //},
                //{
                //    "Name": "Track Student",
                //    "Href": "#/view-trackstudent",
                //    "Icon": "ion-location"
                //},
                 {
                     "Name": "Diary Report",
                     "Href": "#/ParentDiaryReport",
                     "Icon": "ion-android-clipboard"
                 },
	    ];

	    $scope.NewVersionData = {};
	    if (localStorage['LastToken'] != localStorage["FCMToken"]) {
	        var userId = JSON.parse(localStorage['LoginUser']).UserId;
	        $http.get(host + 'User/UpdateToken?UserId=' + userId + '&SenderId=' + localStorage["FCMToken"]).success(function (data) {
	            localStorage['LastToken'] = localStorage["FCMToken"];
	        }).error(function (err) {
	        });
	    }

	    $scope.submitEmail = function () {
	        $state.go('view-subject-details');
	    }

	    $ionicPopover.fromTemplateUrl('my-popover.html', {
	        scope: $scope
	    }).then(function (popover) {
	        $scope.popover = popover;
	    });
	    if (localStorage["Message"]) {
	        $state.go('view-MessageBox');
	    }
	    document.addEventListener("deviceready", function () {
	        $cordovaAppVersion.getVersionNumber().then(function (version) {
	            localStorage['AppCurrentVersion'] = version;
	            $http.get(host + 'AppManager/GetLatestVersion').success(function (data) {
	                debugger;
	                $scope.NewVersionData = data;
	                $scope.NewVersionData.Url = host + "AppManager/PatashalaApp";
	                console.log(data);
	                if (data.Version.trim() != version.trim()) {
	                    $ionicPopup.alert({
	                        title: 'New Update Available!',
	                        template: "<strong>New Version : </strong> {{NewVersionData.Version}} <br />  <a href=\"#\" onclick=\"window.open('" + $scope.NewVersionData.Url + "', '_system', 'location=yes'); return false;\"> Get from here</a><br /> {{NewVersionData.UpdateMessage}}",
	                        scope: $scope
	                    });
	                }
	            });
	        });
	    }, false);
	}
	])
	.controller("employeeHomeCtrl", ["$scope", "$state", "$ionicPopover", '$ionicHistory', '$ionicNavBarDelegate', '$cordovaAppVersion', '$http', '$ionicPopup', function ($scope, $state, $ionicPopover, $ionicHistory, $ionicNavBarDelegate, $cordovaAppVersion, $http, $ionicPopup) {
	    $scope.Pages = [
            //{
            //    "Name": "Transport Attendance  (BC)",
            //    "Href": "#/TransportBarcodeAttendance",
            //    "Icon": "transport.png"
            //},
            {
                "Name": " Student Attendance  (BC)",
                "Href": "#/StudentBarcodeAttendance",
                "Icon": "attendance.png"
            }, {
                "Name": "Employee Attendance  (BC)",
                "Href": "#/EmployeeBarcodeAttendance",
                "Icon": "emp-attendance.png"
            },
             {
                   "Name": "Personal Details",
                   "Href": "#/EmployeeProfile",
                   "Icon": "man.png"
               },
           
            //{
            //    "Name": "Geo Location",
            //    "Href": "#/Geolocation",
            //    "Icon": "trackstudent.png"
            //},
            {
                "Name": "Student Attendance  (M)",
                "Href": "#/StudentManualAttendance",
                "Icon": "student.png"
            },
             {
                "Name": "Gallery",
                "Href": "#/EmployeeGallery",
                "Icon": "gallery.png"
            },
             //{
             //    "Name": "Transport Attendance  (M)",
             //    "Href": "#/TransportManualAttendance",
             //    "Icon": "TransportManualAttendance.png"
             //},
            {
                "Name": "Employee Attendance  (M)",
                "Href": "#/EmployeeManualAttendance",
                "Icon": "curriculum.png"
            },
             {
                 "Name": "Holidays",
                 "Href": "#/Employeeholidays",
                 "Icon": "holiday.png"
             },
              {
                  "Name": "Attendance With Time",
                  "Href": "#/EmployeeDaycareAttendance",
                  "Icon": "DayCareAttendance.png"
              },
              
            {
                "Name": "Enquiry Form",
                "Href": "#/EnquiryForm",
                "Icon": "inquiry.png"
            }, {
                "Name": "Diary Report",
                "Href": "#/EmployeeDiaryReport",
                "Icon": "subject.png"
            }
            //{
            //    "Name": "TrackBus",
            //    "Href": "#/view-trackEmployee",
            //    "Icon": "trackstudent.png"
            //},

	    ];
	    $scope.user = JSON.parse(localStorage["LoginUser"]);
	    //if ($scope.user.Role != "Admin") {
	    //    $scope.Pages = $scope.Pages.filter(function (e) {
	    //        return e.Name != "Transport";
	    //    });
	    //}
	    $scope.grid = [];
	    for (var i = 0; i < Math.ceil($scope.Pages.length / 3) ; i++) {
	        var row = [];
	        for (var j = 0; j < 3; j++) {
	            if (i * 3 + j < $scope.Pages.length)
	                row.push(i * 3 + j);
	        }
	        $scope.grid.push(row);
	    }
	    document.addEventListener("deviceready", function () {
	        $cordovaAppVersion.getVersionNumber().then(function (version) {
	            localStorage['AppCurrentVersion'] = version;
	            $http.get(host + 'AppManager/GetLatestVersion').success(function (data) {
	                $scope.NewVersionData = data;
	                $scope.NewVersionData.Url = host + "AppManager/PatashalaApp";
	                console.log(data);
	                if (data.Version.trim() != version.trim()) {
	                    $ionicPopup.alert({
	                        title: 'New Update Available!',
	                        template: "<strong>New Version : </strong> {{NewVersionData.Version}} <br />  <a href=\"#\" onclick=\"window.open('" + $scope.NewVersionData.Url + "', '_system', 'location=yes'); return false;\"> Get from here</a><br /> {{NewVersionData.UpdateMessage}}",
	                        scope: $scope
	                    });
	                }
	            });
	        });
	    }, false);
	}
	])
	.controller("subjectDetailCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    var studentId = localStorage['selectedStudent'];
	    $http.post(host + '/Subjects/GetAllByStudent', {
	        StudentId: studentId
	    }).success(function (data) {
	        debugger;
	        $scope.SubjectDetail = data;
	    });
	}
	])
	.controller("feeDetailCtrl", ["$scope", "$state", "$http", "$ionicLoading", '$CustomLS', function ($scope, $state, $http, $ionicLoading, $CustomLS) {
	    debugger;
	    var studentId = localStorage['selectedStudent'];

	    $scope.student = $CustomLS.getObject('currentStudents').find(function (f) {
	        return f.Id == studentId
	    });
	    $scope.feeDetails = [];
	    $ionicLoading.show({
	        template: 'Loading Fee Details...'
	    });
	    $http.post(host + 'FeeDetail/GetByStudent', {
	        StudentId: studentId
	    }).success(function (data) {
	        debugger;
	        $scope.feeDetails = data;
	        $ionicLoading.hide();
	    });

	}
	])
	.controller("attendenceCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
	    debugger;
	    $http.get(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {
	        debugger;
	        console.log(res);
	        $scope.SubjectDetail = res.data;
	    });

	}
	])
	.controller("StudentManualAttendanceNextPageCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $stateParams, $ionicPopup) {
	    debugger;
	    $scope.dropdownValues = [{
	        Name: 'Present',
	        Id: true
	    }, {
	        Name: 'Absent',
	        Id: false
	    }
	    ]
	    $scope.dropdown = {};
	    $scope.data = {};
	    $scope.BackupStudentsList = {};
	    $scope.user = $CustomLS.getObject('LoginUser');
	    $scope.BatchId = $stateParams.BatchId;
	    $scope.CourseId = $stateParams.CourseId;
	    $scope.Date = $stateParams.Date;
	    $http.post(host + '/Attandance/getStudentsBasedOnFiler', {
	        BatchId: $scope.BatchId,
	        CourseId: $scope.CourseId,
	        OrgId: $scope.user.OrgId,
	        AttendanceDate: $scope.Date
	    }).success(function (data) {
	        debugger;
	        $scope.StudentsList = {};
	        $scope.BackupStudentsList = $scope.StudentsList = data;
	    });
	    $scope.dropvalueChange = function () {
	        console.log($scope.dropdown.value);
	        debugger;
	        if ($scope.dropdown.value != "-1") {
	            $scope.StudentsList.forEach(function (e, i) {
	                e.isPresent = $scope.dropdown.value == "0" ? false : true;
	                $scope.BackupStudentsList.filter(function (e2) {
	                    return e2.Id == e.Id;
	                })[0].isPresent = e.isPresent;
	            });
	        }
	    };
	    $scope.searchTextChanged = function () {
	        $scope.StudentsList = $scope.BackupStudentsList.filter(function (e) {
	            return e.StudentName.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1;
	        });
	    }
	    $scope.SubmittingAttendance = function () {
	        debugger;
	        $scope.StudentsList;
	        $http.post(host + '/Attandance/saveDailyStudentAttendance', {
	            DailyAttendanceObj: $scope.StudentsList,
	            dateAttendance: $scope.Date,
	            OrgId: $scope.user.OrgId
	        }).success(function (data) {
	            debugger;
	            if (data.status) {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Success',
	                    template: 'Saved Successfully!'
	                });
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Failed',
	                    template: 'Error Occured!'
	                });
	            }
	        });
	    };

	}
	])
	.controller("StudentManualAttendanceCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

	    $scope.selected = {}
	    $scope.user = $CustomLS.getObject('LoginUser');
	    debugger;
	    $http.post(host + '/Attandance/getBatchAndCourse', {
	        OrgId: $scope.user.OrgId
	    }).success(function (data) {
	        debugger;
	        $scope.Batchlist = data.Batches;
	        $scope.CourseList = data.Courses;
	    });

	    $scope.date = new Date();
	    $scope.FormattedDate = $scope.date.toLocaleDateString();
	    $scope.setDateTime = function () {
	        var ipObj1 = {
	            callback: function (val) { //Mandatory
	                var date = new Date(val);
	                $scope.date = date;
	                $scope.FormattedDate = date.toLocaleDateString();
	            },
	            inputDate: new Date(),
	            showTodayButton: true,
	            to: new Date(), //Optional
	            inputDate: new Date(), //Optional
	            mondayFirst: false, //Optional
	            closeOnSelect: false, //Optional
	            templateType: 'popup' //Optional
	        };
	        ionicDatePicker.openDatePicker(ipObj1);
	    };
	    $scope.GiveAttendanceList = function () {
	        debugger;
	        $state.go('NextStudentManualAttendanceScreen', {
	            BatchId: $scope.selected.Batch,
	            CourseId: $scope.selected.Course,
	            Date: $scope.date
	        });
	    };
	}
	])
    .controller("transportManualAttendenceCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

        $scope.selected = {}
        $scope.data = {}
        $scope.user = $CustomLS.getObject('LoginUser');
        debugger;
        $http.post(host + '/Attandance/getBatchAndCourse', {
            OrgId: $scope.user.OrgId
        }).success(function (data) {
            debugger;
            $scope.Batchlist = data.Batches;
            $scope.CourseList = data.Courses;
        });

        $scope.date = new Date();
        $scope.FormattedDate = $scope.date.toLocaleDateString();
        $scope.setDateTime = function () {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    var date = new Date(val);
                    $scope.date = date;
                    $scope.FormattedDate = date.toLocaleDateString();
                },
                inputDate: new Date(),
                showTodayButton: true,
                to: new Date(), //Optional
                inputDate: new Date(), //Optional
                mondayFirst: false, //Optional
                closeOnSelect: false, //Optional
                templateType: 'popup' //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        $scope.GiveTransportManualAttendanceList = function () {
            debugger;
            $state.go('NextTransportManualAttendance', {
                BatchId: $scope.selected.Batch,
                CourseId: $scope.selected.Course,
                Date: $scope.date,
                Choice: $scope.data.choice
            });
        };
    }
    ])
    .controller("TransportManualAttendanceNextPageCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $stateParams, $ionicPopup) {
        debugger;
        $scope.dropdownValues = [{
            Name: 'Present',
            Id: true
        }, {
            Name: 'Absent',
            Id: false
        }
        ]
        $scope.dropdown = {};
        $scope.data = {};
        $scope.BackupStudentsList = {};
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.BatchId = $stateParams.BatchId;
        $scope.CourseId = $stateParams.CourseId;
        $scope.Choice = $stateParams.Choice
        $scope.Date = $stateParams.Date;
        $http.post(host + '/Attandance/getTransportStudentsBasedOnFiler', {
            BatchId: $scope.BatchId,
            CourseId: $scope.CourseId,
            OrgId: $scope.user.OrgId,
            AttendanceDate: $scope.Date,
            Choice: $scope.Choice
        }).success(function (data) {
            debugger;
            $scope.StudentsList = {};
            $scope.BackupStudentsList = $scope.StudentsList = data;
        });
        $scope.dropvalueChange = function () {
            console.log($scope.dropdown.value);
            debugger;
            if ($scope.dropdown.value != "-1") {
                $scope.StudentsList.forEach(function (e, i) {
                    e.isPresent = $scope.dropdown.value == "0" ? false : true;
                    $scope.BackupStudentsList.filter(function (e2) {
                        return e2.Id == e.Id;
                    })[0].isPresent = e.isPresent;
                });
            }
        };
        $scope.searchTextChanged = function () {
            $scope.StudentsList = $scope.BackupStudentsList.filter(function (e) {
                return e.StudentName.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1;
            });
        }
        $scope.SubmitTransportManualAttendance = function () {
            debugger;
            $scope.StudentsList;
            $http.post(host + 'Attandance/SaveStudentTransportManualAttendance', {
                DailyTransportAttendanceObj: $scope.StudentsList,
                dateAttendance: $scope.Date,
                OrgId: $scope.user.OrgId,
                Choice: $scope.Choice
            }).success(function (data) {
                debugger;
                if (data.status) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: 'Saved Successfully!'
                    });
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Failed',
                        template: 'Error Occured!'
                    });
                }
            });
        };

    }
    ])
    .controller("EmployeeDaycareAttendanceNextPageCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$ionicPopup", "$ionicLoading", "$cordovaToast", function ($scope, $state, $http, $CustomLS, $stateParams, $ionicPopup, $ionicLoading, $cordovaToast) {

        $scope.StudentsList = [];
        var getTime = function (time, callback) {
            if (time == 'NOT SET' || !time) {
                time = new Date();
            }
            else {
                time = new Date('01/01/2001 ' + time);
            }
            datePicker.show({
                date: time,
                mode: 'time'
            }, function (date) {
                var time = ((date.getHours() % 12 < 10 ? '0' : '') + date.getHours() % 12) + ':' + ((date.getMinutes() < 10 ? '0' : '') + date.getMinutes()) + ' ' + (date.getHours() % 12 == 0 ? 'AM' : 'PM');
                callback(time);
            });
        };
        $scope.getCheckInTime = function (i) {
            getTime(i.CheckInTime, function (time) {
                i.CheckInTime = time;
                $scope.$apply();
            });
        };
        $scope.getCheckOutTime = function (i) {
            getTime(i.CheckOutTime, function (time) {
                i.CheckOutTime = time;
                $scope.$apply();
            });
        };

        $scope.data = {};
        $scope.BackupStudentsList = {};
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.BatchId = $stateParams.BatchId;
        $scope.CourseId = $stateParams.CourseId;
        debugger;
        $scope.Date = $stateParams.Date;
        $scope.ChoiceId = $stateParams.ChoiceId;

        $ionicLoading.show({ template: 'Loading students...', duration: 10000 });
        $http.post(host + '/Attandance/GetStudentsAttendance', {
            BatchId: $scope.BatchId,
            CourseId: $scope.CourseId,
            OrgId: $scope.user.OrgId,
            AttendanceDate: (($scope.Date.getYear() + 1900) + '/' + ($scope.Date.getMonth() + 1) + '/' + $scope.Date.getDate())
        }).success(function (data) {
            $ionicLoading.hide();
            $scope.BackupStudentsList = $scope.StudentsList = data;
        });
        $scope.searchTextChanged = function () {
            $scope.StudentsList = $scope.BackupStudentsList.filter(function (e) {
                return e.StudentName.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1;
            });
        }

        $scope.SaveAttendance = function () {
            $ionicLoading.show({ template: 'Saving attendance...', duration: 10000 });
            $http.post(host + '/Attandance/SaveDailyStudentAttendanceByTime',
            {
                attendanceData: $scope.BackupStudentsList,
                dateAttendance: (($scope.Date.getYear() + 1900) + '/' + ($scope.Date.getMonth() + 1) + '/' + $scope.Date.getDate()),
                OrgId: $scope.user.OrgId
            }).success(function (data) {
                console.log("Saving attendance", data);
                $ionicLoading.hide();
                $cordovaToast.showShortCenter(data);
            });
        };
    }
    ])
	.controller("EmployeeDaycareAttendenceCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

	    $scope.selected = {}
	    $scope.user = $CustomLS.getObject('LoginUser');
	    $http.post(host + '/Attandance/getBatchAndCourse', {
	        OrgId: $scope.user.OrgId
	    }).success(function (data) {
	        $scope.Batchlist = data.Batches;
	        $scope.CourseList = data.Courses;
	    });

	    $scope.date = new Date();
	    $scope.FormattedDate = $scope.date.toLocaleDateString();
	    $scope.setDateTime = function () {
	        var ipObj1 = {
	            callback: function (val) { //Mandatory
	                var date = new Date(val);
	                $scope.date = date;
	                $scope.FormattedDate = date.toLocaleDateString();
	            },
	            inputDate: new Date(),
	            showTodayButton: true,
	            to: new Date(), //Optional
	            inputDate: new Date(), //Optional
	            mondayFirst: false, //Optional
	            closeOnSelect: false, //Optional
	            templateType: 'popup' //Optional
	        };
	        ionicDatePicker.openDatePicker(ipObj1);
	    };

	    $scope.GiveAttendanceList = function () {
	        $state.go('NextEmployeeDaycareAttendanceScreen', {
	            BatchId: $scope.selected.Batch,
	            CourseId: $scope.selected.Course,
	            Date: $scope.date
	        });
	    };
	}
	])
    .controller("employeeManualAttendenceCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {
        debugger;
        $scope.selected = {}
        $scope.Rolelist = {}
        $scope.user = $CustomLS.getObject('LoginUser');
        debugger;
        $http.post(host + '/EmployeeAttendance/getRoloes', {
            OrgId: $scope.user.OrgId

        }).success(function (data) {
            debugger;
            $scope.Rolelist = data;
        });

        $scope.date = new Date();
        $scope.FormattedDate = $scope.date.toLocaleDateString();
        $scope.setDateTime = function () {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    var date = new Date(val);
                    $scope.date = date;
                    $scope.FormattedDate = date.toLocaleDateString();
                },
                inputDate: new Date(),
                showTodayButton: true,
                to: new Date(), //Optional
                inputDate: new Date(), //Optional
                mondayFirst: false, //Optional
                closeOnSelect: false, //Optional
                templateType: 'popup' //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        $scope.GiveAttendanceList = function () {
            debugger;

            $state.go('NextEmployeeManualAttendanceScreen', {
                RoleId: $scope.selected.Role,
                Date: $scope.date
            });
        };
    }
    ])
    .controller("EmployeeManualAttendanceNextPageCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $stateParams, $ionicPopup) {
        debugger;
        $scope.dropdownValues = [{
            Name: 'Present',
            Id: true
        }, {
            Name: 'Absent',
            Id: false
        }
        ]
        $scope.dropdown = {};
        $scope.data = {};
        $scope.BackupEmployeesList = {};
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.RoleId = $stateParams.RoleId;
        $scope.Date = $stateParams.Date;
        debugger;
        $http.post(host + '/EmployeeAttendance/getEmployeesOnRole', {
            RoleId: $scope.RoleId,
            OrgId: $scope.user.OrgId,
            AttendanceDate: $scope.Date
        }).success(function (data) {
            debugger;
            $scope.EmployeesList = {};
            $scope.BackupEmployeesList = $scope.EmployeesList = data;
        });
        $scope.dropvalueChange = function () {
            console.log($scope.dropdown.value);
            debugger;
            if ($scope.dropdown.value != "-1") {
                $scope.EmployeesList.forEach(function (e, i) {
                    e.isPresent = $scope.dropdown.value == "0" ? false : true;
                    $scope.BackupEmployeesList.filter(function (e2) {
                        return e2.Id == e.Id;
                    })[0].isPresent = e.isPresent;
                });
            }
        };
        $scope.searchTextChanged = function () {
            $scope.EmployeesList = $scope.BackupEmployeesList.filter(function (e) {
                return e.Name.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1;
            });
        }
        $scope.SubmittingAttendance = function () {
            debugger;
            $scope.EmployeesList;
            $http.post(host + '/EmployeeAttendance/AddManualEmployeeAttendance', {
                AttendaceObj: $scope.EmployeesList,
                dateAttendance: $scope.Date,
                OrgId: $scope.user.OrgId
            }).success(function (data) {
                debugger;
                if (data.status) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: 'Saved Successfully!'
                    });
                } else {

                    var alertPopup = $ionicPopup.alert({
                        title: 'Failed',
                        template: 'Error Occured!'
                    });
                }
            });
        };

    }
    ])
	.controller("enquiryFormCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", "$stateParams", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS, $stateParams) {
	    var OrgId = localStorage['selectedStudentOrgId'];
	    $scope.dropdown = {};
	    $scope.data = {};
	    $scope.lead = {};
	    $scope.reg = {};
	    debugger;
	    $scope.date = new Date();
	    $scope.data.DateOfBirth = $scope.date.toLocaleDateString();
	    $scope.setDateTime = function () {
	        var ipObj1 = {
	            callback: function (val) { //Mandatory
	                var date = new Date(val);
	                $scope.date = date;
	                $scope.data.DateOfBirth = date.toLocaleDateString();
	            },
	            inputDate: new Date(),
	            showTodayButton: true,
	            to: new Date(), //Optional
	            inputDate: new Date(), //Optional
	            mondayFirst: false, //Optional
	            closeOnSelect: false, //Optional
	            templateType: 'popup' //Optional
	        };
	        ionicDatePicker.openDatePicker(ipObj1);
	    };
	    $scope.data1 = {};
	    $scope.user = $CustomLS.getObject('LoginUser');
	    debugger;
	    $http.post(host + '/Attandance/getBatchAndCourse', {
	        OrgId: $scope.user.OrgId
	    }).success(function (data1) {
	        debugger;

	        $scope.Batchlist = data1.Batches;
	        $scope.CourseList = data1.Courses;
	    });

	    $scope.data2 = {};
	    $scope.user = $CustomLS.getObject('LoginUser');
	    debugger;
	    $http.post(host + '/LeadMgt/getLeadDetails', {
	        OrgId: $scope.user.OrgId,
	    }).success(function (data2) {
	        debugger;
	        $scope.Streamlist = data2.Streams;
	        $scope.AdmissionStatuslist = data2.AdmStatus;
	        $scope.EmployeeList = data2.EmployeesList;
	        $scope.OtherProgramList = data2.OtherPrograms;
	    });
	    debugger;
	    $scope.date = new Date();
	    $scope.lead.FollowupTime = $scope.date.toLocaleDateString();
	    $scope.setDateTime1 = function () {
	        var ipObj2 = {
	            callback: function (val) { //Mandatory
	                var date = new Date(val);
	                $scope.date = date;
	                $scope.lead.FollowupTime = date.toLocaleDateString();
	            },
	            inputDate: new Date(),
	            showTodayButton: true,
	            to: new Date(), //Optional
	            inputDate: new Date(), //Optional
	            mondayFirst: false, //Optional
	            closeOnSelect: false, //Optional
	            templateType: 'popup' //Optional
	        };
	        ionicDatePicker.openDatePicker(ipObj2);
	    };

	    $scope.LeadFormsubmit = function (data, reg, lead) {
	        debugger;
	        $http.post(host + '/LeadMgt/AddNewLead', {
	            student: $scope.data, registration: $scope.reg, LeadFollowUp: $scope.lead, OrgId: $scope.user.OrgId, EmployeeId: $scope.user.UserId
	        }).success(function (data) {
	            debugger;
	            if (data.status) {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Success',
	                    template: 'Saved Successfully!'
	                });
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Failed',
	                    template: 'Error Occured!'
	                });
	            }
	        });
	    };

	}
	])
	.controller("transportFacilityCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    var studentId = localStorage['selectedStudent'];
	    var OrgId = $CustomLS.getObject('selectedStudentOrgId');
	    $http.post(host + '/Transport/GetAllByStudent', {
	        StudentId: studentId,
	        OrgId: OrgId
	    }).success(function (data) {
	        debugger;
	        $scope.TransportDetail = data;
	        $scope.TransportDetail.PickupTime = new Date(data.PickupTime);
	        $scope.TransportDetail.DropTime = new Date(data.DropTime);
	    });
	}
	])
	.controller("hostelDetailsCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
	    debugger;
	    $http.get(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {

	        debugger;
	        console.log(res);
	        $scope.SubjectDetail = res.data;
	    });

	}
	])
	.controller("studentDetailsCtrl", ["$scope", "$state", "$http", '$CustomLS', '$ionicLoading', function ($scope, $state, $http, $CustomLS, $ionicLoading) {
	    var studentId = localStorage['selectedStudent'];
	    var OrgId = localStorage['selectedStudentOrgId'];
	    debugger;
	    $scope.imageUrl = host + "Student/StudentImage?Id=" + studentId;
	    $ionicLoading.show({
	        template: 'Loading student details...',
	        duration: 10000
	    });
	    $http.post(host + '/PersonalDetail/GetAllDetail', {
	        StudentId: studentId,
	        OrgId: OrgId
	    }).success(function (data) {
	        $scope.PersonalDetail = data;
	        $ionicLoading.hide();
	    });
	}
	])
	.controller("HomeWorkDetailsCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "$CustomLS", 'ionicDatePicker', function ($scope, $state, $filter, $http, $ionicPopup, $CustomLS, ionicDatePicker) {
	    var BatchId = localStorage['selectedStudentBatch'];
	    var CourseId = localStorage['selectedStudentCourse'];
	    var OrgId = localStorage['selectedStudentOrgId'];
	    $scope.date = new Date();
	    $scope.FormattedDate = $scope.date.toLocaleDateString();
	    $scope.setDateTime = function () {
	        var ipObj1 = {
	            callback: function (val) { //Mandatory
	                var date = new Date(val);
	                $scope.date = date;
	                $scope.FormattedDate = date.toLocaleDateString();
	            },
	            inputDate: new Date(),
	            showTodayButton: true,
	            to: new Date(), //Optional
	            inputDate: new Date(), //Optional
	            mondayFirst: false, //Optional
	            closeOnSelect: false, //Optional
	            templateType: 'popup' //Optional
	        };
	        ionicDatePicker.openDatePicker(ipObj1);
	    };

	    $scope.getHomework = function () {
	        $http.post(host + '/Homework/GetByDate', {
	            CourseId: CourseId,
	            BatchId: BatchId,
	            OrgId: OrgId,
	            Date: $scope.date
	        }).success(function (data) {
	            debugger;
	            $scope.HomeworkDetail = data;
	            $scope.HomeworkDetail.assignmentsList.forEach(function (value, index) {
	                console.log(value.Date);
	                value.Date = new Date(value.Date);
	                console.log(value, index);
	            })
	        })
	    };
	    $scope.getHomework();
	}
	])
	.controller("holidaysCtrl", ["$scope", "$state", "$http", '$CustomLS', '$ionicLoading', function ($scope, $state, $http, $CustomLS, $ionicLoading) {
	    var OrgId = localStorage['selectedStudentOrgId'];
	    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	    $scope.noHolidays = false;
	    $ionicLoading.show({
	        template: "Loading holidays..."
	    });

	    $http.post(host + '/Holiday/GetAll', {
	        OrgId: OrgId
	    }).success(function (data) {
	        $scope.noHolidays = data.length == 0;
	        $scope.HolidayDetail = [];
	        for (var i = 0; i < data.Holidays.length; i++) {
	            var tempMonthName = monthNames[new Date(data.Holidays[i].Date).getMonth()];
	            var tempMonthIndex = new Date(data.Holidays[i].Date).getMonth();
	            if (!$scope.HolidayDetail[tempMonthIndex]) {
	                $scope.HolidayDetail[tempMonthIndex] = {
	                    Index: tempMonthIndex,
	                    MonthName: tempMonthName,
	                    List: []
	                };
	            }
	            $scope.HolidayDetail[tempMonthIndex].List.push({
	                Date: new Date(data.Holidays[i].Date),
	                Name: data.Holidays[i].Name.trim()
	            });
	        }
	        //$scope.HolidayDetail = data;
	        $ionicLoading.hide();
	    });
	}
	])
	.controller("MessageBoxCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $CustomLS, $ionicLoading) {
	    var OrgId = localStorage['selectedStudentOrgId'];
	    var studentId = localStorage['selectedStudent'];
	    var index = 0, count = 10;
	    $scope.data = {
	        loadingComplete: false
	    };
	    $scope.MessageContents = [];

	    $scope.doRefresh = function () {
	        count = $scope.MessageContents.length;
	        index = 0;
	        $scope.MessageContents = [];
	        $scope.loadMessages();
	        count = 10;
	    };

	    $scope.loadMessages = function () {
	        $ionicLoading.show({
	            template: '<p>Loading Messages...</p><ion-spinner></ion-spinner>',
	            duration: 10000
	        });
	        $http.post(host + '/MessageBox/getStudentMessage', {
	            StudentId: studentId,
	            OrgId: OrgId,
	            Index: index,
	            Count: count
	        }).success(function (data) {
	            if (data.length == 0) {
	                $scope.data.hide = true;
	            }
	            else {
	                $scope.data.hide = false;
	                $scope.MessageContents = $scope.MessageContents.concat(data);
	                $scope.MessageContents.sort(function (a, b) {
	                    return new Date(b.CreatedOn) - new Date(a.CreatedOn);
	                });
	                index = $scope.MessageContents.length + 1;
	                if (localStorage["Message"] && $scope.MessageContents && $scope.MessageContents.length > 0) {
	                    $state.go('messageShow', { data: $scope.MessageContents[0] });
	                }
	            }
	            $ionicLoading.hide();
	        });
	    };
	    $scope.loadMessages();

	    $scope.showMessage = function (message) {
	        $state.go('messageShow', { data: message });
	    };
	}
	])
    .controller("messageShowCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$cordovaToast", "$ionicLoading", function ($scope, $state, $http, $CustomLS, $stateParams, $cordovaToast, $ionicLoading) {
        $scope.data = $stateParams.data;
        if (localStorage["Message"]) {
            localStorage["Message"] = "";
        }
        $scope.data.disabled = !!$scope.data.Response;
        $scope.submitResponse = function () {
            if (!$scope.data.Response) {
                $cordovaToast.showShortCenter('Response can not be empty!');
            }
            else {
                $ionicLoading.show({ template: 'Saving response.', duration: 10000 });
                $http.post(host + '/MessageBox/SaveMessageBoxResponse', { MessageId: $scope.data.Id, Response: $scope.data.Response }).success(function (data) {
                    if (data.Status)
                    {
                        $scope.data.disabled = true;
                    }
                    $cordovaToast.showShortCenter(!data.Message ? 'Unable to save the response!' : data.Message);
                    $ionicLoading.hide();
                });
            }
        }
    }])
	.controller("TimeTableCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    $scope.periodData = {
	        WeekdayTimeTables: []
	    }
	    var BatchId = localStorage['selectedStudentBatch'];
	    var CourseId = localStorage['selectedStudentCourse'];
	    var OrgId = localStorage['selectedStudentOrgId'];
	    $scope.loadMore = function () {
	        $http.post('/more-items').success(function (items) {
	            useItems(items);
	            $scope.$broadcast('scroll.infiniteScrollComplete');
	        });
	    };

	    $http.post(host + '/Timetable/GetByCourse', {
	        BatchId: BatchId,
	        CourseId: CourseId,
	        OrgId: OrgId
	    }).success(function (data) {
	        debugger;
	        if (!data.WeekdayTimeTables) { }
	        else {
	            $scope.periodData = data;
	            $scope.periodData.WeekdayTimeTables.forEach(function (value, index) {
	                value.Periods.forEach(function (value2, index2) {
	                    console.log(value2.StartTime);
	                    console.log(value2.EndTime);
	                    value2.StartTime = new Date(value2.StartTime);
	                    value2.EndTime = new Date(value2.EndTime);
	                });
	                console.log(index, value);
	            });
	        }
	    });
	}
	])
	.controller("examinationDetailsCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    var BatchId = localStorage['selectedStudentBatch'];
	    var CourseId = localStorage['selectedStudentCourse'];
	    var OrgId = localStorage['selectedStudentOrgId'];
	    $http.post(host + '/Exam/GetByCourse', {
	        BatchId: BatchId,
	        CourseId: CourseId,
	        OrgId: OrgId
	    }).success(function (data) {
	        $scope.examinationDetail = data;
	    });
	}
	])
	.controller("TeacherDetailsCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    var studentId = localStorage['selectedStudent'];
	    $http.post(host + '/Faculty/GetFaculty', {
	        StudentId: studentId
	    }).success(function (data) {
	        debugger;
	        $scope.TeacherDetail = data;
	    });
	}
	])
	.controller("assesmentReportCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
	    var studentId = localStorage['selectedStudent'];
	    $scope.assesmentDetails = {};
	    var OrgId = localStorage['selectedStudentOrgId'];
	    $http.post(host + '/AssesmentReport/GetByStudent', {
	        StudentId: studentId,
	        OrgId: OrgId
	    }).success(function (data) {
	        debugger;
	        $scope.assesmentReportDetail = data;
	        data.Reports.forEach(function (e) {
	            if (!$scope.assesmentDetails[e.Examtype]) {
	                $scope.assesmentDetails[e.Examtype] = [];
	            }
	            $scope.assesmentDetails[e.Examtype].push({
	                'Marks': e.Marks,
	                'SubjectName': e.SubjectName
	            });
	        });
	    })
	}
	])
	.controller("EmployeeProfileCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $CustomLS, $ionicLoading) {
	    $scope.user = $CustomLS.getObject('LoginUser');
	    var EmpId = $scope.user.UserId;
	    $scope.imageUrl = host + "PersonalDetail/getEmployeeImage?Id=" + EmpId;
	    $ionicLoading.show({
	        template: 'Loading Personal Details..',
	        duration: 10000
	    });
	    $http.post(host + '/PersonalDetail/GetEmployeeDetail', {
	        'EmployeeId': $scope.user.UserId,
	        'OrgId': $scope.user.OrgId
	    }).success(function (data) {
	        $scope.Details = data;
	        $ionicLoading.hide();
	    })
	}
	])
    .controller("EmployeeGalleryGridCtrl", ["$scope", "$state", "$http", "$ionicLoading", "$cordovaToast", "$stateParams", "$CustomLS", function ($scope, $state, $http, $ionicLoading, $cordovaToast, $stateParams, $CustomLS) {
        $scope.data = {
            BatchId: $stateParams.BatchId,
            CourseId: $stateParams.CourseId
        };
        $scope.selectionEnable = false;
        $scope.host = host;
        var gridWidth = 3;
        $scope.grid = [];
        $scope.ImageList = [];

        $scope.user = $CustomLS.getObject('LoginUser');

        $scope.showImage = function (row) {
            if ($scope.selectionEnable) {
                row.selected = !row.selected;
                if (!$scope.grid.find(function (e) { return e.selected; }))
                    $scope.selectionEnable = false;
                return;
            }
            PhotoViewer.show(row.url.replace("IsThumbnail=true&", ""), "", {
                share: true
            });
        };

        $scope.deselectAll = function () {
            $scope.grid.forEach(function (ele) {
                ele.selected = false;
            });
            $scope.selectionEnable = false;
        };
        $scope.selectAll = function () {
            $scope.grid.forEach(function (ele) {
                ele.selected = true;
            });
            $scope.selectionEnable = true;
        };
        $scope.deleteSelected = function () {
            var deleteList = $scope.grid.filter(function (e1) { return e1.selected; }).map(function (e) {
                return parseInt(e.Id);
            });
            navigator.notification.confirm('Are you sure you want to delete ' + deleteList.length + ' image(s)!', function (result) {
                if (result == 1) {
                    $ionicLoading.show({
                        template: "Deleting Images...",
                        duration: 10000
                    });
                    $http.post(host + 'Gallery/DeleteImage', {
                        PhotoId: deleteList, OrgId: $scope.user.OrgId
                    }).success(function (data) {
                        $ionicLoading.hide();
                        if (data.length == 0) {
                            $cordovaToast.showShortCenter('Image(s) deleted successfully.');
                        }
                        else {
                            $cordovaToast.showShortCenter('Unable to delete ' + data.length + ' image(s)!');
                        }
                        if (deleteList.length != data.length) {
                            $scope.loadImages();
                        }
                        $scope.selectionEnable = false;
                    });
                }
            }, 'Confirm Delete', ['Yes, Proceed', 'Cancel']);
        };

        $scope.onHold = function (row) {
            row.selected = true;
            $scope.selectionEnable = true;
        };

        $scope.loadImages = function () {
            $ionicLoading.show({
                template: "Loading Gallery...",
                duration: 10000
            });
            $http.post(host + 'Gallery/ImageList', {
                BatchId: $stateParams.BatchId, CourseId: $stateParams.CourseId, OrgId: $scope.user.OrgId
            }).success(function (data) {
                $scope.ImageList = data;
                $scope.grid = [];
                for (var i = 0; i < data.length; i++) {
                    $scope.grid.push({
                        url: host + 'Gallery/DownloadImage?IsThumbnail=true&Id=' + data[i].Id, Id: data[i].Id
                    });
                }
                $ionicLoading.hide();
            });
        };

        $scope.loadImages();
    }])
    .controller("ParentGalleryGridCtrl", ["$scope", "$state", "$http", "$ionicLoading", "$cordovaToast", "$stateParams", "$CustomLS", function ($scope, $state, $http, $ionicLoading, $cordovaToast, $stateParams, $CustomLS) {
        $scope.grid = [];
        $scope.currentStudent = $CustomLS.getObject('currentStudents').find(function (ele) {
            return ele.Id == localStorage['selectedStudent'];
        });
        $scope.showImage = function (row) {
            PhotoViewer.show(row.url.replace("IsThumbnail=true&", ""), "", {
                share: true
            });
        };
        $scope.loadImages = function () {
            debugger;
            $ionicLoading.show({
                template: "Loading Gallery...",
                duration: 10000
            });
            $http.post(host + 'Gallery/ImageList', {
                BatchId: $scope.currentStudent.Batch, CourseId: $scope.currentStudent.Course, OrgId: $scope.currentStudent.OrgId
            }).success(function (data) {
                $scope.grid = [];
                for (var i = 0; i < data.length; i++) {
                    $scope.grid.push({
                        url: host + 'Gallery/DownloadImage?IsThumbnail=true&Id=' + data[i].Id, Id: data[i].Id
                    });
                }
                $ionicLoading.hide();
            });
        };
        $scope.loadImages();
    }])
	.controller("EmployeeGalleryCtrl", ["$scope", "$state", "$http", "$ionicPopup", "$ionicLoading", "$CustomLS", "$cordovaCamera", "$cordovaToast",
        function ($scope, $state, $http, $ionicPopup, $ionicLoading, $CustomLS, $cordovaCamera, $cordovaToast) {
            $scope.options = {};
            $scope.images = [];
            $scope.data = {};
            $scope.selected = {};
            $scope.user = $CustomLS.getObject('LoginUser');
            $scope.addNewImage = function () {
                if (!$scope.selected.Batch || !$scope.selected.Course) {
                    $cordovaToast.showShortCenter('Batch and Course required!');
                    return;
                }
                var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                    allowEdit: false
                };
                $cordovaCamera.getPicture(options).then(function (imageData) {
                    $scope.imageData = imageData;
                    var opt = new FileUploadOptions();
                    opt.fileKey = "image_file";
                    opt.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
                    opt.mimeType = "image/jpeg";
                    opt.params = {
                        BatchId: $scope.selected.Batch,
                        CourseId: $scope.selected.Course,
                        OrgId: $scope.user.OrgId,
                        EmpId: $scope.user.UserId
                    };
                    var authData = localStorage['LoginToken'];
                    opt.headers = {
                        "Token": authData
                    };

                    var ft = new FileTransfer();
                    ft.onprogress = function (progressEvent) {
                        $ionicLoading.hide();
                        var percent = parseInt((parseInt(progressEvent.loaded) / parseInt(progressEvent.total)) * 100);
                        $ionicLoading.show({
                            template: 'Uploading Image [ ' + parseInt(parseInt(progressEvent.loaded) / 1024) + 'KB/' + parseInt(parseInt(progressEvent.total) / 1024) + 'KB (' + percent + "%)]",
                            duration: 5000
                        });
                    };

                    $ionicLoading.show({
                        template: 'Uploading Image',
                        duration: 2000
                    });

                    ft.upload(imageData, encodeURI(host + "/Gallery/UploadImage"),
                        function (res) {
                            $ionicLoading.hide();
                            $cordovaToast.showShortCenter('Image uploaded successfully.');
                        },
                        function (err) {
                            $cordovaToast.showShortCenter('Failed to upload an Image!');
                            $ionicLoading.hide();
                        }, opt);

                }, function (err) {
                    $cordovaToast.showShortCenter('Failed to get an Image from gallery!');
                });
            };
            $scope.showGallery = function () {
                if (!$scope.selected.Batch || !$scope.selected.Course) {
                    $cordovaToast.showShortCenter('Batch and Course required!');
                    return;
                }
                $state.go('EmployeeGalleryGrid', {
                    BatchId: $scope.selected.Batch, CourseId: $scope.selected.Course
                });
            }
            $ionicLoading.show({
                template: "Loading Batch and Course...",
                duration: 10000
            });
            $http.post(host + '/Attandance/getBatchAndCourse', {
                OrgId: $scope.user.OrgId
            }).success(function (data) {
                $scope.Batchlist = data.Batches;
                $scope.CourseList = data.Courses;
                $ionicLoading.hide();
            });
        }])
	.controller("EmployeeHolidaysCtrl", ["$scope", "$state", "$http", "$CustomLS", '$ionicLoading', function ($scope, $state, $http, $CustomLS, $ionicLoading) {
	    $scope.user = $CustomLS.getObject('LoginUser');
	    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	    $scope.noHolidays = false;
	    $scope.HolidayDetail = [];
	    $ionicLoading.show({
	        template: "Loading holidays..."
	    });
	    $http.post(host + '/Holiday/GetEmployeeHolidays', {
	        'OrgId': $scope.user.OrgId
	    }).success(function (data) {
	        $scope.noHolidays = data.length == 0;
	        $scope.HolidayDetail = [];
	        for (var i = 0; i < data.Holidays.length; i++) {
	            var tempMonthName = monthNames[new Date(data.Holidays[i].Date).getMonth()];
	            var tempMonthIndex = new Date(data.Holidays[i].Date).getMonth();
	            if (!$scope.HolidayDetail[tempMonthIndex]) {
	                $scope.HolidayDetail[tempMonthIndex] = {
	                    Index: tempMonthIndex,
	                    MonthName: tempMonthName,
	                    List: []
	                };
	            }
	            $scope.HolidayDetail[tempMonthIndex].List.push({
	                Date: new Date(data.Holidays[i].Date),
	                Name: data.Holidays[i].Name.trim()
	            });
	        }
	        //$scope.HolidayDetail = data;
	        $ionicLoading.hide();
	    });
	}])
	.controller("EmployeeSettingsCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $ionicPopup) {
	    $scope.AppCurrentVersion = localStorage['AppCurrentVersion'];
	    $scope.AppToken = localStorage['token'];
	    $scope.Employeelogout = function () {
	        localStorage.clear();
	        location.reload();
	        $state.go('login');
	    };
	    $scope.NewVersionData = {};
	    $scope.checkForUpdate = function () {
	        debugger;
	        $http.get(host + 'AppManager/GetLatestVersion').success(function (data) {
	            debugger;
	            $scope.NewVersionData = data;
	            $scope.NewVersionData.Url = host + "AppManager/PatashalaApp";
	            console.log(data);
	            var version = localStorage['AppCurrentVersion'];
	            if (data.Version.trim() != version.trim()) {
	                $ionicPopup.alert({
	                    title: 'New Update Available!',
	                    template: "<strong>New Version : </strong> {{NewVersionData.Version}} <br />  <a href=\"#\" onclick=\"window.open('" + $scope.NewVersionData.Url + "', '_system', 'location=yes'); return false;\"> Get from here</a><br /> {{NewVersionData.UpdateMessage}}",
	                    scope: $scope
	                });
	            }
	            else {
	                $ionicPopup.alert({
	                    title: 'App is up to date.',
	                    template: "<strong>Great! You are using the latest Version.",
	                    scope: $scope
	                });
	            }
	        });
	    }
	}
	])
	.controller("profileCtrl", ["$scope", "$state", function ($scope, $state, $http) {
	}
	])
	.controller("signoutCtrl", ["$scope", "$state", function ($scope, $state, $http) {
	}
	])
	.controller("GeolocationCtrl", ["$scope", "$state", "$http", "$interval", "$CustomLS", "$cordovaToast", "$ionicLoading", function ($scope, $state, $http, $interval, $CustomLS, $cordovaToast, $ionicLoading) {
	    $scope.Button = {
	        Text: "Start Location Update",
	        LocationUpdate: localStorage['locationUpdate'] == "true"
	    };
	    $scope.Routes = [];
	    $scope.data = {
	        code: localStorage['locationUpdateRouteCode']
	    };
	    $scope.user = $CustomLS.getObject('LoginUser');
	    $http.post(host + '/GeoLocation/GetRouteCode', {
	        'OrgId': $scope.user.OrgId
	    }).success(function (data) { $scope.RouteCode = data; });
	    var bgGeo = null;


	    $scope.callbackFn = function (location, taskId) {
	        var coords = location.coords;
	        var lat = coords.latitude;
	        var lng = coords.longitude;
	        $cordovaToast.showShortCenter('Location' + JSON.stringify(location));
	        bgGeo.finish(taskId);
	        $http.get(host + 'GeoLocation/UpdateRouteLocation?RouteCode=' + $scope.data.code + '&OrgId=' + $scope.user.OrgId + '&Lattitude=' + lat + '&Longitude=' + lng)
            .success(function (data) {
                $cordovaToast.showShortCenter('location updated');
            }).error(function (err) {
                $cordovaToast.showShortCenter('error updating location');
                alert('error updating location-' + JSON.stringify(err));
            });
	    };

	    $scope.failureFn = function (errorCode) {
	        console.warn('BackgroundGeoLocation error:', errorCode);
	    }

	    document.addEventListener("deviceready", function () {
	        bgGeo = window.BackgroundGeolocation;
	        bgGeo.on('location', $scope.callbackFn, $scope.failureFn);
	        bgGeo.on('motionchange', function (isMoving) {
	            $cordovaToast.showShortCenter('onMotionChange' + isMoving);
	        });
	        bgGeo.on('geofence', function (geofence) {
	            $cordovaToast.showShortCenter('onGeofence' + geofence.identifier + geofence.location);
	        });
	        bgGeo.on('http', function (response) {
	            $cordovaToast.showShortCenter('http success: ' + response.responseText);
	        }, function (response) {
	            $cordovaToast.showShortCenter('http failure: ' + response.status);
	        });
	        bgGeo.configure({
	            desiredAccuracy: 0,
	            distanceFilter: 0,
	            stationaryRadius: 25,
	            activityRecognitionInterval: 3000,
	            fastestLocationUpdateInterval: 30000,
	            locationUpdateInterval: 3000,
	            stopTimeout: 5,
	            debug: true,
	            stopOnTerminate: false,
	            startOnBoot: true,
	            maxDaysToPersist: 3,
	        }, function (state) {
	            $cordovaToast.showShortCenter('Background Geolocation ready : ' + state.enabled);
	            $scope.GL = bgGeo;
	        });
	    }, false);

	    $scope.StartUpdateLocation = function () {
	        if (isNaN($scope.data.code)) {
	            $cordovaToast.showShortCenter('Select the Route Code');
	            localStorage["locationUpdate"] = "false";
	            $scope.Button.LocationUpdate = false;
	            return;
	        }
	        if (!bgGeo) {
	            $cordovaToast.showShortCenter('Background Geolocation is not ready. Please wait...');
	            return;
	        }
	        if ($scope.Button.LocationUpdate) {
	            $ionicLoading.show({ template: 'Enabling Geo-location tracking...', duration: 10000 });
	            bgGeo.start();
	            $ionicLoading.hide();
	            localStorage["locationUpdate"] = "true";
	            localStorage['locationUpdateRouteCode'] = $scope.data.code;
	            $cordovaToast.showShortCenter('Background geolocation Enabled.');
	        }
	        else {
	            $ionicLoading.show({ template: 'Disabling Geo-location tracking...', duration: 10000 });
	            bgGeo.stop();
	            $ionicLoading.hide();
	            localStorage["locationUpdate"] = "false";
	            $cordovaToast.showShortCenter('Background geolocation disabled.');
	        }
	    };

	    $scope.Route = $scope.data.code;

	    $scope.getGLStatus = function () {
	        bgGeo.getState(function (state) {
	            $cordovaToast.showShortCenter('Status:' + JSON.stringify(state));
	        });
	    };
	}
	])
	.controller("StudentBarcodeAttendanceCtrl", ["$scope", "$state", "$http", "$cordovaBarcodeScanner", "$CustomLS", "$ionicPopup", "$cordovaToast", function ($scope, $state, $http, $cordovaBarcodeScanner, $CustomLS, $ionicPopup, $cordovaToast) {
	    $scope.user = $CustomLS.getObject('LoginUser');
	    $scope.studentsList = [];
	    $http.post(host + '/Attandance/getStudentsList', {
	        'OrgId': $scope.user.OrgId
	    }).then(function (res) {
	        debugger;
	        console.log(res);
	        $scope.studentsList = res.data.AdmStudents;
	    })
	    $scope.scannedStudents = {
	        Id: [],
	        Name: [],
	        StudentId: []
	    }
	    $scope.data = {
	    }

	    $scope.DeleteCurrentRow = function (index) {
	        debugger;
	        var removedName = $scope.scannedStudents.Name.splice(index, 1);
	        $scope.scannedStudents.Id.splice(index, 1);
	        $scope.scannedStudents.StudentId.splice(index, 1);
	        $cordovaToast.showShortCenter(removedName + ' removed.');
	    }
	    $scope.scanBarCode = function () {
	        $cordovaBarcodeScanner.scan().then(function (imageData) {
	            var Id = imageData.text;
	            var found = false;
	            $scope.studentsList.forEach(function (value, index) {
	                if (value.StudentId == Id) {
	                    found = true;
	                    $scope.scannedStudents.Name.push(value.Name)
	                    $scope.scannedStudents.Id.push(value.Id)
	                    $scope.scannedStudents.StudentId.push(value.StudentId)
	                    $cordovaToast.showShortCenter('Student scanned successfully.');
	                }
	            });
	            if (!found)
	                $cordovaToast.showShortCenter('Invalid Student ID!');
	            localStorage.setItem(JSON.stringify($scope.scannedStudents.Name), JSON.stringify($scope.scannedStudents.Id));

	        }, function (error) {
	            console.log("An error happened -> " + error);
	            $cordovaToast.showLongCenter("An error happened -> " + error);
	        });
	    }
	    $scope.sendStudentsTimings = function () {
	        var pick = $scope.data.choice;
	        var jsonObj1 = $scope.scannedStudents.Id;
	        var jasonobj4 = localStorage.getItem(JSON.stringify($scope.scannedStudents.Name)).replace(']', '').replace('[', '');
	        $scope.date = new Date();
	        var jsonObj2 = JSON.stringify($scope.date);
	        $http.post(host + '/Attandance/SaveAttendance?OrgId=' + $scope.user.OrgId + '&StudentId=' + jasonobj4 + '&scanDateTime=' + $scope.date + '&IsCheckIn=' + pick).success(function (data) {
	            debugger;
	            if (data.status) {

	                var alertPopup = $ionicPopup.alert({
	                    title: 'Success',
	                    template: 'Saved Successfully!'
	                });
	                $state.go('Attendance');
	                $scope.scannedStudents = {
	                };
	            } else {
	                var alertPopup = $ionicPopup.alert({
	                    title: 'Failed',
	                    template: 'Error Occured!'
	                });
	            }
	        });
	    }
	}
	])
    .controller("EmployeeBarcodeAttendanceCtrl", ["$scope", "$state", "$http", "$cordovaBarcodeScanner", "$CustomLS", "$ionicPopup", "$ionicLoading", function ($scope, $state, $http, $cordovaBarcodeScanner, $CustomLS, $ionicPopup, $ionicLoading) {
        debugger;
        $ionicLoading.show({
            template: 'Loading Attendance...', duration: 3000
        });
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.EmployeesList = [];
        $http.post(host + '/EmpAttandance/getEmployeesList', { 'OrgId': $scope.user.OrgId }).then(function (res) {
            console.log(res);
            $scope.EmployeesList = res.data;
        })
        $scope.scannedEmployees = {
            Id: [],
            Name: [],
            EmployeeId: []
        }
        $scope.data = {
        }

        $scope.DeleteCurrentRow = function (index) {
            $scope.scannedEmployees.Name.splice(index, 1);
            $scope.scannedEmployees.Id.splice(index, 1);
        }
        $scope.scanBarCode = function () {
            $cordovaBarcodeScanner.scan().then(function (imageData) {
                var Id = imageData.text;
                $scope.EmployeesList.forEach(function (value, index) {
                    if (value.EmpId == Id) {
                        debugger;
                        $scope.scannedEmployees.Name.push(value.Name)
                        $scope.scannedEmployees.Id.push(value.Id)
                        $scope.scannedEmployees.EmployeeId.push(value.EmpId)
                    }
                })
                localStorage.setItem(JSON.stringify($scope.scannedEmployees.Name), JSON.stringify($scope.scannedEmployees.Id));

            }, function (error) {
                console.log("An error happened -> " + error);
                $ionicLoading.hide();
            });
        }
        $scope.sendEmployeesTimings = function () {
            debugger;
            var pick = $scope.data.choice;
            var jsonObj1 = $scope.scannedEmployees.Id;
            var jasonobj4 = localStorage.getItem(JSON.stringify($scope.scannedEmployees.Name)).replace(']', '').replace('[', '');
            $scope.date = new Date();
            var jsonObj2 = JSON.stringify($scope.date);
            $http.post(host + '/EmpAttandance/SaveEmployeeAttendance', {
                'OrgId': $scope.user.OrgId, 'EmpId': $scope.scannedEmployees.Id, 'scanDateTime': $scope.date, 'IsCheckIn': pick
            }).success(function (data) {
                debugger;
                if (data.status) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: 'Saved Successfully!'
                    });
                    $state.go('EmployeeBarcodeAttendance');
                    $scope.scannedEmployees = {
                    };
                }
                else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Failed',
                        template: 'Error Occured!'
                    });
                }
            });
        }
    }])
    .controller("employeeDiaryReportCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

        $scope.selected = {}
        $scope.user = $CustomLS.getObject('LoginUser');
        debugger;
        $http.post(host + '/Attandance/getBatchAndCourse', {
            OrgId: $scope.user.OrgId
        }).success(function (data) {
            debugger;
            $scope.Batchlist = data.Batches;
            $scope.CourseList = data.Courses;
        });

        $scope.date = new Date();
        $scope.FormattedDate = $scope.date.toLocaleDateString();
        $scope.setDateTime = function () {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    var date = new Date(val);
                    $scope.date = date;
                    $scope.FormattedDate = date.toLocaleDateString();
                },
                inputDate: new Date(),
                showTodayButton: true,
                to: new Date(), //Optional
                inputDate: new Date(), //Optional
                mondayFirst: false, //Optional
                closeOnSelect: false, //Optional
                templateType: 'popup' //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        $scope.GiveStudentsList = function () {
            debugger;
            $state.go('NextEmployeeDiaryReport', {
                BatchId: $scope.selected.Batch,
                CourseId: $scope.selected.Course,
                Date: $scope.date
            });
        };
    }
    ])
    .controller("nextEmployeeDiaryReportCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $stateParams, $ionicPopup) {
        debugger;
        $scope.dropdownValues = [{
            Name: 'Present',
            Id: true
        }, {
            Name: 'Absent',
            Id: false
        }
        ]
        $scope.dropdown = {};
        $scope.data = {};
        $scope.BackupStudentsList = {};
        $scope.comments = {};
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.BatchId = $stateParams.BatchId;
        $scope.CourseId = $stateParams.CourseId;
        $scope.Date = $stateParams.Date;
        $http.post(host + '/Attandance/getStudentsBasedOnFiler', {
            BatchId: $scope.BatchId,
            CourseId: $scope.CourseId,
            OrgId: $scope.user.OrgId,
            AttendanceDate: $scope.Date
        }).success(function (data) {
            debugger;
            $scope.StudentsList = {};
            $scope.BackupStudentsList = $scope.StudentsList = data;
        });
        $scope.dropvalueChange = function () {
            console.log($scope.dropdown.value);
            debugger;
            if ($scope.dropdown.value != "-1") {
                $scope.StudentsList.forEach(function (e, i) {
                    e.isPresent = $scope.dropdown.value == "0" ? false : true;
                    $scope.BackupStudentsList.filter(function (e2) {
                        return e2.Id == e.Id;
                    })[0].isPresent = e.isPresent;
                });
            }
        };
        $scope.searchTextChanged = function () {
            $scope.StudentsList = $scope.BackupStudentsList.filter(function (e) {
                return e.StudentName.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1;
            });
        }
        $scope.SubmittingDairy = function () {
            debugger;
            $scope.StudentsList;
            $http.post(host + 'Diary/AddDailyDiaryReport', {
                AttendaceObj: $scope.StudentsList,
                dateAttendance: $scope.Date,
                Comments: $scope.comments.DiaryNote,
                Title: $scope.comments.DiaryTitle,
                OrgId: $scope.user.OrgId,
                BatchId: $scope.BatchId,
                CourseId: $scope.CourseId
            }).success(function (data) {
                debugger;
                if (data.status) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: 'Saved Successfully!'
                    });
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Failed',
                        template: 'Error Occured!'
                    });
                }
            });
        };

    }
    ])
    .controller("parentDiaryReportCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
        debugger;
        $scope.currentStudent = $CustomLS.getObject('currentStudents').find(function (ele) {
            return ele.Id == localStorage['selectedStudent'];
        });
        $scope.Diary = [];
        $http.post(host + 'Diary/GetDiaryReport', {
            BatchId: $scope.currentStudent.Batch,
            CourseId: $scope.currentStudent.Course,
            OrgId: $scope.currentStudent.OrgId,
            StudentId: $scope.currentStudent.Id
        }).success(function (data) {
            debugger
            if (data.length == 0) {
            }
            else
                $scope.Diary = data;
        });

    }
    ])
    .controller("TrackInEmployeeCtrl", ["$scope", "$state", "$http", "$cordovaGeolocation", "$interval", "$CustomLS", function ($scope, $state, $http, $cordovaGeolocation, $interval, $CustomLS) {
        $scope.map = {};
        $scope.time = {
            timeToRefresh: 1000,
            refreshMessage: 'Please select the Route Code!',
            refreshInterval: 10000
        };
        debugger;
        $scope.Routes = [];
        $scope.data = {
        };
        debugger;
        $scope.user = $CustomLS.getObject('LoginUser');
        $http.post(host + '/GeoLocation/GetRouteCode', {
            'OrgId': $scope.user.OrgId
        }).success(function (data) {
            debugger;
            $scope.RouteCode = data;
        });
        $scope.routeChanged = function () {
            $scope.time.refreshMessage = "";
            $scope.getRouteLocation();
        };
        $scope.getRouteLocation = function () {
            $http.get(host + 'GeoLocation/ShowLocation?OrgId=' + localStorage['selectedStudentOrgId'] + '&Routecode=' + $scope.selected.Route).success(function (data) { //localStorage['selectedStudentOrgId']+, { OrgId: localStorage['selectedStudentOrgId'], Routecode: $scope.selected.Route }
                $scope.locationData = data;
                $scope.map.setCenter(new google.maps.LatLng(data.Latitude, data.Longitude));

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.Latitude, data.Longitude),
                    map: $scope.map,
                    title: 'Route No: ' + $scope.selected.Route
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open($scope.map, marker);
                });

            }).error(function (err) {
                $ionicLoading.hide();
                alert("Error Getting Location")
            });
        };

        var mapOptions = {
            center: new google.maps.LatLng(43.07493, -89.381388),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var timer;
        if (!timer) {
            timer = setInterval(function () {
                if ($scope.time.timeToRefresh >= $scope.time.refreshInterval) {
                    $scope.time.timeToRefresh = 0;
                    if ($scope.selected.Route) {
                        $scope.getRouteLocation();
                    }
                    console.log($scope.time.timeToRefresh);
                }
                $scope.time.timeToRefresh += $scope.time.refreshInterval;
                $scope.$apply();
            }, $scope.time.refreshInterval);
        }
    }
    ])
    .controller("TransportBarcodeAttendanceCtrl", ["$scope", "$state", "$http", "$cordovaBarcodeScanner", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $cordovaBarcodeScanner, $CustomLS, $ionicPopup) {
        $scope.user = $CustomLS.getObject('LoginUser');
        $scope.RouteCode = [];
        $scope.selected = {};
        $scope.studentsList = [];
        $http.post(host + '/Attandance/getStudentsList', {
            'OrgId': $scope.user.OrgId
        }).then(function (res) {
            console.log(res);
            $scope.studentsList = res.data.AdmStudents;
        })
        $http.post(host + '/GeoLocation/GetRouteCode', {
            'OrgId': $scope.user.OrgId
        }).success(function (data) {
            $scope.RouteCode = data;
        })
        $scope.scannedStudents = {
            Id: [],
            Name: [],
            StudentId: []
        }
        $scope.data = {
        }

        $scope.DeleteCurrentRow = function (index) {

            $scope.scannedStudents.Name.splice(index, 1);
            $scope.scannedStudents.Id.splice(index, 1);
        }
        $scope.scanBarCode = function () {
            $cordovaBarcodeScanner.scan().then(function (imageData) {
                var Id = imageData.text;
                $scope.studentsList.forEach(function (value, index) {
                    if (value.StudentId == Id) {
                        $scope.scannedStudents.Name.push(value.Name)
                        $scope.scannedStudents.Id.push(value.Id)
                        $scope.scannedStudents.StudentId.push(value.StudentId)
                    }
                })
                localStorage.setItem(JSON.stringify($scope.scannedStudents.Name), JSON.stringify($scope.scannedStudents.Id));

            }, function (error) {
                console.log("An error happened -> " + error);
            });
        }
        $scope.sendStudentsTimings = function () {
            debugger;
            //if (!$scope.selected.Route) {
            //    alert("Please select the Route Code!");
            //    return;
            //}
            var pick = $scope.data.choice;
            var Position = $scope.data.postion;
            var jsonObj1 = $scope.scannedStudents.Id;
            var jasonobj4 = localStorage.getItem(JSON.stringify($scope.scannedStudents.Name)).replace(']', '').replace('[', '');
            $scope.date = new Date();
            var jsonObj2 = JSON.stringify($scope.date);
            $http.post(host + '/Attandance/SaveTransport?OrgId=' + $scope.user.OrgId + '&StudentId=' + jasonobj4 + '&scanDateTime=' + $scope.date + '&IsPickUp=' + pick + '&Position=' + Position).success(function (data) {
                debugger;
                if (data.status) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: 'Saved Successfully!'
                    });
                    $state.go('barCodeScanner');
                    $scope.scannedStudents = {
                    };
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Failed',
                        template: 'Error Occured!'
                    });
                }
            });

            //var callbackFn = function (location) {
            //    $http.get(host + 'GeoLocation/UpdateRouteLocation?RouteCode=' + $scope.selected.Route + '&OrgId=' + $scope.user.OrgId + '&Lattitude=' + location.latitude + '&Longitude=' + location.longitude)
            //        .success(function (data) {
            //            alert('location updated');
            //        }).error(function () {
            //            alert('error updating location');
            //        });

            //    //alert('Location:' + location.latitude + ',' + location.longitude);
            //    backgroundGeolocation.finish();
            //};

            //var failureFn = function (error) {
            //    alert('BackgroundGeolocation error');
            //};

            //backgroundGeolocation.configure(callbackFn, failureFn, {
            //    desiredAccuracy: 100,
            //    stationaryRadius: 20,
            //    distanceFilter: 30,
            //    interval: 5000,
            //    //debug: true,
            //    //startOnBoot: true,
            //    //stopOnTerminate: false
            //});

            //if (pick) {
            //    backgroundGeolocation.start();
            //}
            //else {
            //    backgroundGeolocation.stop();
            //}
        }

    }
    ])
	.controller('debugCtrl', ['$scope', function ($scope) {
	    $scope.localstorageItems = [];
	    for (var key in localStorage) {
	        $scope.localstorageItems.push({
	            "Key": key,
	            "Value": localStorage[key]
	        });
	    }

	}
	])
	.controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
	    //public properties that define the error message and if an error is present
	    $scope.error = "";
	    $scope.activeError = false;

	    //function to dismiss an active error
	    $scope.dismissError = function () {
	        $scope.activeError = false;
	    };

	    //broadcast event to catch an error and display it in the error section
	    $scope.$on("error", function (evt, val) {
	        //set the error message and mark activeError to true
	        $scope.error = val;
	        $scope.activeError = true;

	        //stop any waiting indicators (including scroll refreshes)
	        myappService.wait(false);
	        $scope.$broadcast("scroll.refreshComplete");

	        //manually apply given the way this might bubble up async
	        $scope.$apply();
	    });
	}
	]);
})
();