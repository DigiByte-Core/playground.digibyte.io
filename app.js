'use strict';

var app = angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.address',
  'playApp.hdkeys',
  'playApp.transaction',
  'playApp.unspent',
  'playApp.multisig',
	'playApp.segwit'
]);

// Config
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/address'});
}]);
app.constant('digibyte', require('digibyte'));

// Filters
app.filter('btc', function(digibyte) {
  return function(satoshis) {
    return digibyte.Unit.fromSatoshis(satoshis).toBTC();
  };
})
.filter('permalink', function(digibyte) {
  return function(data, section) {
    var url = './#/' + section + '?data=' + encodeURI(data);
    if (url.length > 2083) throw new Error('URL too long')
    return url;
  };
})
.filter('ellipsify', function() {
  return function(data) {
    return data.substr(0, 4) + '...' + data.substr(data.length - 4, data.length);
  };
});

// Directives
app.directive('exampleCode', function() {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.exampleCode, function(value) {
        element.text(value);
        hljs.highlightBlock(element[0]);
      });
    }
  };
})
.directive('autoSelect', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).focus(function(){
        $(this).select();
      });
      element.attr('spellcheck', false);
    }
  };
})
.directive('requireTooltip', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('tooltip', 'reflow');
    }
  };
})
.directive('requireModal', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('reveal', 'reflow');
    }
  };
});

// Filters
function registerValidator(app, name, validator) {
  app.directive(name, function(digibyte) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
        function validate(value) {
          var valid = validator(digibyte, value, scope, attr);
          ngModel.$setValidity(null, valid);
          return value;
        }
        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.unshift(validate);
      }
    };
  });
}

registerValidator(app, 'privateKey', function(digibyte, value) {
  return digibyte.PrivateKey.isValid(value);
});
registerValidator(app, 'publicKey', function(digibyte, value) {
  return digibyte.PublicKey.isValid(value);
});
registerValidator(app, 'xprivateKey', function(digibyte, value) {
  return digibyte.HDPrivateKey.isValidSerialized(value);
});
registerValidator(app, 'xpublicKey', function(digibyte, value) {
  return digibyte.HDPublicKey.isValidSerialized(value);
});
registerValidator(app, 'privateHdpath', function(digibyte, value, scope) {
  return !!(/^[mM][']?(\/[0-9]+[']?)*[/]?$/.exec(value));
});
registerValidator(app, 'publicHdpath', function(digibyte, value, scope) {
  return !!(/^[mM](\/[0-9]+)*[/]?$/.exec(value));
});
registerValidator(app, 'address', function(digibyte, value) {
  return digibyte.Address.isValid(value);
});

// Sidebar
app.controller('SideBar', function($scope, $rootScope, $timeout, $location) {
  $timeout(function(){
    $rootScope.showFooter = true;
    $rootScope.$apply();
  }, 100);

  $scope.getClass = function(path) {
    return $location.path().substr(0, path.length) === path ? "current" : "";
  }

});