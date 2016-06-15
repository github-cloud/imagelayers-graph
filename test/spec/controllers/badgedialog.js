'use strict';

describe('Controller: BadgedialogCtrl', function () {

  // load the controller's module
  beforeEach(module('iLayers'));

  var controller,
    scope,
    graph,
    deferredSuccess,
    registryService;


    // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _registryService_) {
    scope = $rootScope.$new();
    registryService = _registryService_;
    controller = $controller('BadgeDialogCtrl', {
      $scope: scope
    });
  }));
  
  describe('$watch selectedWorkflow', function() {
    it('should initialze selectedImage to empty object', function() {
      scope.selectedImage = { name: 'boo' };
      scope.$digest();
      
      expect(scope.selectedImage.name).toEqual(undefined);
    });
  });
  
  describe('$watch selectedImage', function() {
    it('should set htmlCopied to false', function() {
      scope.htmlCopied = true;
      scope.selectedImage = { name: 'foo' };
      scope.$digest();
      
      expect(scope.htmlCopied).toBeFalsy();
    });
    
    it('should set markdownCopied to false', function() {
      scope.markdownCopied = true;
      scope.selectedImage = { name: 'foo' };
      
      expect(scope.markdownCopied).toBeTruthy();
      scope.$digest();
      
      expect(scope.markdownCopied).toBeFalsy();
    });
    
    describe('when workflow is imagelayers', function() {
      it('set selectedImage.selected = true', function() {
        scope.selectedWorkflow = 'imagelayers';
        scope.$digest();
        scope.selectedImage = { name: 'foo' };
        
        expect(scope.selectedImage.selected).toBeFalsy();
        scope.$digest();
        
        expect(scope.selectedImage.selected).toBeTruthy();
      })
    });
    
    describe('when workflow is hub', function() {
      it('set selectedImage.selected = false when missing', function() {
        scope.selectedWorkflow = 'hub';
        scope.$digest();
                
        scope.selectedImage = { name: 'foo', missing: true, selected: true };
        
        expect(scope.selectedImage.selected).toBeTruthy();
        scope.$digest();
        
        expect(scope.selectedImage.selected).toBeFalsy();
      })
    });
  });

  describe('$scope.imageList', function () {
    beforeEach(function () {
      scope.graph = [
        {
          repo: {name: 'myRepo', tag: 'latest'}
        },
        {
          repo: {name: 'myOtherRepo', tag: 'latest'}
        }
      ]
    });

    it('should return a list of images', function () {
      var list = scope.imageList();
      expect(list.length).toEqual(2);
      expect(list[0].name).toEqual('myRepo');
      expect(list[1].name).toEqual('myOtherRepo');
    });
  });

  describe('$scope.badgeAsHtml', function  () {
    it('should return an HTML embed code', function () {
      scope.selectedImage = { name: 'node' };
      var embedCode = scope.badgeAsHtml();
      expect(embedCode.$$unwrapTrustedValue()).toEqual("<a href='https://imagelayers.io/?images=node:latest' title='Get your own badge on imagelayers.io'><img src='https://badge.imagelayers.io/node.svg'></a>")
    });
  });

  describe('$scope.badgeAsMarkdown', function  () {
    it('should return an HTML embed code', function () {
      scope.selectedImage = { name: 'node' };
      var embedCode = scope.badgeAsMarkdown();
      expect(embedCode).toEqual("[![](https://badge.imagelayers.io/node.svg)](https://imagelayers.io/?images=node:latest 'Get your own badge on imagelayers.io')")
    });
  });
});
