var serviceBase = 'https://autoliquidables.1cero1.com/api/';
// var serviceBase = 'http://localhost:44365/api/';
// var serviceBase = 'http://192.168.20.166:1378/api/';
// var serviceBase = 'http://201.184.190.109:1377/apiautoliquidable/api/';


var app = angular.module('icaApp', []);
'use strict';
app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.customOnChange);
            element.bind('change', onChangeFunc);
        }
    };
});

app.directive('blurCurrency',function($filter){
    function link(scope, el, attrs, ngModelCtrl) {
        function formatter(value) {
            value = value ? parseFloat(value.toString().replace(/[^0-9._-]/g, '')) || 0 : 0;
            var formattedValue = $filter('currency')(value,"",0);
            el.val(formattedValue.replace('$',''));
            el.val(el.val().replace('.00', ''));
            ngModelCtrl.$setViewValue(value);
            //scope.$apply();
            return formattedValue.replace('.00', '');
        }

        ngModelCtrl.$formatters.push(formatter);
        el.bind('focus', function () {
            if (el.val() == '0.00') {
                el.val('');
            } else {
                el.val(el.val().replace(/,/gi, '').replace('.00', ''));
            }
        });
        el.bind('blur', function () {
            formatter(el.val().replace('.00', ''));
        });
    }
    return {
        require: '^ngModel',
        scope: true,
        link: link
    };
});

app.factory('icaService', ['$http', 'icaSettings', function ($http, icaSettings) {
    var serviceBase = icaSettings.apiServiceBaseUri;
    var icaServiceFactory = {};
    //Servicios
    var _getToken = function (data) {
        return $http.post(serviceBase + 'Login/Authenticate', data).then(function (results) {
            return results;
        });
    };
    var _getDataMunicipio = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data;
        return $http.get(serviceBase + 'Generales/DataMunicipio?codigoMunicipio=' + icaSettings.CodigoMunicipio).then(function (results) {
            return results;
        });
    };
    var _getDepartamentos = function () {
        return $http.get(serviceBase + 'Generales/GetDepartamentos').then(function (results) {
            return results;
        });
    };
	var _cleanDeclaracion = function (name) {
        return $http.get(serviceBase + 'Generales/RemovePDF?fileName=' + name).then(function (results) {
            return results;
        });
    };
    var _getContribuyente = function (documento) {
        return $http.get(serviceBase + 'Autoliquidables/GetContribuyentebyDoc?documento=' + documento).then(function (results) {
            return results;
        });
    };
    var _getActividades = function () {
        return $http.get(serviceBase + 'Autoliquidables/GetActividadesbyMunicipio?codigoMunicipio=' + icaSettings.CodigoMunicipio).then(function (results) {
            return results;
        });
    };
    var _getActividadesAnio = function (year) {
        return $http.get(serviceBase + 'Autoliquidables/GetActividadesXMunicipio?codigoMunicipio=' 
        + icaSettings.CodigoMunicipio  + '&year='+year).then(function (results) {
            return results;
        });
    };
    var _GuardarFormulario = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.post(serviceBase + 'Autoliquidables/GuardarFormulario', data).then(function (results) {
            return results;
        });
    };
    var _GuardarSolicitud = function (data) {
        //$http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.post(serviceBase /*"https://localhost:44365/api/"*/+ 'Solicitudes/CrearSolicitud', data).then(function (results) {
            return results;
        });
    };
    var _FijarFormulario = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.post(serviceBase + 'Autoliquidables/FijarFormulario', data).then(function (results) {
            return results;
        });
    };
    var _DescargarPDF = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.post(serviceBase + 'Generales/DownloadPDF', data).then(function (results) {
            return results;
        });
    };

    var _DescargarPDFYondo = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.post(serviceBase + 'Generales/DownloadPDFGasolina', data).then(function (results) {
            return results;
        });
    };

    var _PagarDeclaracion = function (data) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + data.Token;
        return $http.get(serviceBase + 'Autoliquidables/PagarDeclaracion', {
                params: {
                    idDeclaracion: data.Id,
                    codigoMunicipio: icaSettings.CodigoMunicipio,
                    mobile: icaSettings.mobile?true:false,
                    url: "www.google.com" //window.location.host
                }
            })
            .then(function (results) {
                return results;
            });
    };
    //Funciones
    var _dateDiff=function (fecha1, fecha2) {
        return ((fecha1.getMonth() + 12 * fecha1.getFullYear()) - (fecha2.getMonth() + 12 * fecha2.getFullYear()));
    }
    var _formatNum = function (num) {
        return (num.toString()+"00").replace(/\D/g, "")
            .replace(/([0-9])([0-9]{2})$/, '$1')
            .replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ",");
    }
    var _number = function (elem) {
        var charCode = (elem.which) ? elem.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }
    var _letter = function (elem) {
        var inputValue = (elem.which) ? elem.which : event.keyCode;
        if(!(inputValue >= 65 && inputValue <= 123)) {
            event.preventDefault();
        }
        return true;
    }
    var _letterWith = function (elem) {
        var inputValue = (elem.which) ? elem.which : event.keyCode;
        if(!(inputValue >= 65 && inputValue <= 123) && (inputValue != 32 && inputValue != 0)) {
            event.preventDefault();
        }
        return true;
    }
    var _resize = function (elem) {
        if($(window).width()<640){
            $("#ico")[0].hidden=true;
            $("#icoSmall")[0].hidden=false;
        }else{
            $("#icoSmall")[0].hidden=true;
            $("#ico")[0].hidden=false;
        }
    }
    var _bimestre=function(idmes){
        switch(idmes){
            case 0:
                return 'Nov-Dic';
            case 1:
                return 'Nov-Dic';
            case 2:
                return 'Ene-Feb';
            case 3:
                return 'Ene-Feb';
            case 4:
                return 'Mar-Abr';
            case 5:
                return 'Mar-Abr';
            case 6:
                return 'May-Jun';
            case 7:
                return 'May-Jun';
            case 8:
                return 'Jul-Ago';
            case 9:
                return 'Jul-Ago';
            case 10:
                return 'Sep-Oct';
            default:
                return 'Sep-Oct';
        }
    }

    var _mes=function(idmes){
        switch(idmes){
            case 0:
                return 'Enero';
            case 1:
                return 'Febrero';
            case 2:
                return 'Marzo';
            case 3:
                return 'Abril';
            case 4:
                return 'Mayo';
            case 5:
                return 'Junio';
            case 6:
                return 'Julio';
            case 7:
                return 'Agosto';
            case 8:
                return 'Septiembre';
            case 9:
                return 'Octubre';
            case 10:
                return 'Noviembre';
            default:
                return 'Diciembre';
        }
    }
    var _maxReteIca=function(mes,anio){
        let dia=15;
        switch(mes){
            case 'Enero':
                return new Date(parseInt(anio),1,dia);
            case 'Febrero':
                return new Date(parseInt(anio),2,dia);
            case 'Marzo':
                return new Date(parseInt(anio),3,dia);
            case 'Abril':
                return new Date(parseInt(anio),4,dia);
            case 'Mayo':
                return new Date(parseInt(anio),5,dia);
            case 'Junio':
                return new Date(parseInt(anio),6,dia);
            case 'Julio':
                return new Date(parseInt(anio),7,dia);
            case 'Agosto':
                return new Date(parseInt(anio),8,dia);
            case 'Septiembre':
                return new Date(parseInt(anio),9,dia);
            case 'Octubre':
                return new Date(parseInt(anio),10,dia);
            case 'Noviembre':
                return new Date(parseInt(anio),11,dia);
            default:
                return new Date(parseInt(anio)+1,0,dia);
        }
    }
    var _round=function (value){
        return Math.round((value) / 1000) * 1000;
    }

    icaServiceFactory.dateDiff = _dateDiff;
    icaServiceFactory.formatNum = _formatNum;
    icaServiceFactory.number = _number;
    icaServiceFactory.letter = _letter;
    icaServiceFactory.letterWith = _letterWith;
    icaServiceFactory.getToken = _getToken;
    icaServiceFactory.getDataMunicipio = _getDataMunicipio;
    icaServiceFactory.getDepartamentos = _getDepartamentos;
    icaServiceFactory.getContribuyente = _getContribuyente;
    icaServiceFactory.getActividades = _getActividades;
    icaServiceFactory.getActividadesAnio = _getActividadesAnio;
    icaServiceFactory.GuardarFormulario = _GuardarFormulario;
    icaServiceFactory.FijarFormulario = _FijarFormulario;
    icaServiceFactory.DescargarPDF = _DescargarPDF;
    icaServiceFactory.DescargarPDFYondo = _DescargarPDFYondo;
    icaServiceFactory.PagarDeclaracion = _PagarDeclaracion;
    icaServiceFactory.GuardarSolicitud = _GuardarSolicitud;
    icaServiceFactory.resize = _resize;
	icaServiceFactory.cleanDeclaracion = _cleanDeclaracion;
	icaServiceFactory.mes = _mes;
	icaServiceFactory.bimestre = _bimestre;
    icaServiceFactory.maxReteIca = _maxReteIca;
    icaServiceFactory.round = _round;
    

    return icaServiceFactory;
}]);