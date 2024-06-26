function blurCurrency($filter) {
    function link(scope, el, attrs, ngModelCtrl) {
        function formatter(value) {
            value = value ? parseFloat(value.toString().replace(/[^0-9._-]/g, '')) || 0 : 0;
            var formattedValue = $filter('currency')(value, "", 0);
            el.val(formattedValue.replace('$', ''));
            el.val(el.val().replace('.00', ''));
            ngModelCtrl.$setViewValue(value);
            //scope.$apply();
            return formattedValue;
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
            formatter(el.val());
        });
    }
    return {
        require: '^ngModel',
        scope: true,
        link: link
    };
}
blurCurrency.$inject = ['$filter'];

app.controller('icaController', ['$scope', 'icaService', 'icaSettings', '$window', function ($scope, icaService, icaSettings, $window) {
    $scope.Parametrizacion = {
        PorcAvisosTableros: 15 / 100, // Del 15%
        PorcSobretasa: 0,
        FechaMaxima: new Date(),
        UVT: 35607
    };
    $scope.TieneAvisos = "Si";
    $scope.TieneSobretasa = "Si";
    $scope.TieneAnticipo = "Si";
    $scope.IdDeclaracion = 0;
    $scope.AnioGravable = "";
    $scope.Departamentos = null;
    $scope.Ciudades = null;
    $scope.Actividad = [];
    $scope.Id_TipoUso = 1;
    $scope.count = 1;

    $scope.Declaracion = {
        FechaPresentacion: ""
    };

    $scope.Persona = {
        Contribuyente: {
            Id_TipoDocumento: "1",
            Documento: null,
            DetalleContribuyente: {
                RazonSocial: null,
                PrimerNombre: null,
                SegundoNombre: null,
                PrimerApellido: null,
                SegundoApellido: null,
                DV: null
            }
        },
        Email: {
            Mail: null,
        },
        Telefono: {
            Telefono: null,
            Indicativo: null
        },
        Direccion: {
            Id_Ciudad: null,
            Direccion: null
        }
    }
    $scope.Declarante = {
        Nombre: null,
        Documento: null
    }
    $scope.Contador = {
        Nombre: null,
        Documento: null,
        Id_Cargo: 1,
        NroTarjetaProfesional: null
    }
    $scope.DetalleDeclaracion = {
        NumeroEstablecimientos: "1"
        , PeriodoBogota: "Ene-Febre"
        , ResponsabilidadContriAgen: 0
        , NumeroDeclaracionCorrige: ""
        , ValorDeclaracionCorrige: ""
        , FechaPresentacionDeclaracionAnterior: ""
        , ClasificacionContribuyente: ""
        , IngresosOrdinarios: ""
        , IngresosFueraMunicipio: ""
        , TotalIngresosOrdinarios: ""
        , DevolucionDescuentos: ""
        , Exportaciones: ""
        , ActivosFijos: ""
        , ActividadesExcluidas: ""
        , ActividadesExentas: ""
        , IngresosGravables: ""
        , TotalIngreso: ""
        , TotalImpuesto: ""
        , Energia: ""
        , ImpuestoLey: ""
        , ImpIndYComercio: ""
        , ImpAvisosyTableros: ""
        , UnidadesComerciales: ""
        , Sobretasa: ""
        , SobretasaSeguridad: ""
        , TotalImpuestoCargo: ""
        , ValorExencion: ""
        , Retenciones: ""
        , Autorretenciones: ""
        , AnticipoLiquidado: ""
        , AnticipoImpuesto: ""
        , Sanciones: ""
        , SaldoPeriodo: ""
        , TotalSaldoCargo: ""
        , TotalSaldoFavor: ""
        , ValorPagar: ""
        , Descuento: ""
        , InteresMora: ""
        , TotalAPagar: ""
        , PagoVoluntario: ""
        , TotalPagoVoluntario: ""
        , ValorPagadoDeclaracionInicial: 0
        , Destino: ""
        , fechaMaxima: new Date("2024/03/27")
        , MensajeAcuerdoMunicipal: ""
        , ConPA: ""
    };

    $scope.RadicadoAnterior = {
        Id: null,
        NroRadicadoAnterior: null,
        Valor: 0,
        Fecha: null
    }

    $scope.ParamsPDF = {
        CodigoMunicipio: icaSettings.CodigoMunicipio,
        NombreArchivo: icaSettings.NombreArchivo,
        Referencia: $scope.IdDeclaracion,
        Almacena: 0
    }

    $scope.getActividades = function () {
        icaService.getActividades().then(function (results) {
            $scope.Actividades = results.data;
            var x = $('#ddlAct-1');
            $scope.chargeddl(x);
        }, function (error) {
            iziToast.error({
                title: 'Servicio no disponible',
                message: 'Municipio sin actividades programadas',
            });
        });
    }

    icaService.getDepartamentos().then(function (results) {
        $scope.Departamentos = results.data;
        var usuario = {
            Username: icaSettings.CodigoMunicipio,
            Password: icaSettings.Password
        };
        icaService.getToken(usuario).then(function (resolve) {
            $scope.Token = resolve.data.replace(/"/g, '');
            icaService.getDataMunicipio($scope.Token).then(function (results) {
                $scope.Municipio = results.data;
                $scope.DepSelected = $scope.Departamentos != null ? $scope.Departamentos.find(function (dep) { return dep.NombreDepartamento == $scope.Municipio.Departamento }).Id : "0";
                document.getElementById("ddlDepartamento").value = $scope.DepSelected;
                $scope.Ciudades = $scope.DepSelected != null ? $scope.Departamentos.find(function (dep) { return dep.Id == $scope.DepSelected }).Ciudades : null;
                $scope.Persona.Telefono.Indicativo = $scope.Municipio.Indicativo;
            }, function (error) {
                iziToast.error({
                    title: 'Servicio no disponible',
                    message: 'Sin información del Municipio',
                });
            });
        }, function (error) {
            iziToast.error({
                title: 'Servicio no disponible',
                message: 'Sin acceso al servicio, por favor notifique al administrador',
            });
        });
    }, function (error) {
        iziToast.error({
            title: 'No encontrado',
            message: 'No se cargó el listado de Departamentos correctamente',
        });
    });

    $scope.SetFechaMaxima = function () {
        const Year = parseInt(document.getElementById("ddlAnio").value);
        $scope.Declaracion.FechaPresentacion = new Date();

        switch (Year) {
            case 2023:
                $scope.DetalleDeclaracion.fechaMaxima = new Date(`${Year + 1}/03/27`);
                break;
            default:
                $scope.DetalleDeclaracion.fechaMaxima = new Date(`${Year + 1}/03/27`);
                break;
        }
    }

    /*Cambios en campos*/
    $scope.$watch('TieneAvisos', function () {
        $scope.CalcularRenglon25();
    });

    $scope.$watch('TieneSobretasa', function () {
        $scope.CalcularRenglon25();
    });

    $scope.$watch('TieneAnticipo', function () {
        $scope.CalcularRenglon33();
    });

    $scope.$watch('DepSelected', function () {
        var x = document.getElementById("ddlMunicipio");
        var optionsCiud = [];
        $.each($scope.Ciudades, function (key, val) {
            optionsCiud.push("<option value='" + val.Id + "'>" + val.NombreCiudad + "</option>");
        });
        x.innerHTML = optionsCiud.join('\n');
        $scope.CiuSelected = $scope.Ciudades != null ? $scope.Ciudades.find(function (ciu) { return ciu.NombreCiudad == $scope.Municipio.Ciudad }).Id : "0";
        document.getElementById("ddlMunicipio").value = $scope.CiuSelected;
    });

    $scope.$watch('Persona.Contribuyente.Documento', function () {
        var x = document.getElementById("ddlMunicipio");
        var optionsCiud = [];
        $.each($scope.Ciudades, function (key, val) {
            optionsCiud.push("<option value='" + val.Id + "'>" + val.NombreCiudad + "</option>");
        });
        x.innerHTML = optionsCiud.join('\n');
        $scope.CiuSelected = $scope.Ciudades != null ? $scope.Ciudades.find(function (ciu) { return ciu.NombreCiudad == $scope.Municipio.Ciudad }).Id : "0";
        document.getElementById("ddlMunicipio").value = $scope.CiuSelected;
    });

    $scope.$watch('Persona.Contribuyente.Id_TipoDocumento', function () {
        const dv = document.getElementById("txtDV");
        const razon = document.getElementById("txtRazon");
        const nombre = document.getElementById("txtPrimerNombre");
        const apellido = document.getElementById("txtPrimerApellido");
        const dvJuridica = document.getElementById("dvJuridica");
        const dvNatural = document.getElementById("dvNatural");

        if ($scope.Persona.Contribuyente.Id_TipoDocumento === "2") {
            dvJuridica.hidden = false;
            dvNatural.hidden = true;
            dv.classList.add("req");
            dv.removeAttribute("disabled");
            razon.classList.add("req");
            nombre.classList.remove("req");
            apellido.classList.remove("req");
            nombre.value = "";
            document.getElementById("txtSegundoNombre").value = "";
            document.getElementById("txtSegundoApellido").value = "";
            apellido.value = "";
        } else {
            dvJuridica.hidden = true;
            dvNatural.hidden = false;
            dv.classList.remove("req");
            razon.classList.remove("req");
            nombre.classList.add("req");
            apellido.classList.add("req");
            dv.value = "";
            razon.value = "";
            dv.setAttribute("disabled", true);
        }
    });

    $scope.$watch('Persona.Direccion.Id_Departamento', function () {
        var y = document.getElementById("ddlMunicipioDir");
        y.innerHTML = "";
        var optionsCiud = [];
        $scope.CiudadesDir = $scope.DepSelected != null ? $scope.Departamentos.find(x => x.Id == $scope.Persona.Direccion.Id_Departamento).Ciudades : null;
        optionsCiud.push("<option value>Seleccione una opcion...</option>");
        $.each($scope.CiudadesDir, function (key, val) {
            optionsCiud.push("<option value='" + val.Id + "'>" + val.NombreCiudad + "</option>");
        });
        y.innerHTML = optionsCiud.join('\n');
    });

    $scope.Redondear = function () {
        if (event != undefined && event != null) {
            $scope.redondeo($(event.target));
        }
    };

    $scope.redondeo = function (elem) {
        if (elem[0].tagName == "INPUT") {
            elem[0].value =
                Math.round(elem[0].value.replaceAll(",", "") / 1000) * 1000;
            if (elem[0].dataset.ngModel != undefined) {
                var model = elem[0].dataset.ngModel.split(".")[1];
                $scope.DetalleDeclaracion[model] = elem[0].value.replace(",", "");
            }
        }
    };

    $scope.redondeoValor = function (valor) {
        return (Math.round(valor / 1000) * 1000);
    }

    //invocar servicios
    $scope.Guardar = function () {
        $scope.SetFechaMaxima();
        $scope.SetActividades();
        let formulario = {
            Id: $scope.IdDeclaracion,
            AnioGravable: document.getElementById("ddlAnio").value,
            Id_Municipio: $scope.Municipio.Id,
            Id_TipoAutoliquidable: icaSettings.Id_TipoAutoliquidable,
            Id_TipoUso: $scope.Id_TipoUso,
            PeriodoBogota: $scope.DetalleDeclaracion.PeriodoBogota,
            ResponsabilidadContriAgen: $scope.DetalleDeclaracion.ResponsabilidadContriAgen,
            Persona: $scope.Persona,
            Declarante: $scope.Declarante,
            Contador: $scope.Contador,
            ValorPagar: $scope.DetalleDeclaracion.TotalAPagar,
            DetalleDeclaracion: JSON.stringify($scope.DetalleDeclaracion),
            Actividades: $scope.Actividad,
            FechaPresentacion: $scope.Declaracion.FechaPresentacion,
            Token: $scope.Token,
            FechaDeclarado: ""
        }
        $('#overlay').fadeIn();
        icaService.GuardarFormulario(formulario).then(
            function (result) {
                var mensaje = result.data.Message;
                $scope.IdDeclaracion = mensaje.split('-')[0];
                document.getElementById("declarar").hidden = false;
                $('#overlay').fadeOut();
                iziToast.success({
                    title: mensaje.split('-')[1],
                    message: 'Ya puede asentar su declaración'
                });
            }, function (error) {
                $('#overlay').fadeOut();
                var mensaje = error.data.Message;
                iziToast.error({
                    title: 'Formulario no guardado',
                    message: 'Se presentó un error guardando el formulario, por favor intentelo en de nuevo',
                });
                document.getElementById("declarar").hidden = true;
                document.getElementById("pago").hidden = true;
            });
    }

    $scope.PreviewPDF = function () {
        let parametros = $scope.ParamsPDF;
        parametros.Parametros = 0;
        parametros.Referencia = $scope.IdDeclaracion;
        parametros.Token = $scope.Token;
        $('#overlay').fadeIn();
        icaService.DescargarPDF(parametros).then(
            function (result) {
                var pdf64 = result.data.Message.replace(/"/g, '').split("split")[1];
                var image = new Image();
                image.src = 'data:image/png;base64,' + pdf64;
                image.style.width = "100%";
                document.getElementById("previewPDF").appendChild(image);
                $('#modalFormulario').modal('show');
                $('#overlay').fadeOut();
                return false;
            }, function (error) {
                $('#overlay').fadeOut();
                var mensaje = error.data.Message;
                iziToast.error({
                    title: 'Error Descargando',
                    message: 'Se presentó un error generando el archivo, por favor intentelo de nuevo.',
                });
                document.getElementById("pago").hidden = true;
            });
    }

    $scope.Declarar = function () {
        let declaracion = {
            Id: $scope.IdDeclaracion,
            Id_TipoAutoliquidable: icaSettings.Id_TipoAutoliquidable,
            codigoMunicipio: icaSettings.CodigoMunicipio,
            Token: $scope.Token
            //Parametros : $scope.DetalleDeclaracion.MensajeAcuerdoMunicipal
        }

        $('#overlay').fadeIn();
        icaService.FijarFormulario(declaracion).then(
            function (result) {
                var mensaje = result.data.Message;
                document.getElementById("pago").hidden = false;
                iziToast.success({
                    title: mensaje.split('-')[1],
                    message: 'Generando PDF...'
                });
                $scope.GenerarPDF();
                if ($scope.DetalleDeclaracion.TotalAPagar > 0) {
                    document.getElementById("pago").hidden = false;
                }
                document.getElementById("guardar").hidden = true;
                document.getElementById("declarar").hidden = true;
            }, function (error) {
                var mensaje = error.data.Message;
                iziToast.error({
                    title: 'Error Declarando',
                    message: 'Se presentó un error guardando el formulario, por favor intentelo de nuevo más tarde.',
                });
                document.getElementById("pago").hidden = true;
            });
    }

    $scope.GenerarPDF = function () {
        let parametros = $scope.ParamsPDF;
        parametros.Parametros = 0;
        parametros.Almacena = 1;

        if (icaSettings.mobile) {
            parametros.Almacena = 2;
        }

        parametros.Referencia = $scope.IdDeclaracion;
        parametros.Token = $scope.Token;
        $('#overlay').fadeIn();

        // if (pdfGenerado != null){
        // $scope.Descargar('data:application/pdf;base64,'+ pdfGenerado,"Declaracion");
        // }

        icaService.DescargarPDF(parametros).then(
            function (result) {
                if (!icaSettings.mobile) {
                    var pdf64 = result.data.Message.replace(/"/g, '').split("split")[0];
                    pdfGenerado = pdf64;


                    $scope.Descargar('data:application/pdf;base64,' + pdf64, "Declaracion");
                } else {
                    var pdf64 = result.data.Message.replace(/"/g, '').split("split")[0];
                    pdfGenerado = pdf64;
                    $scope.Descargar('data:application/pdf;base64,' + pdf64, "Declaracion");
                    /*let filen=icaSettings.CodigoMunicipio+'_'+$scope.IdDeclaracion;
                        $scope.Descargar(serviceBase.split("api")[0]+'PDFs/'+filen+'.pdf',"Declaracion");
                        setTimeout(function() {
                         icaService.cleanDeclaracion(filen);
                      }, 10000);*/
                }
                $('#overlay').fadeOut();
                $('#modalFormulario').modal('hide');
            }, function (error) {
                $('#overlay').fadeOut();
                var mensaje = error.data.Message;
                iziToast.error({
                    title: 'Error Descargando',
                    message: 'Se presentó un error generando el archivo, por favor intentelo de nuevo.',
                });
                document.getElementById("pago").hidden = true;
            }
        );
    }

    $scope.Descargar = function (file, name) {
        const linkSource = file;
        let downloadLink = document.createElement("a");
        const fileName = name + ".pdf";
        downloadLink.href = linkSource;
        downloadLink.target = "_blank";
        downloadLink.download = fileName;
        downloadLink.click();
    }

    $scope.Pagar = function () {
        $('#overlay').fadeIn();
        var send = {
            Id: $scope.IdDeclaracion,
            Token: $scope.Token
        }
        icaService.PagarDeclaracion(send).then(
            function (result) {
                var url = (result.data.replace('"', '')).replace('"', '');
                window.open(url, '_blank');
                setTimeout(function () {
                    location.reload();
                }, 3000);
            }, function (error) {
                $('#overlay').fadeOut();
                iziToast.error({
                    title: 'Error Iniciando Pago',
                    message: 'No se puede crear la transacción, por favor inténtelo mas tarde',
                });
            });
    }

    /*Calculos*/
    $scope.CalcularRenglon10 = function () {
        $scope.Redondear();

        $scope.DetalleDeclaracion.TotalIngresosOrdinarios =
            ($scope.DetalleDeclaracion.IngresosOrdinarios != "" ? parseFloat($scope.DetalleDeclaracion.IngresosOrdinarios) : 0)
            - ($scope.DetalleDeclaracion.IngresosFueraMunicipio != "" ? parseFloat($scope.DetalleDeclaracion.IngresosFueraMunicipio) : 0);

        $scope.DetalleDeclaracion.TotalIngresosOrdinarios = Math.max($scope.DetalleDeclaracion.TotalIngresosOrdinarios, 0)

        document.getElementById("txtTotalIngresosOrdinarios").value = $scope.DetalleDeclaracion.TotalIngresosOrdinarios == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalIngresosOrdinarios);

        $scope.CalcularRenglon16();
    }

    $scope.CalcularRenglon16 = function () {
        $scope.Redondear();
        const Act = parseInt(document.getElementById("ddlAct-1").value);

        $scope.DetalleDeclaracion.IngresosGravables =
            ($scope.DetalleDeclaracion.TotalIngresosOrdinarios != "" ? parseFloat($scope.DetalleDeclaracion.TotalIngresosOrdinarios) : 0)
            - ($scope.DetalleDeclaracion.DevolucionDescuentos != "" ? parseFloat($scope.DetalleDeclaracion.DevolucionDescuentos) : 0)
            - ($scope.DetalleDeclaracion.Exportaciones != "" ? parseFloat($scope.DetalleDeclaracion.Exportaciones) : 0)
            - ($scope.DetalleDeclaracion.ActivosFijos != "" ? parseFloat($scope.DetalleDeclaracion.ActivosFijos) : 0)
            - ($scope.DetalleDeclaracion.ActividadesExcluidas != "" ? parseFloat($scope.DetalleDeclaracion.ActividadesExcluidas) : 0)
            - ($scope.DetalleDeclaracion.ActividadesExentas != "" ? parseFloat($scope.DetalleDeclaracion.ActividadesExentas) : 0);

        $scope.DetalleDeclaracion.IngresosGravables = Math.max($scope.DetalleDeclaracion.IngresosGravables, 0);

        document.getElementById("txtIngresosGravables").value = $scope.DetalleDeclaracion.IngresosGravables == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.IngresosGravables);

        document.getElementById("txtIngresoAct-1").value = $scope.DetalleDeclaracion.IngresosGravables == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.IngresosGravables);

        document.getElementById("txtTotalIngreso").value = $scope.DetalleDeclaracion.IngresosGravables == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.IngresosGravables);

        if (Act != 0) {
            $scope.recalcularAct();
        }
    }

    $scope.ImpuestoMinimo = function () {
        switch (icaSettings.CodigoMunicipio) {
            case '8918004750':
                if ($scope.DetalleDeclaracion.ImpIndYComercio <= 69000) {
                    $scope.DetalleDeclaracion.ImpIndYComercio = 69000;
                }
                break;
            case '8906803784':
                let minimo = 36000;
                if ($scope.DetalleDeclaracion.ImpIndYComercio <= minimo) {
                    $scope.DetalleDeclaracion.ImpIndYComercio = minimo;
                }
                break;
            default:
                if ($scope.DetalleDeclaracion.ImpIndYComercio <= 0) {
                    $scope.DetalleDeclaracion.ImpIndYComercio = 0;
                }
                break;
        }
    }

    $scope.CalcularRenglon20 = function () {
        $scope.Redondear();

        $scope.DetalleDeclaracion.ImpIndYComercio =
            ($scope.DetalleDeclaracion.TotalImpuesto != "" ? parseFloat($scope.DetalleDeclaracion.TotalImpuesto) : 0)
            + ($scope.DetalleDeclaracion.ImpuestoLey != "" ? parseFloat($scope.DetalleDeclaracion.ImpuestoLey) : 0);

        $scope.DetalleDeclaracion.ImpIndYComercio = Math.max($scope.DetalleDeclaracion.ImpIndYComercio, 0);

        document.getElementById("txtImpIndYComercio").value = $scope.DetalleDeclaracion.ImpIndYComercio == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.ImpIndYComercio);

        $scope.CalcularRenglon25();
    }

    $scope.CalcularAvisos = function () {
        $scope.DetalleDeclaracion.ImpAvisosyTableros = 0;
        if ($scope.TieneAvisos == "Si") {
            if (icaSettings.CodigoMunicipio == '8900011270') {
                $scope.DetalleDeclaracion.ImpAvisosyTableros = icaService.round($scope.DetalleDeclaracion.ImpIndYComercio * $scope.Parametrizacion.PorcAvisosTableros);
            }
        }

        document.getElementById("txtImpAvisosyTableros").value = $scope.DetalleDeclaracion.ImpAvisosyTableros == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.ImpAvisosyTableros);
    }

    $scope.CalcularSobretasaBomberil = function () {
        const txtSobreT = document.getElementById("txtSobretasa");
        if (txtSobreT.readOnly) {
            $scope.DetalleDeclaracion.Sobretasa = icaService.round($scope.DetalleDeclaracion.ImpIndYComercio * 0.05);
            txtSobreT.value = $scope.DetalleDeclaracion.Sobretasa == 0 ?
                '0.00' : icaService.formatNum($scope.DetalleDeclaracion.Sobretasa);
        }
    }

    $scope.CalcularRenglon25 = function () {
        $scope.Redondear();
        $scope.CalcularAvisos();
        $scope.CalcularSobretasaBomberil();

        $scope.DetalleDeclaracion.TotalImpuestoCargo =
            ($scope.DetalleDeclaracion.ImpIndYComercio != "" ? parseFloat($scope.DetalleDeclaracion.ImpIndYComercio) : 0)
            + ($scope.DetalleDeclaracion.ImpAvisosyTableros != "" ? parseFloat($scope.DetalleDeclaracion.ImpAvisosyTableros) : 0)
            + ($scope.DetalleDeclaracion.UnidadesComerciales != "" ? parseFloat($scope.DetalleDeclaracion.UnidadesComerciales) : 0)
            + ($scope.DetalleDeclaracion.Sobretasa != "" ? parseFloat($scope.DetalleDeclaracion.Sobretasa) : 0)
            + ($scope.DetalleDeclaracion.SobretasaSeguridad != "" ? parseFloat($scope.DetalleDeclaracion.SobretasaSeguridad) : 0);

        $scope.DetalleDeclaracion.TotalImpuestoCargo = Math.max($scope.DetalleDeclaracion.TotalImpuestoCargo, 0)

        document.getElementById("txtTotalImpuestosCargo").value = $scope.DetalleDeclaracion.TotalImpuestoCargo == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalImpuestoCargo);

        $scope.CalcularRenglon33();
    }

    $scope.CalcularSancion = function () {
        $scope.SetFechaMaxima();

        const now = new Date();
        const ValUVT = 235000; // Valor actual de 5UVT Año acutal
        const DMax = $scope.DetalleDeclaracion.fechaMaxima;
        const txtSanciones = document.getElementById("txtSanciones");
        const txtInteresMora = document.getElementById("txtInteresMora");
        const txtOtraSancion = document.getElementById("txtOtraSancion");
        const TipoSanciones = document.getElementById("TipoSanciones");

        txtSanciones.readOnly = false;
        txtInteresMora.classList.remove("req");

        if (now > DMax && $scope.Id_TipoUso == 1) {
            const a = Math.max(1, icaService.dateDiff(now, DMax));
            const sancionInicial = 0.05 * a * $scope.DetalleDeclaracion.TotalImpuestoCargo;
            let sancionFinal = Math.min(Math.max(ValUVT, sancionInicial), $scope.DetalleDeclaracion.TotalImpuestoCargo);
            sancionFinal = Math.max(sancionFinal, ValUVT);
            $scope.DetalleDeclaracion.Sanciones = icaService.round(sancionFinal);

            document.getElementById("txtOtraSancion").hidden = true;
            document.getElementById("txtOtraSancion").value = "";
            $("input[name='rbTipoSancion']").prop('disabled', true);
            $scope.DetalleDeclaracion.TipoSancion = "Ext";
            $scope.DetalleDeclaracion.OtraSancion = "";

            txtOtraSancion.style.display = 'none';
            txtSanciones.readOnly = true;
            txtInteresMora.classList.add("req");

            $scope.CalcularInteresesMoratorios();
            txtSanciones.value = $scope.DetalleDeclaracion.Sanciones == 0 ?
                '0.00' : icaService.formatNum($scope.DetalleDeclaracion.Sanciones);
        } else {
            TipoSanciones.hidden = $scope.Id_TipoUso == 3;
            $("#txtSanciones").prop("readonly", $scope.Id_TipoUso == 3);
            $("#txtSanciones").prop("disabled", $scope.Id_TipoUso == 3);
            $("input[name='rbTipoSancion']").prop('disabled', $scope.Id_TipoUso == 3);
        }
    }

    $scope.CalcularInteresesMoratorios = () => {
        $scope.SetFechaMaxima();
        if ($scope.DetalleDeclaracion.TipoSancion == "Ext") {
            const Now = new Date();
            const ValorPag = $scope.DetalleDeclaracion.ValorPagar;
            const FechaM = $scope.DetalleDeclaracion.fechaMaxima;
            const TasaIntMoraAnual = 31.09;
            const TasaIntMoraDiario = TasaIntMoraAnual / 366;
            let diferenciaFechas = Now - FechaM;
            diferenciaFechas = Math.floor(diferenciaFechas / (1000 * 60 * 60 * 24));
            let Valor = (ValorPag * TasaIntMoraDiario * diferenciaFechas) / 100;
            Valor = Math.max(Valor, 0);
            Valor = icaService.round(Valor);

            if (event) {
                reaplicar($(event.target));
            }

            function reaplicar(elem) {
                const Intereses = parseInt($scope.DetalleDeclaracion.InteresMora);
                if (elem[0].tagName === "INPUT" && elem[0].id === 'txtInteresMora') {
                    if (Intereses > Valor) {
                        elem[0].value = Intereses;
                    } else {
                        elem[0].value = Valor;
                        $scope.DetalleDeclaracion.InteresMora = Valor.toString();
                        iziToast.error({
                            title: 'Valor Errado',
                            message: 'El valor de la sancion no puede ser menor a 5UVT',
                        })
                    }
                } else {
                    $scope.DetalleDeclaracion.InteresMora = Valor;
                    document.getElementById("txtInteresMora").value = $scope.DetalleDeclaracion.InteresMora == 0 ?
                        "0.00" : icaService.formatNum($scope.DetalleDeclaracion.InteresMora);
                }
            }
        }
    }

    $scope.CalcularAnticipo = function () {
        let porcentaje = 0.00;
        const ddlAnio = parseInt(document.getElementById("ddlAnio").value);
        $scope.DetalleDeclaracion.AnticipoImpuesto = 0;

        if ($scope.TieneAnticipo == "Si") {
            porcentaje = (ddlAnio <= 2019) ? 0.40 : 0.15;

            const impIndYComercio = parseFloat($scope.DetalleDeclaracion.ImpIndYComercio) || 0;
            const impAvisosyTableros = parseFloat($scope.DetalleDeclaracion.ImpAvisosyTableros) || 0;

            $scope.DetalleDeclaracion.AnticipoImpuesto = icaService.round((impIndYComercio + impAvisosyTableros) * porcentaje);
        }

        document.getElementById("txtAnticipoImpuesto").value = $scope.DetalleDeclaracion.AnticipoImpuesto == 0
            ? '0.00' : icaService.formatNum($scope.DetalleDeclaracion.AnticipoImpuesto);
    }

    $scope.CalcularRenglon33 = function () {
        $scope.Redondear();
        $scope.CalcularSancion();
        $scope.CalcularAnticipo();

        var valor =
            ($scope.DetalleDeclaracion.TotalImpuestoCargo != "" ? parseFloat($scope.DetalleDeclaracion.TotalImpuestoCargo) : 0)
            - ($scope.DetalleDeclaracion.ValorExencion != "" ? parseFloat($scope.DetalleDeclaracion.ValorExencion) : 0)
            - ($scope.DetalleDeclaracion.Retenciones != "" ? parseFloat($scope.DetalleDeclaracion.Retenciones) : 0)
            - ($scope.DetalleDeclaracion.Autorretenciones != "" ? parseFloat($scope.DetalleDeclaracion.Autorretenciones) : 0)
            - ($scope.DetalleDeclaracion.AnticipoLiquidado != "" ? parseFloat($scope.DetalleDeclaracion.AnticipoLiquidado) : 0)
            + ($scope.DetalleDeclaracion.AnticipoImpuesto != "" ? parseFloat($scope.DetalleDeclaracion.AnticipoImpuesto) : 0)
            + ($scope.DetalleDeclaracion.Sanciones != "" ? parseFloat($scope.DetalleDeclaracion.Sanciones) : 0)
            - ($scope.DetalleDeclaracion.SaldoPeriodo != "" ? parseFloat($scope.DetalleDeclaracion.SaldoPeriodo) : 0);

        if (valor >= 0) {
            $scope.DetalleDeclaracion.TotalSaldoCargo = valor;
            $scope.DetalleDeclaracion.TotalSaldoFavor = 0;
            $scope.DetalleDeclaracion.ValorPagar = valor;
        } else {
            $scope.DetalleDeclaracion.TotalSaldoFavor = Math.abs(valor);
            $scope.DetalleDeclaracion.TotalSaldoCargo = 0;
            $scope.DetalleDeclaracion.ValorPagar = 0;
        }

        $scope.DetalleDeclaracion.ValorPagar = $scope.DetalleDeclaracion.TotalSaldoCargo;

        document.getElementById("txtTotalSaldoCargo").value = $scope.DetalleDeclaracion.TotalSaldoCargo == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalSaldoCargo);

        document.getElementById("txtTotalSaldoFavor").value = $scope.DetalleDeclaracion.TotalSaldoFavor == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalSaldoFavor);

        document.getElementById("txtValorPagar").value = $scope.DetalleDeclaracion.ValorPagar == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.ValorPagar);

        $scope.CalcularRenglon38();
    }

    $scope.CalcularDescuento = function () {
        $scope.DetalleDeclaracion.Descuento = 0;
        const txtDescuento = document.getElementById("txtDescuento");

        if (txtDescuento.readOnly) {
            const ValDllAnio = parseInt(document.getElementById("ddlAnio").value);
            const valorImpuesto = ($scope.DetalleDeclaracion.ImpIndYComercio != "" ? parseFloat($scope.DetalleDeclaracion.ImpIndYComercio) : 0);
            let now = new Date();

            if (ValDllAnio == parseInt(now.getFullYear() - 1) && $scope.DetalleDeclaracion.TotalSaldoFavor == 0) {
                if (now <= new Date(`${ValDllAnio + 1}/02/29`)) {
                    $scope.DetalleDeclaracion.Descuento = valorImpuesto * 0.15;
                } else if (now <= new Date(`${ValDllAnio + 1}/03/27`)) {
                    $scope.DetalleDeclaracion.Descuento = valorImpuesto * 0.1;
                }
            }

            txtDescuento.value = $scope.DetalleDeclaracion.Descuento == 0 ?
                '0.00' : icaService.formatNum($scope.DetalleDeclaracion.Descuento);
        }
    }

    $scope.CalcularRenglon38 = function () {
        $scope.Redondear();
        $scope.CalcularDescuento();
        $scope.CalcularInteresesMoratorios();

        $scope.DetalleDeclaracion.TotalAPagar =
            ($scope.DetalleDeclaracion.ValorPagar != "" ? parseFloat($scope.DetalleDeclaracion.ValorPagar) : 0)
            - ($scope.DetalleDeclaracion.Descuento != "" ? parseFloat($scope.DetalleDeclaracion.Descuento) : 0)
            + ($scope.DetalleDeclaracion.InteresMora != "" ? parseFloat($scope.DetalleDeclaracion.InteresMora) : 0);

        $scope.DetalleDeclaracion.TotalAPagar = Math.max($scope.DetalleDeclaracion.TotalAPagar, 0)

        document.getElementById("txtTotalAPagar").value = $scope.DetalleDeclaracion.TotalAPagar == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalAPagar);

        document.getElementById("txtTotalAPagar").value = $scope.DetalleDeclaracion.TotalAPagar == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalAPagar);

        $scope.CalcularRenglon40();
    }

    $scope.CalcularRenglon40 = function () {
        $scope.Redondear();

        $scope.DetalleDeclaracion.TotalPagoVoluntario =
            ($scope.DetalleDeclaracion.TotalAPagar != "" ? parseFloat($scope.DetalleDeclaracion.TotalAPagar) : 0)
            + ($scope.DetalleDeclaracion.PagoVoluntario != "" ? parseFloat($scope.DetalleDeclaracion.PagoVoluntario) : 0);

        document.getElementById("txtTotalPagoVoluntario").value = $scope.DetalleDeclaracion.TotalPagoVoluntario == 0 ?
            '0.00' : icaService.formatNum($scope.DetalleDeclaracion.TotalPagoVoluntario);
    }

    /*Funciones actividades*/
    $scope.SetActividades = function () {
        let id = $("select[id*='ddlAct']");
        let ingresos = $("input[id*='txtIngresoAct']");
        let impuesto = $("input[id*='txtImpuestoAct']");
        $scope.Actividad = [];
        for (var i = 0; i < id.length; i++) {
            var Actividad = {
                Id_Actividad: id[i].value,
                IngresosGravados: ingresos[i].value,
                Impuesto: impuesto[i].value
            }
            $scope.Actividad[$scope.Actividad.length] = Actividad;
        }
    }

    $scope.asignarActividad = function (elem) {
        var idActividad = elem.id.split('-')[1];
        var actividad = $scope.Actividades.find(function (act) { return act.Id == elem.value });
        document.getElementById("txtCodAct-" + idActividad).value = elem.value == 0 ? "" : actividad.Codigo;
        document.getElementById("txtTarifaAct-" + idActividad).value = elem.value == 0 ? "" : actividad.TarifaxMil;
    }

    $scope.validDdl = function (elem) {
        var actSelected = $(".ddlact");
        var go = true;
        $.each(actSelected, function (key, val) {
            if (val.id != elem.id && val.value == elem.value) {
                $("#" + elem.id).val('0').trigger('change');
                go = false;
            }
        });
        return go;
    }

    $scope.addRow = function (table) {
        var go = $scope.validateRow($scope.count);
        if (go) {
            $scope.count = parseInt($scope.count) + 1;
            let body = '<div class="col-sm-12 row"><div class="col-md-8"><div class="col-md-2">'
                + "<a href='javascript:angular.element(document.getElementById(\"container\")).scope().delRow(\"ddlAct-" + $scope.count + "\");'><i class='ti-minus'></i><span>Eliminar</span></a>"
                + '<div class="form-group"><label><strong>ACTIVIDAD</strong></label></div></div><div class="col-md-10">'
                + "<select id='ddlAct-" + $scope.count + "' class='form-control select2 ddlact' style='width: 100%' ng-model='Actividades.IdAct" + $scope.count + "'>"
                + "<option value='0'>Selecciona una opción...</option>"
                + "</select>"
                + '        <br>'
                + '    </div>'
                + '</div>'
                + '<div class="col-md-4">'
                + '    <div class="col-md-3">'
                + '        <div class="form-group" style="text-align: center"">'
                + '            <label><strong>CÓDIGO CIIU</strong></label>'
                + '        </div>'
                + '    </div>'
                + '    <div class="col-md-9">'
                + "<input id='txtCodAct-" + $scope.count + "' type='text' readonly='readonly' class='form-control'>"
                + '    </div>'
                + '</div>'
                + '</div>'
                + '<div class="col-sm-12 row">'
                + '    <div class="col-sm-4">'
                + '        <div class="col-md-4">'
                + '            <div class="form-group">'
                + '                <label><strong>INGRESOS GRAVADOS</strong></label>'
                + '            </div>'
                + '        </div>'
                + '        <div class="col-md-8">'
                + '            <div class="input-group">'
                + '                <span class="input-group-addon">$</span>'
                + "                <input id='txtIngresoAct-" + $scope.count + "' type='text' class='form-control act num ng-scope ng-valid ng-dirty' custom-on-change='Redondear' data-ng-model='Actividades.IngresoAct" + $scope.count + "'>"
                + '            </div>'
                + '        </div>'
                + '    </div>'
                + '    <div class="col-sm-4">'
                + '        <div class="col-md-4">'
                + '            <div class="form-group">'
                + '                <label><strong>TARIFA X MIL</strong></label>'
                + '            </div>'
                + '        </div>'
                + '        <div class="col-md-8">'
                + '            <div class="input-group">'
                + "                <input id='txtTarifaAct-" + $scope.count + "' type='text' readonly='readonly' class='form-control'>"
                + '                <span class="input-group-addon">X1000</span>'
                + '            </div>'
                + '        </div>'
                + '    </div>'
                + '    <div class="col-sm-4">'
                + '        <div class="col-md-4">'
                + '            <div class="form-group">'
                + '                <label><strong>IMPUESTO</strong></label>'
                + '            </div>'
                + '        </div>'
                + '        <div class="col-md-8">'
                + '            <div class="input-group">'
                + '                <span class="input-group-addon">$</span>'
                + "                <input id='txtImpuestoAct-" + $scope.count + "' type='text' readonly='readonly' class='form-control num ng-scope ng-valid ng-dirty' data-ng-model='Actividades.ImpuestoAct" + $scope.count + "'>"
                + '            </div>'
                + '        </div>'
                + '    </div>'
                + '</div>';
            let tbody = document.getElementById('dvActividadesAdicionales').getElementsByClassName('panel-body')[0].getElementsByClassName('row')[0];
            var row = document.createElement("div");
            row.innerHTML = body.replace(/!count!/g, $scope.count);
            tbody.appendChild(row);
            var x = $('#ddlAct-' + $scope.count);
            $scope.chargeddl(x);
        }
    }

    $scope.validateRow = function (count) {
        var go = false, i = count;
        var dato = "";
        while (i > 0) {
            dato = $("[id*=txtIngresoAct-" + (i) + "]")[0];
            if (dato) {
                break;
            } else {
                i = i - 1;
            }
        }
        go = $scope.validateValor(dato.value);
        return go;
    }

    $scope.validateValor = function (ingresoAnt) {
        if (parseInt(ingresoAnt) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    $scope.delRow = function (elem) {
        var current = document.getElementById(elem);
        var parent = current.parentElement.parentElement.parentElement.parentElement;
        parent.parentElement.removeChild(parent);
        $scope.recalcularAct();
    }

    $scope.recalcularAct = function () {
        const minTotalImpuesto = 520000; //Equivale al %40 de un S.M.L.M.V
        var elems = document.getElementsByClassName("act");
        var total = 0;
        var totalIngreso = 0;

        $.each(elems, function (key, val) {
            var i = val.id.split("-")[1];
            totalIngreso += this.value != "" ? DeformatNumber(this.value) : 0;
            var impuestoActividad = document.getElementById("txtImpuestoAct-" + i);
            var tarifa = document.getElementById("txtTarifaAct-" + i).value;
            impuestoActividad.value = this.value !== "" ? icaService.round(DeformatNumber(this.value) / 1000 * tarifa) : 0;
            impuestoActividad.value = icaService.formatNum(impuestoActividad.value);
            total = total + DeformatNumber(impuestoActividad.value);
            var totalImpuesto = $("input[id*='txtTotalImpuesto']")[0];
            $scope.DetalleDeclaracion.TotalImpuesto = total;
            totalImpuesto.value = icaService.formatNum($scope.DetalleDeclaracion.TotalImpuesto);
            $scope.CalcularRenglon20();
        });

        if ($scope.DetalleDeclaracion.TotalImpuesto < minTotalImpuesto) {
            $scope.DetalleDeclaracion.TotalImpuesto = minTotalImpuesto;
            var totalImpuesto = $("input[id*='txtTotalImpuesto']")[0];
            totalImpuesto.value = icaService.formatNum($scope.DetalleDeclaracion.TotalImpuesto);
            iziToast.error({
                title: 'Señor contribuyente',
                message: 'El valor del punto 17 de su declaracion es menor a 520,000 el valor de esta pasara a ser 40% DEL S.M.L.M.V.',
            });
            $scope.CalcularRenglon20();
        }

        $scope.DetalleDeclaracion.TotalIngreso = totalIngreso;
        var txtTotalIngresos = $("#txtTotalIngreso")[0];
        txtTotalIngresos.value = icaService.formatNum($scope.DetalleDeclaracion.TotalIngreso);

        function DeformatNumber(value) {
            return parseFloat(value.replace(/,/gi, '').replace('.00', ''));
        }
    }

    $scope.chargeddl = function (elem) {
        var registros = [];
        $.each($scope.Actividades, function (key, val) {
            registros.push("<option value='" + val.Id + "'>" + "CIIU " + val.Codigo + " - " + val.Descripcion + "</option>");
        });
        elem.append(registros.join(''));
        elem.select2();
    }

    $scope.lockFields = function () {
        const txtDescuento = document.getElementById("txtDescuento");
        const txtSobretasa = document.getElementById("txtSobretasa");
        const txtSobretasaSeguridad = document.getElementById("txtSobretasaSeguridad");
        const txtAutorretenciones = document.getElementById("txtAutorretenciones");
        const txtAnticipoLiquidado = document.getElementById("txtAnticipoLiquidado");
        const txtAnticipoImpuesto = document.getElementById("txtAnticipoImpuesto");
        const txtValorPagar = document.getElementById("txtValorPagar");
        const txtTotalAPagar = document.getElementById("txtTotalAPagar");
        const txtSanciones = document.getElementById("txtSanciones");
        const txtSaldoPeriodo = document.getElementById("txtSaldoPeriodo");

        switch (icaSettings.CodigoMunicipio) {
            case '8906804370':
                txtDescuento.readOnly = true;
                break;
            case '8913800381':
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAutorretenciones.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtValorPagar.readOnly = false;
                break;
            case '890984043':
                txtSobretasaSeguridad.readOnly = true;
                break;
            case '8999994152':
                txtSobretasa.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '800073475':
                txtSobretasa.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                break;
            case '8906800971':
                txtSobretasa.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtDescuento.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                break;
            case '891180021':
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAutorretenciones.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtDescuento.readOnly = true;
                txtTotalAPagar.readOnly = false;
                break;
            case '8906800591':
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtSanciones.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8001005335':
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8906800267':
                txtSobretasa.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                break;
            case '8906803784':
                txtSobretasa.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8918004750':
                let usoElems = document.getElementsByName("uso");
                $.each(usoElems, function (key, val) {
                    if (val.value == "3") {
                        val.parentElement.hidden = true;
                    }
                });
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAutorretenciones.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '890980577':
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtSaldoPeriodo.readOnly = true;
                break;
            case '8999993842': //Simijaca
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8000959612': //Bolivar-cauca
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                document.getElementById("txtValorExencion").readOnly = true;
                txtAutorretenciones.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtSaldoPeriodo.readOnly = true;
                txtSanciones.readOnly = true;
                document.getElementById("txtInteresMora").readOnly = true;
                break;
            case '892099548': //San martin llanos
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                document.getElementById("txtValorExencion").readOnly = true;
                txtAutorretenciones.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                txtSanciones.readOnly = true;
                txtDescuento.readOnly = true;
                document.getElementById("txtInteresMora").readOnly = true;
                break;
            case '899999312': //Villeta
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                document.getElementById("txtValorExencion").readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                break;
            case '890205383': //Piedecuesta
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtAnticipoLiquidado.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                break;
            case '8000996623': //Moniquirá
                document.getElementById("txtUnidadesComerciales").readOnly = true;
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                document.getElementById("txtValorExencion").readOnly = true;
                break;
            case '800103659': //Paz de ariporo
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                break;
            case '819003297': //Zona Bananera
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '891200461': //Pto Asis
                txtSobretasa.readOnly = true;
                break;
            // SITIOS LITE
            case '8915008416': //Miranda LITE
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8915023976': //Mercaderes LITE
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '8000249776': //Taminango LITE
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                break;
            case '800096766': //Taminango LITE
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                break;
            case '8909853168': //Carepa
                txtSobretasa.readOnly = true;
                txtSobretasaSeguridad.readOnly = true;
                txtDescuento.readOnly = true;
                txtAnticipoImpuesto.readOnly = true;
                break;
            case '800102891': //Mocoa
                txtSobretasa.readOnly = true;
                break;
            default:
                txtDescuento.readOnly = true;
                break;
        }
    }

    /*ready*/
    angular.element(document).ready(function () {
        icaService.resize();
        $(window).resize(function () {
            icaService.resize();
        });
        $scope.lockFields();
        $(document).keypress(function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });
        $('.wizard-navigation').children().bind('click', function () { return false; });;
        $(".wizard-container").css({ marginBottom: '50px' });
        $(".modal-footer").css({ marginBottom: '30px' });
        $scope.getActividades();
        $(".tab-content")[0].classList.remove("row");
        $(".tab-content")[0].classList.add("row");
        $(".num").keypress(function () {
            return icaService.number(this);
        });
        $(".letter").keypress(function () {
            return icaService.letter(this);
        });
        $(".letterWith").keypress(function () {
            return icaService.letterWith(this);
        });
        $("#btnSave").click(function () {
            if (document.getElementById("ddlAct-1").value == 0) {
                iziToast.error({
                    title: 'Actividad no selecciona',
                    message: 'Señor contribuyente debe de seleccionar una actividad para presentar una declaracion',
                });
            } else {
                $scope.Guardar();
            }
        });
        $("#btnDownload").click(function () {
            $scope.PreviewPDF();
        });
        $("#btnDeclarar").click(function () {
            $scope.Declarar();
        });
        $("#btnCancelar").click(function () {
            document.getElementById("declarar").hidden = true;
            $('#modalFormulario').modal('hide');
            $scope.IdDeclaracion = 0;
        });
        $("#btnPSE").click(function () {
            $scope.Pagar();
        });
        $("ddlDepartamento").change(function () {
            icaService.getMunicipiosbyDep(this.value).then(function (results) {
                $scope.Ciudades = results.data;
            }, function (error) {
                iziToast.error({
                    title: 'Servicio no disponible',
                    message: 'Municipio sin actividades programadas',
                });
            });
        });
        // Funcion para seleccionar año
        var year = (new Date()).getFullYear();
        $('#ddlAnio').empty();
        var count = 10;
        if (icaSettings.CodigoMunicipio == '8001005335') {
            count = 15;
        } else if (icaSettings.CodigoMunicipio == '8913800381') {
            count = 5;
        }
        for (var i = 0; i < count; i++) {
            var optionValue = year - i;
            var optionText = (i === 1) ? optionValue : optionValue;
            $('#ddlAnio').append($('<option>', {
                value: optionValue,
                text: optionText
            }));
        }

        $('#ddlAnio').val(year - 1);
        $("#ddlAnio").change(function () {
            if ($scope.DetalleDeclaracion.ImpIndYComercio > 0) {
                $scope.CalcularRenglon20();
                $scope.CalcularSancion();
            }
        });
        $('.select2').select2();
        $('.ddlact').select2();
        $(".periodo").click(function () {
            var elem = this.parentNode.firstChild;
            var elems = document.getElementsByName("periodoBog");
            $.each(elems, function (key, val) {
                if (val.parentElement != elem.parentElement) {
                    val.removeAttribute('checked');
                    val.parentElement.classList.remove("active");
                } else {
                    if (val.value != 1) {
                        $scope.DetalleDeclaracion = {
                            PeriodoBogota: val.value,
                            ResponsabilidadContriAgen: "0"
                        };
                    } else {
                        $scope.DetalleDeclaracion = {
                            PeriodoBogota: '',
                            ResponsabilidadContriAgen: val.value
                        };
                    }
                }
            });
        });
        $(".uso").click(function () {
            var elem = this.parentNode.children[0];
            var elems = document.getElementsByName("uso");
            $.each(elems, function (key, val) {
                if (val.parentElement != elem.parentElement) {
                    val.removeAttribute('checked');
                    val.parentElement.classList.remove("active");
                } else {
                    $scope.Id_TipoUso = val.value;
                    if (val.value == '2') {
                        document.getElementById("corregir").hidden = false;
                        document.getElementById("txtRadicadoAnterior").classList.add("req");
                    }
                    else {
                        document.getElementById("corregir").hidden = true;
                        document.getElementById("txtRadicadoAnterior").classList.remove("req");
                        document.getElementById("txtRadicadoAnterior").value = "";
                    }
                }
            });
        });
        $(".cargo").click(function () {
            var elem = this.parentNode.firstChild;
            var elems = document.getElementsByName("cargo");
            var cargo = false;
            $.each(elems, function (key, val) {
                if (val.parentElement != elem.parentElement) {
                    val.removeAttribute('checked');
                    val.parentElement.classList.remove("active");
                }
                else {
                    $scope.Contador.Id_Cargo = val.value;
                }
            });
        });
        $(".drop").click(function () {
            if (this.classList.contains("collapsed")) {
                this.children[0].classList.remove("ti-arrow-circle-up");
                this.children[0].classList.remove("ti-arrow-circle-down");
                this.children[0].classList.add("ti-arrow-circle-up");
            }
            else {
                this.children[0].classList.remove("ti-arrow-circle-down");
                this.children[0].classList.remove("ti-arrow-circle-up");
                this.children[0].classList.add("ti-arrow-circle-down");
            }
        });
        $(".addActividad").click(function () {
            $scope.addRow('tblActividades');
        });
        $("input[name='rbTipoSancion']").click(function () {
            if (this.value == "Otr") {
                document.getElementById("txtOtraSancion").style.display = "block";
            } else {
                document.getElementById("txtOtraSancion").style.display = "none";
                document.getElementById("txtOtraSancion").value = "";
            }
        })
        $(document).on("change", ".act", function () {
            $scope.recalcularAct();
            this.value = icaService.formatNum(this.value);
        });
        $(document).on("change", ".ddlact", function () {
            if ($scope.validDdl(this)) {
                $scope.asignarActividad(this);
                $scope.recalcularAct();
            }
        });
        $(document).on("change", ".red", function () {
            $scope.redondeo($(event.target));
        });
    });
}]).directive('blurCurrency', blurCurrency);
