describe('DashboardCtrl', function() {
  // Load the module
  beforeEach(module('iLayers'));

  var ctrl, scope, layers, registryService, commandService, data;

  beforeEach(inject(function ($controller, $rootScope, $window, _registryService_, _commandService_) {
    scope = $rootScope.$new();

    registryService = _registryService_;
    commandService = _commandService_;

    ctrl = $controller('DashboardCtrl', {
      $scope: scope
    });

    var window = $window;
  }));

  it('should initialize graph', function() {
    expect(scope.graph.length).toEqual(0);
  });

  describe('buildTerms', function () {
    it('should add latest tag when empty', function() {
      var data = ctrl.buildTerms("foo");

      expect(data[0].tag).toEqual("latest");
      expect(data[0].name).toEqual("foo");
    });

    it('should return tag and name when provided', function() {
      var data = ctrl.buildTerms("foo:1.0.0");

      expect(data[0].tag).toEqual("1.0.0");
      expect(data[0].name).toEqual("foo");
    });

    it('should create terms for each image provided', function() {
      var data = ctrl.buildTerms("foo:1.0.0, baz:2.0.0");

      expect(data.length).toEqual(2);
      expect(angular
               .equals(data[0], { "name": "foo", "tag": "1.0.0" }))
               .toBeTruthy();
      expect(angular
               .equals(data[1], { "name": "baz", "tag": "2.0.0" }))
               .toBeTruthy();
    });
  });

  describe('detectMobile', function() {

    var setUserAgent = function(window, userAgent) {
      if (window.navigator.userAgent != userAgent) {
        var userAgentProp = { get: function () { return userAgent; } };
        window.navigator = Object.create(navigator, {
          userAgent: userAgentProp
        });
      }
    };

    afterEach(inject(function ($window){
      setUserAgent(window, $window.navigator.userAgent);
    }));

    it('should set $scope.mobile to false if the user agent string does not have mobile keywords', function (){
      setUserAgent(window, 'desktop');
      ctrl.detectMobile();
      expect(scope.mobile).toEqual(false);
    });

    it('should set $scope.mobile to true if the user agent is has the iPhone keyword', function (){
      setUserAgent(window, 'iPhone');
      ctrl.detectMobile();
      expect(scope.mobile).toEqual(true);
    });

    it('should set $scope.mobile to true if the user agent is has the android keyword', function (){
      setUserAgent(window, 'android');
      ctrl.detectMobile();
      expect(scope.mobile).toEqual(true);
    });
  });

  describe('searchImages', function() {

    beforeEach(inject(function($q) {
      deferredSuccess = $q.defer();
      spyOn(registryService, 'inspect').and.returnValue(deferredSuccess.promise);
    }));

    it('should do nothing when no images provided', function() {
      ctrl.searchImages({});
      expect(registryService.inspect).not.toHaveBeenCalled();
      deferredSuccess.resolve({data: {'repo': {}, 'layers': []}});
    });

    it('should call registryService with provided images', function() {
      ctrl.searchImages({'images': 'foo,bar:1.0.0'});
      deferredSuccess.resolve({data: {'repo': {}, 'layers': []}});
      expect(registryService.inspect).toHaveBeenCalledWith([{"name":"foo","tag":"latest"}, {"name":"bar","tag":"1.0.0"}]);
    });

    it('should set loading to true while calling registryService', function() {
      ctrl.searchImages({'images': 'foo,bar:1.0.0'});
      expect(scope.loading).toEqual(true);
    });

    it('should set loading to false after registry inspect success', function() {
      ctrl.searchImages({'images': 'foo,bar:1.0.0'});
      expect(scope.loading).toEqual(true);

      deferredSuccess.resolve({data: {'repo': {}, 'layers': []}});
      expect(registryService.inspect).toHaveBeenCalledWith([{"name":"foo","tag":"latest"}, {"name":"bar","tag":"1.0.0"}]);

      deferredSuccess.promise.then(function(){
        expect(scope.loading).toEqual(false);
      });
    });

    it('should not change the value of loading on error', function() {
      ctrl.searchImages({'images': 'foo,bar:1.0.0'});
      expect(scope.loading).toEqual(true);

      deferredSuccess.reject({data: {'repo': {}, 'layers': []}});
      expect(registryService.inspect).toHaveBeenCalledWith([{"name":"foo","tag":"latest"}, {"name":"bar","tag":"1.0.0"}]);

      deferredSuccess.promise.then(function(){},function(){
        expect(scope.loading).toEqual(true);
      });
    });
  });

  describe('applyFilters', function() {

    beforeEach(function(){
      data = [{ 'repo': { 'name': 'foo' } }, { 'repo': { 'name': 'bar' } }];
    });

    it('should remove repos with name matching filter', function() {
      var result = scope.applyFilters(data, 'foo');

      expect(result.length).toEqual(1);
      expect(result[0].repo.name).toEqual('foo');
    });
    
    it('should call commandService.release()', function() {
      spyOn(commandService,'release');
      scope.applyFilters(data, 'foo');
      scope.$digest();
      expect(commandService.release).toHaveBeenCalled();
    });
    
    it('should call commandService.lock()', function() {
      spyOn(commandService,'lock');
      scope.applyFilters(data, 'foo');
      scope.$digest();
      expect(commandService.lock).toHaveBeenCalledWith(undefined);
    });
  });
});
