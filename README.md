# AngularDataTable
Bind Data in the table

# index.html

```html
<!DOCTYPE html>
<html ng-app="app" ng-controller="ctrl as self">
<head>
    <title></title>
    <link href="Content/bootstrap.css" rel="stylesheet" />
    <link href="Content/font-awesome.css" rel="stylesheet" />
    <link href="Content/data-table.css" rel="stylesheet" />
    <link href="Content/style.css" rel="stylesheet" />
</head>
<body>
<div class="container">
    <table class="table table-bordered"
           data-table
           data-list="self.array"
           data-filter="true"
           data-lang="fa">
        <tbody>
            <tr data-orderby="name" data-asc="false">
                <td data-header-source="name" data-header="name" data-binding="name" data-sortable="true"></td>
                <td data-header="action">
                    <a click="add" click-params="[item]">add</a>
                </td>
            </tr>
        </tbody>
    </table>
</div>

    <script src="Scripts/jquery-2.2.4.js"></script>
    <script src="Scripts/angular.js"></script>
    <script src="Scripts/data-table.js"></script>
</body>
</html>

```

# controller.js
```javascript
        var app = angular.module("app", ["dataTable"]);

        app.controller("ctrl", ["$scope", "$http", "tableFactory", "tableService", function ($scope, $http, tableFactory, tableService) {
            var self = this;
            tableFactory.set(self);

            self.array = [
                { name: "A" },
                { name: "A2" },
                { name: "A3" },
                { name: "A4" }
            ];

            $scope.filter = {
                fields: [
                     { name: "name", filter: true, setup: { title: "name", type: "text" } },
                     { name: "username", filter: false, setup: { title: "username", type: "text" } }
                ]
            }
            
            $scope.pageOnChange = function () {
                console.log(tableService.getAction());
            }

            self.add = function (item) {
                console.log(item);
            }
        }]);
```

# tableParams

<ul>
  <li>data-table: 'directive name'</li>
  <li>data-list: 'array'</li>
  <li>data-current-page: 'int'</li>
  <li>data-page-size: 'int'</li>
  <li>data-return-action: 'function return tableService.getAction()'</li>
  <li>data-server-side-records: "int" > if this set, pagination numbers will change by server data records length, else pagination number eq array length</li>
  <li>data-filter: 'bool'</li>
  <li>data-filter-by: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-filter-advance: 'model'</li>
  <li>data-lang: "en/fa"</li>
</ul>


# tr Params

default sortBy and orderBy when table start:
<ul>
  <li>data-orderby: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-asc: 'bool'</li>
</ul>


# td Params

default sortBy and orderBy when table start:
<ul>
  <li>data-header: 'header title for each col'</li>
  <li>data-binding: 'some name from your abject params, EX: name OR lastName OR Id' from {name: "x", lastName: "Y", Id: 2}</li>
  <li>data-sortable: 'bool'</li>
  <li>data-header-source= 'string, what you bind in td for sorting'</li>
</ul>

# td binding
```html
<td data-header-source="Name" data-header="name" data-binding="name" data-sortable="true"></td>
<td data-header-source="Username" data-header="username" data-sortable="true">{{item.username}}</td>
<td data-header="action">
        {{item.email}}
        <a href="{{item.id}}">btn</a>
        <a click="add" click-params="[item]">action</a>
</td>
```

# filter model

```javascript
  var options = [
        { name: "manager", value: 0 },
        { name: "user", value: 1 }
  ];

   $scope.filter = {
        fields: [
                { name: "name", filter: true, setup: { title: "name", type: "text" } },
                { name: "role", filter: true, setup: { title: "role", type: "select", options: options } }
                ]
   }
```
