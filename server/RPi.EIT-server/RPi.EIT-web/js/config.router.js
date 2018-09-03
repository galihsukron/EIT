'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
      }
  ])
  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
          $urlRouterProvider
              .otherwise('/home');

          $stateProvider
              .state('access', {
                  abstract: true,
                  url: '',
                  templateUrl: '',
              })
              // login dulu
              .state('access.login', {
                  url: '/login',
                  controller: 'SigninFormController',
                  templateUrl: 'tpl/login.html'
              })

              .state('app', {
                  abstract: true,
                  url: '',
                  templateUrl: 'tpl/app.html'
              })
              // navigation
              .state('app.dashboard', {
                  url: '/home',
                  templateUrl: 'tpl/raspieit/home.html',
                  resolve: {
                    deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/controllers/chart.js']);
                    }]
                  }
              })

              // algor
              .state('app.algor', {
                  url: '/algoritma',
                  template: '<div ui-view class="fade-in"></div>'
              })
              .state('app.algor.sub', {
                  url: '/:idalgor',
                  controller: 'AlgorCtrl',
                  templateUrl: 'tpl/raspieit/algoritma/algor.html',
                  resolve: {
                    deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/raspEIT/controllers/algoritma.js']);
                    }]
                  }
              })

              //data
              .state('app.data', {
                  url: '/data',
                  template: '<div ui-view></div>'
              })
              .state('app.data.coba', {
                  url: '/cobatabel',
                  controller: 'DataCtrl',
                  templateUrl: 'tpl/raspieit/data/footable.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function($ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function(){
                                 return $ocLazyLoad.load('js/raspEIT/controllers/dataukur.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.data.home', {
                  url: '/all',
                  controller: 'DataCtrl',
                  templateUrl: 'tpl/raspieit/data/dataukur.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function($ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function(){
                                 return $ocLazyLoad.load('js/raspEIT/controllers/dataukur.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.data.id', {
                  url: '/:idData',
                  templateUrl: 'tpl/raspieit/data/details.html',
                  controller: 'DetailDataCtrl',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad){
                          return uiLoad.load('js/raspEIT/controllers/dataukur.js');
                      }]
                  }
              })

              // image
              .state('app.reconstruction', {
                  url: '/reconstruction',
                  controller: 'ReconstructionCtrl',
                  templateUrl: 'tpl/raspieit/reconstruction.html',
                  resolve: {
                      deps: ['$ocLazyLoad', function( $ocLazyLoad){
                          return $ocLazyLoad.load('ui.select').then(
                              function(){
                                  return $ocLazyLoad.load('toaster').then(
                                      function(){
                                          return $ocLazyLoad.load('js/raspEIT/controllers/reconstruction.js')
                                      }
                                  );
                              }
                          );
                      }]
                  }
              })
              .state('app.realtime', {
                  url: '/realtime',
                  controller: 'RealtimeCtrl',
                  templateUrl: 'tpl/raspieit/realtime.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function($ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function(){
                                 return $ocLazyLoad.load('js/raspEIT/controllers/realtime.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.galeri', {
                  url: '/galeri',
                  controller: 'GalleryCtrl',
                  templateUrl: 'tpl/raspieit/gallery.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function() {
                                  return $ocLazyLoad.load('js/raspEIT/controllers/gallery.js');
                              }
                          );
                      }]
                  }
              })

              // EIT instrument
              .state('app.defaultsetting', {
                  url: '/setting',
                  controller: 'SettingCtrl',
                  templateUrl: 'tpl/raspieit/setting.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function() {
                                  return $ocLazyLoad.load('js/raspEIT/controllers/setting.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.perangkateit', {
                  url: '/perangkateit',
                  controller: 'PerangkatCtrl',
                  templateUrl: 'tpl/raspieit/perangkat.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function($ocLazyLoad){
                          return $ocLazyLoad.load('toaster').then(
                              function(){
                                 return $ocLazyLoad.load('js/raspEIT/controllers/perangkat.js');
                              }
                          );
                      }]
                  }
              })
              .state('app.shutdown', {
                  url: '/shutdown',
                  controller: 'ShutDownCtrl',
                  templateUrl: 'tpl/raspieit/shut-down.html'
              })
              // end routing-------------
      }
    ]
  );
