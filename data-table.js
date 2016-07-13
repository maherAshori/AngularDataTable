/*
 DataTable v1.0.3
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
            returnAction: "&",
            filter: "=",
            filterBy: "@",
            filterAdvance: "=",
            lang: "@"
        },
        link: function (scope, element) {
            var version = angular.version;
            if (version.minor < 2 || version.dot < 0) {
                element.remove();
                console.error("data-table not work on " + angular.version.full + " version");
                console.warn("try use new version of angular 1.2.0 or uper");
                return false;
            } else {

                //#region Expanded language
                var languages = {
                    fa: { search: "جستجو کن", or: "یا", and: "و" },
                    en: { search: "search", or: "OR", and: "AND" }
                }

                if (!angular.isUndefined(scope.lang)) {
                    switch (scope.lang) {
                        case "en":
                            scope.language = languages.en;
                            break;
                        case "fa":
                            scope.language = languages.fa;
                            break;
                    }
                } else {
                    scope.language = languages.en;
                }
                //#endregion

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

                //#region Expanded filter Template
                var filter = "<div class=\"col-lg-4\"><div class=\"angular-data-table-filter\">" +
                    "<input type=\"text\" class=\"form-control filtering\" placeholder=\"{{language.search}}...\">" +
                    "</div></div><br>"

                var advanceFilter = "<div class=\"col-lg-4\">" +
                    "<div class=\"row\">" +
                    "<a class=\"btn btn-default show-hide\"><i class=\"fa fa-search\"></i></a>" +
                    "<div class=\"angular-data-table-filter\">" +
                        "<div class=\"repeat\">" +
                            "<div class=\"form-group\"><input type=\"text\" ng-model=\"filter.value\" ng-if=\"filter.setup.type == 'text'\" ng-change=\"onChange(filter.name,filter.value)\" class=\"form-control filtering\" placeholder=\"{{filter.setup.title}}\"></div>" +
                            "<div class=\"form-group\"><select class=\"form-control\" ng-if=\"filter.setup.type == 'select'\" ng-model=\"filter.value\" ng-options=\"option as option.name for option in filter.setup.options\" ng-change=\"onChange(filter.name,filter.value)\"></select></div>" +
                        "</div>" +
                        "<div class=\"condition\">" +
                        "<a class=\"btn btn-primary or\">{{language.or}}</a> <a class=\"btn btn-primary and\">{{language.and}}</a>" +
                        "</div>" +
                    "<hr>" +
                        "<button class=\"btn btn-primary search\">{{language.search}}</button>" +
                        "</div>" +
                    "</div>" +
                    "</div>"
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
                    var source = element.find(".binding-to-" + index).data("source");
                    element.find("thead tr th").each(function () {
                        var findSpan = $(this).find("span");
                        findSpan.html(" <i class=\"fa fa-sort\"></i>");
                    });

                    orderBy = source;
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
                        pageIndex: pageIndex,
                        filters: scope.advanceFilters
                    }
                    tableService.setAction(object);
                    scope.returnAction();
                }
                //#endregion

                //#region Expanded Table Settings
                var ngRepeat = element.find("tbody tr:first-child").attr("ng-repeat", "item in items");

                if (scope.filter) {
                    ngRepeat = element.find("tbody tr:first-child").attr("ng-repeat", "item in items | filter:filtering");
                }

                var bind = element.find("tbody tr td").each(function (index) {
                    var td = $(this);
                    var binding = td.data("binding");
                    var headerSource = td.data("header-source");
                    var header = td.data("header");
                    var sortable = td.data("sortable");

                    if (!angular.isUndefined(binding)) {
                        td.html("<span ng-bind=\"item." + binding + "\"></span>");
                    }

                    element.find("thead tr:first-child").append("<th data-source=\"" + headerSource + "\" class=\"binding-to-" + index + "\">" + header + "</th>");

                    if (sortable) {
                        var ngClickHandler = element.find(".binding-to-" + index).attr("ng-click", "orderTable(" + index + ")");
                        element.find(".binding-to-" + index).append("<span><i class=\"fa fa-sort\"></i></span>");
                        $compile(ngClickHandler)(scope);
                    }

                });
                //#endregion

                //#region Expanded searching
                scope.condition = function (condition) {
                    object.filters = [];
                    object.condition = condition
                }

                scope.getFilters = function () {
                    object.filters = scope.advanceFilters

                    tableService.setAction(object);
                    scope.returnAction();
                }
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

                if (scope.filter) {

                    if (!angular.isUndefined(scope.filterAdvance)) {
                        scope.advanceFilters = [];
                        element.before(advanceFilter);
                        var filtering1 = $(".angular-data-table-filter");
                        var filtersFields = scope.filterAdvance.fields;
                        var activefields = $filter("filter")(filtersFields, { filter: true }, true);
                        scope.advanceFilters = activefields;

                        var activeRepeat = filtering1.find(".repeat").attr("ng-repeat", "filter in advanceFilters");
                        var ngClickHandler = filtering1.find(".search").attr("ng-click", "getFilters()");
                        var conditionHandlerOr = filtering1.find(".condition .or").attr("ng-click", "condition(0)");
                        var conditionHandlerAnd = filtering1.find(".condition .and").attr("ng-click", "condition(1)");

                        var showHide = $(".show-hide").attr("ng-click", "filterBox = !filterBox");
                        var filterBox = filtering1.attr("ng-show", "filterBox");

                        var object = {
                            orderByOn: orderBy,
                            orderType: sortBy,
                            pageSize: pageSize,
                            pageIndex: pageIndex,
                            condition: 1,
                            filters: []
                        };

                        $compile(activeRepeat)(scope);
                        $compile(ngClickHandler)(scope);
                        $compile(conditionHandlerOr)(scope);
                        $compile(conditionHandlerAnd)(scope);
                        $compile(showHide)(scope);
                        $compile(filterBox)(scope);

                    } else {
                        element.before(filter);
                        var filtering2 = $(".angular-data-table-filter");

                        var bindToScope;

                        if (!angular.isUndefined(scope.filterBy)) {
                            bindToScope = filtering2.find(".filtering").attr("ng-model", "filtering." + scope.filterBy)
                        } else {
                            bindToScope = filtering2.find(".filtering").attr("ng-model", "filtering")
                        }

                        $compile(bindToScope)(scope);
                    }
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