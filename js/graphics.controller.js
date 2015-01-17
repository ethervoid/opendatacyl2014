(function () {
    'use strict';
    angular.module('graphics.controller', ['ui.router'])
        .controller('graphicsController', ['$scope', '$http', '$q', graphicsController]);

    function graphicsController($scope, $http, $q) {
        var vm = this;
        vm.inactives = [];
        vm.xAxisTickFormat = xAxisTickFormat;
        vm.toolTipContentFunction = toolTipContentFunction;
        vm.infrastructure = [];

        $q.all([
            getCSV("inactivos.csv",
                ['Estudiantes', 'Labores de hogar', 'Incapacitados', 'Jubilados', 'Otros'],
                ['#C92B26', '#228C00', '#888888', '#FF7F00', 'yellow'])
        ]).then(function (result) {
            vm.inactives = result[0];
        });

        $q.all([
            getCSV("licitaciones.csv",
                ['Vivienda', 'Edificación', 'Obra civil'],
                ['#228C00', '#FF7F00', '#C92B26'])
        ]).then(function (result) {
            vm.infrastructure = result[0];
        });

        function getCSV(url, keys, colors) {
            return $http.get("pages/csv/" + url).then(function (response) {
                var elements = [];
                var file = CSVToArray(response.data, ',');

                for (var column = 1; column < file[0].length; column++) {
                    var values = [];
                    var text_x = [];
                    for (var row = 0; row < file.length; row++) {
                        values.push([row, parseFloat(file[row][column])]);
                        text_x.push(file[row][0]);
                    }
                    elements.push({
                        "key": keys[column - 1],
                        "values": values,
                        "color": colors[column - 1],
                        "text_x": text_x,
                        "disabled": column != 1 && column != 2
                    });
                }
                return elements;
            });
        };

        function xAxisTickFormat() {
            return function (d) {
                return vm.inactives[0].text_x[d];
            }
        }

        function toolTipContentFunction() {
            return function (key, x, y, e, graph) {
                return '<p>' + y + ' (miles) de ' + key + ' el ' + x + '</p>';
            }
        }

    }


    function CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return ( arrData );
    }

})();

