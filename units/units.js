'use strict';

angular.module('playApp.units', ['ngRoute'])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/units', {
      templateUrl: 'units/units.html',
      controller: 'UnitsCtrl'
    });
  }
])

.controller('UnitsCtrl', function($scope, $http, digibyte) {
  $scope.unit = {};
  $scope.currencies = [];
  $scope.currency = null;
  $scope.exampleCode = '';
  $scope.digibyteURL = 'https://digibyte.io/units';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#plain-text';

  function setExampleCode(value, code, fiat) {
    var template;
    var templates = {
      BTC: 'var unit = new digibyte.Unit.fromBTC(@value);',
    };

    if (templates[code]) {
      template = templates[code].replace('@value', value);
      template += '\nvar rate = @rate; // @fiat/DGB exchange rate';
    } else {
      template = 'var rate = @rate; // @fiat/DGB exchange rate\n';
      template += 'var unit = new digibyte.Unit.fromFiat(@value, rate);';
    }
    template = template.replace('@value', value);
    template = template.replace('@rate', fiat && fiat.rate);
    template = template.replace('@fiat', fiat && fiat.code);

    var rate = $scope.currency ? $scope.currency.rate : 0;
    template += "\nconsole.log('Units', unit.DGB, unit.atRate(rate));";
    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  $scope.updateUnit = function(value, code) {
    var unit = new digibyte.Unit(value, code);

    if (value === '' || isNaN(unit.satoshis)) {
      return; // TODO: mark as invalid
    }

    $scope.unit.BTC = unit.BTC;
    $scope.unit.mBTC = unit.mBTC;
    $scope.unit.bits = unit.bits;
    $scope.unit.satoshis = unit.satoshis;

    if (angular.isString(code)) {
      $scope.unit[code] = value;
      $scope.unit.fiat = $scope.currency ? unit.atRate($scope.currency.rate) : 0;
    }

    setExampleCode(value, code, $scope.currency);
  };

  $scope.updateFiat = function(value, rate) {
    $scope.updateUnit(value, rate.rate);
  };

  $scope.updateUnit(1, 'BTC');

  $http.get('https://bitpay.com/api/rates').
  success(function(rates) {
    $scope.currencies = rates.filter(function(rate) {
      return rate.code === 'USD' ||
        rate.code === 'EUR' ||
        rate.code === 'ARS' ||
        rate.code === 'GBP' ||
        rate.code === 'JPY' ||
        rate.code === 'CAD' ||
        rate.code === 'BRL' ||
        rate.code === 'CLP';

    });
    $scope.currency = rates[0];
    $scope.updateUnit(1, 'BTC');
  }).
  error(function() {
    console.log('Error while fetching exchange rates');
  });
});
