# AngularDataTable
Bind Data in the table

# index.html

```html
        <table class="table table-bordered"
        <table class="table table-bordered"
               data-table
               data-list="list"
               data-current-page="0"
               data-page-size="5"
               data-return-action="pageOnChange()"
               data-server-side-records="100">
            <tbody>
                <tr data-orderby="name" data-asc="false">
                    <td data-header="name" data-binding="name" data-sortable="true"></td>
                    <td data-header="username" data-sortable="true">{{item.username}}</td>
                    <td data-header="actions">
                        {{item.email}}
                        <a href="{{item.id}}">btn</a>
                    </td>
                </tr>
            </tbody>
        </table>
```

# controller.js
```javascript
        var app = angular.module("app", ["dataTable"]);

        app.controller("ctrl", function ($scope, tableService, $http) {
            var root = "http://jsonplaceholder.typicode.com";

            $scope.list = [];

            $http.get(root + "/users").success(function (data) {
                $scope.list = data;
            });

            $scope.pageOnChange = function () {
                console.log(tableService.getAction());
            }
        });
```

# tableParams

<ul>
  <li>data-table: 'directive name'</li>
  <li>data-list: 'array'</li>
  <li>data-current-page: 'int'</li>
  <li>data-page-size: 'int'</li>
  <li>data-return-action: 'function return tableService.getAction()'</li>
  <li>data-server-side-records: "int" > if this set, pagination numbers will change by server data records length, else pagination number eq array length</li>
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
</ul>

# td binding
```html
 <td data-header="name" data-binding="name" data-sortable="true"></td>
 <td data-header="username" data-sortable="true">{{item.username}}</td>
 <td data-header="actions">
    {{item.email}}
    <a href="{{item.id}}">btn</a>
  </td>
```

