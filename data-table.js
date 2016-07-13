/*
 DataTable v1.0.0
 dependencies: 
                AngularJS v1.2.0 >
                jquery    v2.2.4 >
*/
var dataTable = angular.module("dataTable", []);

dataTable.directive("table", ["$compile", "$filter", "tableService", function ($compile, $filter, tableService) {
    return {
        restrict: "A",
        scope: {
            list: "=",
            pageSize: "=",
            serverSideRecords: "=",
            currentPage: "=",
            returnAction: "&"
        },
        link: function (scope, element) {
            var version = angular.version;
            if (version.minor < 2 || version.dot < 0) {
                element.remove();
                console.error("data-table not work on " + angular.version.full + " version");
                console.warn("try use new version of angular 1.2.0 or uper");
                return false;
            } else {
                //#region Expanded directive default values
                scope.items = [];

                scope.paging = [];

                function generateUuid() {
                    var d = new Date().getTime();
                    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
                    });
                    return uuid;
                }

                var uniqId = angular.copy(generateUuid());

                var numberOfPages = function (listLength, pageSize) {
                    return Math.ceil(listLength / pageSize);
                }

                element.attr("id", "id_" + uniqId);

                element.prepend("<thead><tr></tr></thead>");
                //#endregion

                //#region Expanded pagination Template
                var pagination = "<nav id=\"id_" + uniqId + "\">" +
                "<ul class=\"pagination\">" +
                "<li>" +
                "<a class=\"previous\" aria-label=\"Previous\">" +
                "<span aria-hidden=\"true\">&laquo;</span>" +
                "</a>" +
                "</li>" +
                "<li class=\"repeat\"><a ng-click=\"goToPage(page.row);pageAction()\" ng-bind=\"page.row\"></a></li>" +
                "<li>" +
                "<a class=\"next\" aria-label=\"Next\">" +
                "<span aria-hidden=\"true\">&raquo;</span></a>" +
                "</li>" +
                "</ul>" +
                "</nav>";
                //#endregion

                //#region Expanded settings
                var currentPage = angular.isUndefined(scope.currentPage) ? 0 : scope.currentPage;
                var pageIndex = currentPage;
                var pageSize = scope.pageSize;
                var orderBy = element.find("tbody tr:first-child").data("orderby");
                var sortBy = element.find("tbody tr:first-child").data("asc");
                //#endregion

                //#region Expanded filters
                var filters = function (list, pageSizeIs, currentPageIs, order, sort) {
                    if (angular.isUndefined(pageSize)) {
                        pageSizeIs = list.length;
                    }

                    var filter1 = $filter("orderBy")(list, order, sort);
                    var filter2 = $filter("startFrom")(filter1, currentPageIs * pageSizeIs);
                    var filter3 = $filter("limitTo")(filter2, pageSizeIs);
                    return filter3;
                }
                //#endregion

                //#region Expanded update table
                scope.$watch("list", function (watchNewList) {
                    if (watchNewList) {

                        //console.log(watchNewList)

                        //if (angular.isUndefined(scope.pageSize)) {
                        //    scope.pageSize = watchNewList.length;
                        //}

                        var pages;
                        scope.paging = [];
                        if (!angular.isUndefined(scope.serverSideRecords)) {
                            pages = numberOfPages(scope.serverSideRecords, scope.pageSize);
                        } else {
                            pages = numberOfPages(watchNewList.length, scope.pageSize);
                        }
                        for (var i = 0; i < pages; i++) {
                            scope.paging.push({ row: i + 1 });
                        }
                        //set at first
                        scope.items = filters(watchNewList, pageSize, currentPage, orderBy, sortBy);
                    }
                }, true);
                //#endregion

                //#region Expanded orderTable
                scope.orderTable = function (index) {
                    var getOrderByName = element.find(".binding-to-" + index).text();
                    var span = element.find(".binding-to-" + index + " span");

                    element.find("thead tr th span").each(function () {
                        var findSpan = $(this);
                        findSpan.html(" <i class=\"fa fa-sort\"></i>");
                    });

                    orderBy = getOrderByName;
                    sortBy = !sortBy;

                    sortBy ? span.html(" <i class=\"fa fa-sort-alpha-desc\"></i>") : span.html(" <i class=\"fa fa-sort-alpha-asc\"></i>");

                    scope.items = filters(scope.list, pageSize, currentPage, orderBy, sortBy);

                    scope.pageAction();
                }

                //#endregion

                //#region Expanded Pagination actions
                scope.previousPage = function () {
                    var getCurrentPage = currentPage;

                    if (getCurrentPage <= 0) {
                        return false;
                    } else {
                        currentPage--;
                        pageIndex = getCurrentPage - 1;
                        scope.items = filters(scope.list, pageSize, getCurrentPage - 1, orderBy, sortBy);
                    }
                    return false;
                }

                scope.goToPage = function (page) {
                    pageIndex = page - 1;
                    scope.items = filters(scope.list, pageSize, page - 1, orderBy, sortBy);
                }

                scope.nextPage = function () {
                    var getCurrentPage = currentPage;
                    var allPages = scope.paging.length;

                    if (getCurrentPage >= allPages - 1) {
                        return false;
                    } else {
                        currentPage++;
                        pageIndex = getCurrentPage + 1;
                        scope.items = filters(scope.list, pageSize, getCurrentPage + 1, orderBy, sortBy);
                    }
                    return false;
                }

                scope.pageAction = function () {
                    var object = {
                        orderByOn: orderBy,
                        orderType: sortBy,
                        pageSize: pageSize,
                        pageIndex: pageIndex
                    }
                    tableService.setAction(object);
                    scope.returnAction();
                }
                //#endregion

                //#region Expanded Table Settings
                var ngRepeat = element.find("tbody tr:first-child").attr("ng-repeat", "item in items");

                var bind = element.find("tbody tr td").each(function (index) {
                    var td = $(this);
                    var binding = td.data("binding");
                    var header = td.data("header");
                    var sortable = td.data("sortable");

                    if (!angular.isUndefined(binding)) {
                        td.html("<span ng-bind=\"item." + binding + "\"></span>");
                    }

                    element.find("thead tr:first-child").append("<th class=\"binding-to-" + index + "\">" + header + "</th>");

                    if (sortable) {
                        var ngClickHandler = element.find(".binding-to-" + index).attr("ng-click", "orderTable(" + index + ")");
                        element.find(".binding-to-" + index).append("<span><i class=\"fa fa-sort\"></i></span>");
                        $compile(ngClickHandler)(scope);
                    }

                });
                //#endregion

                //#region Expanded $compile
                if (!angular.isUndefined(scope.pageSize)) {
                    element.after(pagination);
                    var previous = $("nav#id_" + uniqId + " .previous").attr("ng-click", "previousPage()");
                    var pageing = $("nav#id_" + uniqId + " .repeat").attr("ng-repeat", "page in paging");
                    var next = $("nav#id_" + uniqId + " .next").attr("ng-click", "nextPage()");
                    $compile(previous)(scope);
                    $compile(pageing)(scope);
                    $compile(next)(scope);
                }

                $compile(ngRepeat)(scope);
                $compile(bind)(scope);
                //#endregion
            }
        }
    }
}]);

dataTable.service("tableService", function () {
    var data;
    this.setAction = function (info) {
        data = info;
    }

    this.getAction = function () {
        return data;
    }
});

dataTable.filter("startFrom", function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});